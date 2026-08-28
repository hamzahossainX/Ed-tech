"use server";

import { eq, sql } from "drizzle-orm";
import Groq from "groq-sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getGroq } from "@/lib/groq";
import { getOrCreateGuestId } from "@/lib/guest";

const promptSchema = z.string().trim().min(12, "Tell us a little more about your goal.").max(500);

const milestoneSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(500),
  duration: z.string().min(2).max(50),
  resources: z.array(z.object({
    title: z.string().min(2).max(100),
    url: z.url().refine((url) => url.startsWith("https://"), "Resource links must use HTTPS"),
  })).min(1).max(2),
});

const advancedMilestoneSchema = milestoneSchema.extend({
  exhaustiveDeepDive: z.string().min(250).max(30000),
});

function createRoadmapSchema(isAdvanced: boolean) {
  return z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(500),
  estimatedDuration: z.string().min(2).max(50),
    milestones: z.array(isAdvanced ? advancedMilestoneSchema : milestoneSchema).min(3).max(isAdvanced ? 3 : 12),
  });
}

function createAiResponseSchema(isAdvanced: boolean) {
  return z.object({
    isValidTopic: z.boolean(),
    message: z.string().max(300),
    roadmap: createRoadmapSchema(isAdvanced).nullable(),
  });
}

export type GenerateRoadmapState = {
  success?: boolean;
  error?: string;
  warning?: string;
  limitReachedAt?: number;
};

const EDUCATIONAL_REFUSAL_MESSAGE =
  "I am an educational AI. Please enter a valid skill, subject, or career path you want to learn.";
const DAILY_GENERATION_LIMIT = 3;

function createRoadmapJsonSchema(isAdvanced: boolean) {
  const milestoneProperties = {
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
    ...(isAdvanced ? {
      exhaustiveDeepDive: { type: "string" },
    } : {}),
  };
  const milestoneRequired = ["title", "description", "duration", "resources"];
  if (isAdvanced) milestoneRequired.push("exhaustiveDeepDive");

  return {
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
            maxItems: isAdvanced ? 3 : 12,
            items: {
              type: "object",
              additionalProperties: false,
              properties: milestoneProperties,
              required: milestoneRequired,
            },
          },
        },
        required: ["title", "description", "estimatedDuration", "milestones"],
      }, { type: "null" }],
    },
  },
  required: ["isValidTopic", "message", "roadmap"],
  } as const;
}

