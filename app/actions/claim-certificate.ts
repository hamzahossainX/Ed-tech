"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";

const roadmapIdSchema = z.string().uuid();
const userNameSchema = z.string().trim().min(2, "Enter your full name.").max(100, "Name must be 100 characters or fewer.");

export async function claimCertificate(roadmapId: string, userName: string) {
  const id = roadmapIdSchema.parse(roadmapId);
  const name = userNameSchema.parse(userName);

  // The predicates prevent certificates for empty or unfinished roadmaps.
  const result = await db.execute<{ id: string }>(sql`
    update ai_roadmaps as roadmap
    set user_name = ${name}, updated_at = now()
    where roadmap.id = ${id}::uuid
      and exists (
        select 1 from roadmap_milestones
        where roadmap_id = roadmap.id
      )
      and not exists (
        select 1 from roadmap_milestones
        where roadmap_id = roadmap.id and is_completed = false
      )
    returning roadmap.id
  `);

  if (!result.rows[0]) throw new Error("Complete every milestone before claiming a certificate.");

  revalidatePath(`/roadmap/${id}`);
  revalidatePath(`/certificate/${id}`);
  redirect(`/certificate/${id}`);
}
