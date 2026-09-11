import "server-only";
import Groq from "groq-sdk";

let client: Groq | undefined;

export function getGroq() {
  if (!process.env.GROQ_API_KEY_1) {
    throw new Error("GROQ_API_KEY_1 is not configured");
  }

  client ??= new Groq({ apiKey: process.env.GROQ_API_KEY_1 });
  return client;
}
