"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getGroq } from "@/lib/groq";
import { getOrCreateGuestId } from "@/lib/guest";

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

const aiResponseSchema = z.object({
  isValidTopic: z.boolean(),
  message: z.string().max(300),
  roadmap: roadmapSchema.nullable(),
});

export type GenerateRoadmapState = {
  error?: string;
  warning?: string;
  limitReachedAt?: number;
};

const EDUCATIONAL_REFUSAL_MESSAGE =
  "I am an educational AI. Please enter a valid skill, subject, or career path you want to learn.";
const DAILY_GENERATION_LIMIT = 3;

const roadmapJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    isValidTopic: { type: "boolean" },
    message: { type: "string" },
    roadmap: {
      anyOf: [{
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
      }, { type: "null" }],
    },
  },
  required: ["isValidTopic", "message", "roadmap"],
} as const;

export async function generateRoadmap(
  _previousState: GenerateRoadmapState,
  formData: FormData,
): Promise<GenerateRoadmapState> {
  const parsedPrompt = promptSchema.safeParse(formData.get("prompt"));
  if (!parsedPrompt.success) return { error: parsedPrompt.error.issues[0].message };
  const prompt = parsedPrompt.data;

  const session = await auth();
  const signedInUser = session?.user?.email
    ? await db.query.users.findFirst({
        where: eq(users.email, session.user.email),
        columns: { id: true, role: true },
      })
    : null;
  const isAdmin = signedInUser?.role === "admin";
  const usageId = isAdmin
    ? null
    : signedInUser
      ? `user:${signedInUser.id}`
      : `guest:${await getOrCreateGuestId()}`;

  if (usageId) {
    let reservation;
    try {
      reservation = await db.execute<{ generation_count: number }>(sql`
        insert into guest_usage (guest_id, generation_count)
        values (${usageId}, 1)
        on conflict (guest_id) do update
          set
            generation_count = case
              when guest_usage.created_at < (date_trunc('day', now() at time zone 'Asia/Dhaka') at time zone 'Asia/Dhaka') then 1
              else guest_usage.generation_count + 1
            end,
            created_at = case
              when guest_usage.created_at < (date_trunc('day', now() at time zone 'Asia/Dhaka') at time zone 'Asia/Dhaka') then now()
              else guest_usage.created_at
            end
          where
            guest_usage.created_at < (date_trunc('day', now() at time zone 'Asia/Dhaka') at time zone 'Asia/Dhaka')
            or guest_usage.generation_count < ${DAILY_GENERATION_LIMIT}
        returning generation_count
      `);
    } catch (error) {
      console.error("Could not check daily generation allowance", error);
      return { error: "Could not verify your daily allowance. Please try again." };
    }

    if (!reservation.rows[0]) return { error: "LIMIT_REACHED", limitReachedAt: Date.now() };
  }

  async function releaseGuestReservation() {
    if (!usageId) return;
    await db.execute(sql`
      update guest_usage
      set generation_count = greatest(generation_count - 1, 0)
      where guest_id = ${usageId}
    `).catch((rollbackError) => console.error("Could not release guest generation reservation", rollbackError));
  }

  let createdRoadmapId: string;
  try {
    async function requestRoadmap(retry = false) {
      return getGroq().chat.completions.create({
        model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: `You are an expert educational roadmap generator. First, strictly evaluate the user's input. If the input is NOT related to learning a skill, academic subject, technology, career path, or professional development (e.g., recipes, jokes, general chat, non-educational requests, or inappropriate content), you MUST refuse to generate a roadmap.

For an invalid topic, return only this JSON shape: {"isValidTopic":false,"message":"${EDUCATIONAL_REFUSAL_MESSAGE}","roadmap":null}. Do not answer the request, provide advice, or create roadmap content.

For a valid educational topic, return {"isValidTopic":true,"message":"","roadmap":{...}}. Create a practical, sequential roadmap with 3 to 12 measurable milestones and respect the learner's stated time limit. Every milestone must include one or two real, high-quality HTTPS resources that directly teach it. Prefer stable pages from official documentation, standards organizations, universities, MDN, or freeCodeCamp. Do not invent domains or URLs. Use specific page URLs rather than generic homepages. Return only JSON matching the requested schema.${retry ? " This is a schema-validation retry: re-evaluate the topic and ensure the response envelope and all roadmap fields match the schema." : ""}`,
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "learning_roadmap", strict: true, schema: roadmapJsonSchema },
        },
      });
    }

    let completion;
    try { completion = await requestRoadmap(); }
    catch { completion = await requestRoadmap(true); }

    const content = completion.choices[0]?.message.content;
    if (!content) throw new Error("The AI did not return a roadmap.");
    const aiResponse = aiResponseSchema.parse(JSON.parse(content));
    if (!aiResponse.isValidTopic || !aiResponse.roadmap) {
      await releaseGuestReservation();
      return {
        warning: aiResponse.message.trim() || EDUCATIONAL_REFUSAL_MESSAGE,
      };
    }

    const roadmap = aiResponse.roadmap;
    const milestonesJson = JSON.stringify(roadmap.milestones);

    const result = await db.execute<{ id: string }>(sql`
      with new_roadmap as (
        insert into ai_roadmaps (prompt, title, description, estimated_duration)
        values (${prompt}, ${roadmap.title}, ${roadmap.description}, ${roadmap.estimatedDuration})
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
    if (!roadmapId) throw new Error("Could not save the generated roadmap.");
    createdRoadmapId = roadmapId;
  } catch (error) {
    await releaseGuestReservation();
    console.error("Roadmap generation failed", error);
    return { error: "Roadmap generation failed. Check your AI configuration and try again." };
  }

  revalidatePath(`/roadmap/${createdRoadmapId}`);
  redirect(`/roadmap/${createdRoadmapId}`);
}