export async function generateRoadmap(
  _previousState: GenerateRoadmapState,
  formData: FormData,
): Promise<GenerateRoadmapState> {
  const parsedPrompt = promptSchema.safeParse(formData.get("prompt"));
  if (!parsedPrompt.success) return { success: false, error: parsedPrompt.error.issues[0].message };
  const prompt = parsedPrompt.data;
  const isAdvanced = formData.get("isAdvanced") === "true";

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
      return { success: false, error: "Could not verify your daily allowance. Please try again." };
    }

    if (!reservation.rows[0]) return { success: false, error: "LIMIT_REACHED", limitReachedAt: Date.now() };
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
    async function requestRoadmap(client: Groq) {
      return client.chat.completions.create({
        model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
        temperature: 0.4,
        // The current Groq on-demand tier allows 8,000 TPM. The prompt plus
        // reserved completion tokens must remain below that hard limit.
        max_completion_tokens: isAdvanced ? 6500 : 5000,
        messages: [
          {
            role: "system",
            content: `You are an expert educational roadmap generator. First, strictly evaluate the user's input. If the input is NOT related to learning a skill, academic subject, technology, career path, or professional development (e.g., recipes, jokes, general chat, non-educational requests, or inappropriate content), you MUST refuse to generate a roadmap.

For an invalid topic, return only this JSON shape: {"isValidTopic":false,"message":"${EDUCATIONAL_REFUSAL_MESSAGE}","roadmap":null}. Do not answer the request, provide advice, or create roadmap content.

For a valid educational topic, return {"isValidTopic":true,"message":"","roadmap":{...}}. Create a practical, sequential roadmap and respect the learner's stated time limit. Every milestone must include one or two real, high-quality HTTPS resources that directly teach it. Prefer stable pages from official documentation, standards organizations, universities, MDN, or freeCodeCamp. Do not invent domains or URLs. Use specific page URLs rather than generic homepages.${isAdvanced ? " ADVANCED MODE MUST contain exactly 3 broad milestones, and EVERY milestone MUST include exhaustiveDeepDive. Generate an extremely detailed, comprehensive guide for each milestone in the exhaustiveDeepDive field using Markdown format. It MUST include: 1. A deep explanation of the core concepts. 2. Step-by-step practical implementation or code examples with fenced Markdown code blocks. 3. Top 3 common interview questions WITH detailed solutions. Make it feel like a complete chapter of a book. Use clear headings, lists, tables where useful, and technically accurate examples. Do not omit exhaustiveDeepDive from any milestone, and do not put the entire Markdown string inside an extra fenced code block." : " STANDARD MODE MUST contain 3 to 12 concise milestones and must not add exhaustiveDeepDive."} Return only JSON matching the requested schema.`,
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: isAdvanced ? "advanced_learning_roadmap" : "learning_roadmap", strict: true, schema: createRoadmapJsonSchema(isAdvanced) },
        },
      });
    }

    let completion;
    try {
      completion = await requestRoadmap(getGroq());
    } catch (primaryError) {
      console.warn("Primary API failed, switching to backup...");

      const backupApiKey = process.env.GROQ_BACKUP_API_KEY;
      if (!backupApiKey) {
        await releaseGuestReservation();
        console.error("Primary Groq API failed and GROQ_BACKUP_API_KEY is not configured", primaryError);
        return {
          success: false,
          error: "The AI service is temporarily unavailable. Please try again shortly.",
        };
      }

      try {
        const backupClient = new Groq({ apiKey: backupApiKey });
        completion = await requestRoadmap(backupClient);
      } catch (backupError) {
        await releaseGuestReservation();
        console.error("Both primary and backup Groq API requests failed", {
          primaryError,
          backupError,
        });
        return {
          success: false,
          error: "Both AI services are temporarily unavailable. Please try again shortly.",
        };
      }
    }

    const rawContent = completion.choices[0]?.message.content;
    if (!rawContent) throw new Error("The AI did not return a roadmap.");
    if (process.env.NODE_ENV === "development") console.log("RAW AI RESPONSE:", rawContent);
    const aiResponse = createAiResponseSchema(isAdvanced).parse(JSON.parse(rawContent));
    if (!aiResponse.isValidTopic || !aiResponse.roadmap) {
      await releaseGuestReservation();
      return {
        success: false,
        warning: aiResponse.message.trim() || EDUCATIONAL_REFUSAL_MESSAGE,
      };
    }

    const roadmap = aiResponse.roadmap;
    const milestonesJson = JSON.stringify(roadmap.milestones);

    const result = isAdvanced
      ? await db.execute<{ id: string }>(sql`
          with new_roadmap as (
            insert into ai_roadmaps (prompt, title, description, estimated_duration)
            values (${prompt}, ${roadmap.title}, ${roadmap.description}, ${roadmap.estimatedDuration})
            returning id
          ), new_milestones as (
            insert into roadmap_milestones (roadmap_id, title, description, duration, resource_links, exhaustive_deep_dive, position)
            select new_roadmap.id, item.value->>'title', item.value->>'description', item.value->>'duration',
              item.value->'resources', item.value->>'exhaustiveDeepDive', item.ordinality::integer
            from new_roadmap
            cross join lateral jsonb_array_elements(${milestonesJson}::jsonb) with ordinality as item(value, ordinality)
          )
          select id from new_roadmap
        `)
      : await db.execute<{ id: string }>(sql`
          with new_roadmap as (
            insert into ai_roadmaps (prompt, title, description, estimated_duration)
            values (${prompt}, ${roadmap.title}, ${roadmap.description}, ${roadmap.estimatedDuration})
            returning id
          ), new_milestones as (
            insert into roadmap_milestones (roadmap_id, title, description, duration, resource_links, position)
            select new_roadmap.id, item.value->>'title', item.value->>'description', item.value->>'duration',
              item.value->'resources', item.ordinality::integer
            from new_roadmap
            cross join lateral jsonb_array_elements(${milestonesJson}::jsonb) with ordinality as item(value, ordinality)
          )
          select id from new_roadmap
        `);
    const roadmapId = result.rows[0]?.id;
    if (!roadmapId) throw new Error("Could not save the generated roadmap.");
    createdRoadmapId = roadmapId;
  } catch (error) {
    await releaseGuestReservation();
    console.error("🔥 GROQ API OR PARSING ERROR:", error);
    return {
      success: false,
      error: "Roadmap generation is temporarily unavailable.",
    };
  }

  revalidatePath(`/roadmap/${createdRoadmapId}`);
  redirect(`/roadmap/${createdRoadmapId}`);
}
