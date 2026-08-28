import { z } from "zod";

export const ROADMAP_PROMPT_ERROR =
  "Please enter a concise, valid topic (max 80 characters).";

export const roadmapPromptSchema = z
  .string()
  .trim()
  .min(3, ROADMAP_PROMPT_ERROR)
  .max(80, ROADMAP_PROMPT_ERROR)
  .regex(/\p{L}/u, ROADMAP_PROMPT_ERROR);
