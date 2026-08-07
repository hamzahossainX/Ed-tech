import "server-only";
import Groq from "groq-sdk";

let client: Groq | undefined;

export function getGroq() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  client ??= new Groq({ apiKey: process.env.GROQ_API_KEY });
  return client;
}
