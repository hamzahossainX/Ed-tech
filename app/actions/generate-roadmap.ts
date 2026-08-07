"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { getGroq } from "@/lib/groq";

const promptSchema = z.string().trim().min(12, "Tell us a little more about your goal.").max(500);

const roadmapSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(500),
  estimatedDuration: z.string().min(2).max(50),
  milestones: z.array(z.object({
    title: z.string().min(3).max(120),
    description: z.string().min(10).max(500),
    duration: z.string().min(2).max(50),
    resources: z.array(z.object({
      title: z.string().min(2).max(100),
      url: z.url().refine((url) => url.startsWith("https://"), "Resource links must use HTTPS"),
    })).min(1).max(2),
  })).min(3).max(12),
});

export type GenerateRoadmapState = { error?: string };

const roadmapJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    estimatedDuration: { type: "string" },
    milestones: {
      type: "array",
      minItems: 3,
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          duration: { type: "string" },
          resources: {
            type: "array",
            minItems: 1,
            maxItems: 2,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: { type: "string" },
                url: { type: "string" },
              },
              required: ["title", "url"],
            },
          },
        },
        required: ["title", "description", "duration", "resources"],
      },
    },
  },
  required: ["title", "description", "estimatedDuration", "milestones"],
} as const;

export async function generateRoadmap(
  _previousState: GenerateRoadmapState,
  formData: FormData,
): Promise<GenerateRoadmapState> {
  const parsedPrompt = promptSchema.safeParse(formData.get("prompt"));
  if (!parsedPrompt.success) return { error: parsedPrompt.error.issues[0].message };

  let createdRoadmapId: string;
  try {
    const completion = await getGroq().chat.completions.create({
      model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: "You are an expert curriculum designer. Create practical, sequential learning roadmaps with measurable milestones. Respect the learner's stated time limit. For every milestone, include one or two real, high-quality HTTPS resources that directly teach that milestone. Prefer stable pages from official documentation, standards organizations, universities, MDN, or freeCodeCamp. Do not invent domains or URLs. Use a specific page URL rather than a generic homepage. Return only the requested JSON.",
        },
        { role: "user", content: parsedPrompt.data },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "learning_roadmap", strict: true, schema: roadmapJsonSchema },
      },
    });

    const content = completion.choices[0]?.message.content;
    if (!content) return { error: "The AI did not return a roadmap. Please try again." };
    const roadmap = roadmapSchema.parse(JSON.parse(content));
    const milestonesJson = JSON.stringify(roadmap.milestones);

    const result = await db.execute<{ id: string }>(sql`
      with new_roadmap as (
        insert into ai_roadmaps (prompt, title, description, estimated_duration)
        values (${parsedPrompt.data}, ${roadmap.title}, ${roadmap.description}, ${roadmap.estimatedDuration})
        returning id
      ), new_milestones as (
        insert into roadmap_milestones (roadmap_id, title, description, duration, resource_links, position)
        select
          new_roadmap.id,
          item.value->>'title',
          item.value->>'description',
          item.value->>'duration',
          item.value->'resources',
          item.ordinality::integer
        from new_roadmap
        cross join lateral jsonb_array_elements(${milestonesJson}::jsonb)
          with ordinality as item(value, ordinality)
      )
      select id from new_roadmap
    `);
    const roadmapId = result.rows[0]?.id;
    if (!roadmapId) return { error: "Could not save the generated roadmap." };
    createdRoadmapId = roadmapId;
  } catch (error) {
    console.error("Roadmap generation failed", error);
    return { error: "Roadmap generation failed. Check your AI configuration and try again." };
  }

  revalidatePath(`/roadmap/${createdRoadmapId}`);
  redirect(`/roadmap/${createdRoadmapId}`);
}
