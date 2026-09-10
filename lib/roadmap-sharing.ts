import {
  isRecoverableRoadmap,
  type RecoverableRoadmap,
} from "@/lib/roadmap-storage";

const SHARE_FORMAT_VERSION = 1;
const MAX_SHARE_PARAMETER_LENGTH = 48_000;
const MAX_DECODED_BYTES = 1_500_000;

type SharedRoadmapEnvelope = {
  version: typeof SHARE_FORMAT_VERSION;
  roadmap: RecoverableRoadmap;
};

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function readStreamWithLimit(
  stream: ReadableStream<Uint8Array>,
  maximumBytes: number,
) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel();
        throw new Error("Shared roadmap is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const result = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

function bytesToArrayBuffer(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

export async function encodeRoadmapForUrl(roadmap: RecoverableRoadmap) {
  const envelope: SharedRoadmapEnvelope = {
    version: SHARE_FORMAT_VERSION,
    roadmap,
  };
  const jsonBytes = new TextEncoder().encode(JSON.stringify(envelope));
  if (jsonBytes.byteLength > MAX_DECODED_BYTES) {
    throw new Error("Roadmap is too large to share as a link.");
  }

  let prefix = "plain";
  let payload = jsonBytes;

  if (typeof CompressionStream !== "undefined") {
    prefix = "gzip";
    const compressedStream = new Blob([bytesToArrayBuffer(jsonBytes)])
      .stream()
      .pipeThrough(new CompressionStream("gzip"));
    payload = await readStreamWithLimit(compressedStream, MAX_DECODED_BYTES);
  }

  const encoded = `${prefix}.${bytesToBase64Url(payload)}`;
  if (encoded.length > MAX_SHARE_PARAMETER_LENGTH) {
    throw new Error("Roadmap is too large to share as a link.");
  }
  return encoded;
}

export async function decodeRoadmapFromUrl(encoded: string) {
  if (!encoded || encoded.length > MAX_SHARE_PARAMETER_LENGTH) {
    throw new Error("Invalid shared roadmap.");
  }

  const separatorIndex = encoded.indexOf(".");
  if (separatorIndex < 1) throw new Error("Invalid shared roadmap.");

  const format = encoded.slice(0, separatorIndex);
  const payload = base64UrlToBytes(encoded.slice(separatorIndex + 1));
  let jsonBytes: Uint8Array;

  if (format === "gzip") {
    if (typeof DecompressionStream === "undefined") {
      throw new Error("This browser cannot open compressed roadmap links.");
    }
    const decompressedStream = new Blob([bytesToArrayBuffer(payload)])
      .stream()
      .pipeThrough(new DecompressionStream("gzip"));
    jsonBytes = await readStreamWithLimit(decompressedStream, MAX_DECODED_BYTES);
  } else if (format === "plain") {
    if (payload.byteLength > MAX_DECODED_BYTES) {
      throw new Error("Shared roadmap is too large.");
    }
    jsonBytes = payload;
  } else {
    throw new Error("Unsupported shared roadmap format.");
  }

  const parsed: unknown = JSON.parse(new TextDecoder().decode(jsonBytes));
  if (
    typeof parsed !== "object"
    || parsed === null
    || !("version" in parsed)
    || parsed.version !== SHARE_FORMAT_VERSION
    || !("roadmap" in parsed)
    || !isRecoverableRoadmap(parsed.roadmap)
  ) {
    throw new Error("Invalid shared roadmap.");
  }

  return parsed.roadmap;
}
