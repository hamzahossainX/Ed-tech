"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { aiRoadmaps, roadmapMilestones } from "@/db/schema";
import { db } from "@/db";
import { requireSignedInEmail } from "@/lib/require-session";

export async function toggleMilestone(milestoneId: string, completed: boolean) {
  await requireSignedInEmail();
  const id = z.string().uuid().parse(milestoneId);

  const [updated] = await db.update(roadmapMilestones)
    .set({ isCompleted: completed, completedAt: completed ? new Date() : null })
    .where(eq(roadmapMilestones.id, id))
    .returning({ id: roadmapMilestones.id, roadmapId: roadmapMilestones.roadmapId });

  if (!updated) throw new Error("Milestone not found");
  await db.update(aiRoadmaps).set({ updatedAt: sql`now()` }).where(eq(aiRoadmaps.id, sql`(select roadmap_id from roadmap_milestones where id = ${id}::uuid)`));
  revalidatePath(`/roadmap/${updated.roadmapId}`);
  return { success: true };
}
