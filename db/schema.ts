import { relations, sql } from "drizzle-orm";
import type { AdapterAccount } from "next-auth/adapters";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["student", "instructor", "admin"]);
export const courseStatus = pgEnum("course_status", ["draft", "published", "archived"]);

export type ResumeSkill = {
  name: string;
  courseTitle: string;
  moduleId: string;
  verifiedAt: string;
};

export type ResourceLink = {
  title: string;
  url: string;
};

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  legacyClerkId: text("clerk_id").unique(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date", withTimezone: true }),
  image: text("image"),
  password: text("password"),
  role: userRole("role").notNull().default("student"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccount["type"]>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })]);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
}, (table) => [primaryKey({ columns: [table.identifier, table.token] })]);

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  instructorId: uuid("instructor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  status: courseStatus("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const modules = pgTable("modules", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  skillName: text("skill_name").notNull(),
  position: integer("position").notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("module_course_position_idx").on(table.courseId, table.position)]);

export const completedModules = pgTable("completed_modules", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.moduleId] })]);

export const resumes = pgTable("resumes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  headline: text("headline").notNull().default("Aspiring professional"),
  summary: text("summary").notNull().default(""),
  skills: jsonb("skills").$type<ResumeSkill[]>().notNull().default(sql`'[]'::jsonb`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const aiRoadmaps = pgTable("ai_roadmaps", {
  id: uuid("id").defaultRandom().primaryKey(),
  userName: text("user_name"),
  prompt: text("prompt").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  estimatedDuration: text("estimated_duration").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const guestUsage = pgTable("guest_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  guestId: text("guest_id").notNull().unique(),
  generationCount: integer("generation_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const roadmapMilestones = pgTable("roadmap_milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  roadmapId: uuid("roadmap_id").notNull().references(() => aiRoadmaps.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  resourceLinks: jsonb("resource_links").$type<ResourceLink[]>().notNull().default(sql`'[]'::jsonb`),
  topicDetails: text("topic_details"),
  example: text("example"),
  interviewQuestions: jsonb("interview_questions").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  exhaustiveDeepDive: text("exhaustive_deep_dive"),
  position: integer("position").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("roadmap_milestone_position_idx").on(table.roadmapId, table.position)]);

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  courses: many(courses),
  completions: many(completedModules),
  resume: one(resumes),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const aiRoadmapsRelations = relations(aiRoadmaps, ({ many }) => ({
  milestones: many(roadmapMilestones),
}));

export const roadmapMilestonesRelations = relations(roadmapMilestones, ({ one }) => ({
  roadmap: one(aiRoadmaps, { fields: [roadmapMilestones.roadmapId], references: [aiRoadmaps.id] }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, { fields: [courses.instructorId], references: [users.id] }),
  modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, { fields: [modules.courseId], references: [courses.id] }),
  completions: many(completedModules),
}));
