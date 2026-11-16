import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  kakaoId: text("kakao_id"),
  profileImageUrl: text("profile_image_url"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  status: text("status", { enum: ["pending", "active", "disabled"] }).notNull().default("pending"),
  emailVerifiedAt: integer("email_verified_at"),
  sessionVersion: integer("session_version").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [uniqueIndex("users_email_unique").on(table.email), uniqueIndex("users_kakao_id_unique").on(table.kakaoId)]);

export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  expiresAt: integer("expires_at").notNull(),
});

export const aiConversations = sqliteTable("ai_conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  mode: text("mode", { enum: ["parent", "practice"] }).notNull(),
  model: text("model").notNull(),
  messagesJson: text("messages_json").notNull(),
  revision: integer("revision").notNull().default(1),
  lastTurnId: text("last_turn_id").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [index("ai_conversations_user_updated_idx").on(table.userId, table.updatedAt)]);

export const aiVoiceSessions = sqliteTable("ai_voice_sessions", {
  voice: text("voice").notNull().default("marin"),
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  conversationId: text("conversation_id").notNull(),
  callId: text("call_id").notNull(),
  mode: text("mode", { enum: ["parent", "practice"] }).notNull(),
  revision: integer("revision").notNull(),
  status: text("status", { enum: ["created", "active", "standby", "retiring", "ended"] }).notNull().default("created"),
  renewable: integer("renewable", { mode: "boolean" }).notNull().default(false),
  continuationOf: text("continuation_of"),
  observerId: text("observer_id"),
  nextObserverId: text("next_observer_id"),
  nextObserverReady: integer("next_observer_ready", { mode: "boolean" }).notNull().default(false),
  nextObserverAt: integer("next_observer_at").notNull().default(0),
  observerStateJson: text("observer_state_json").notNull().default(""),
  warmPending: integer("warm_pending", { mode: "boolean" }).notNull().default(false),
  warmRequestId: text("warm_request_id"),
  warmReady: integer("warm_ready", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
  expiresAt: integer("expires_at").notNull(),
}, (table) => [index("ai_voice_sessions_user_expiry_idx").on(table.userId, table.expiresAt), uniqueIndex("ai_voice_sessions_user_active_unique").on(table.userId).where(sql`status in ('created', 'active')`), uniqueIndex("ai_voice_sessions_continuation_unique").on(table.continuationOf)]);

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
}, (table) => [uniqueIndex("categories_slug_unique").on(table.slug)]);

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
}, (table) => [uniqueIndex("tags_slug_unique").on(table.slug)]);

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  contentJson: text("content_json").notNull(),
  contentText: text("content_text").notNull().default(""),
  coverImageUrl: text("cover_image_url"),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  level: text("level", { enum: ["beginner", "intermediate", "advanced"] }).notNull().default("beginner"),
  source: text("source", { enum: ["member", "paul", "import"] }).notNull().default("member"),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  visibility: text("visibility", { enum: ["public", "private"] }).notNull().default("private"),
  publishedAt: integer("published_at"),
  version: integer("version").notNull().default(1),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [uniqueIndex("posts_slug_unique").on(table.slug), index("posts_author_idx").on(table.authorId), index("posts_public_idx").on(table.status, table.visibility, table.publishedAt)]);

export const postRevisions = sqliteTable("post_revisions", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  contentJson: text("content_json").notNull(),
  version: integer("version").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [uniqueIndex("post_revision_version_unique").on(table.postId, table.version)]);

export const postTags = sqliteTable("post_tags", {
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => [primaryKey({ columns: [table.postId, table.tagId] })]);

export const mediaAssets = sqliteTable("media_assets", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("media_owner_idx").on(table.ownerId)]);

export const learningProgress = sqliteTable("learning_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["started", "completed"] }).notNull().default("started"),
  completedAt: integer("completed_at"),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [uniqueIndex("progress_user_post_unique").on(table.userId, table.postId)]);

export const lessonLibrary = sqliteTable("lesson_library", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull(),
  saved: integer("saved", { mode: "boolean" }).notNull().default(false),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  lastViewedAt: integer("last_viewed_at"),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [uniqueIndex("lesson_library_user_lesson_unique").on(table.userId, table.lessonId)]);

export const quizAttempts = sqliteTable("quiz_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  submittedAnswer: text("submitted_answer").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("quiz_user_post_idx").on(table.userId, table.postId)]);

export const childProfiles = sqliteTable("child_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ageMonths: integer("age_months").notNull().default(16),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [uniqueIndex("child_profiles_user_unique").on(table.userId)]);

export const playRecords = sqliteTable("play_records", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ageMonths: integer("age_months").notNull(),
  activityId: text("activity_id").notNull(),
  reaction: text("reaction", { enum: ["enjoyed", "noticed", "retry"] }).notNull(),
  note: text("note").notNull().default(""),
  playedAt: integer("played_at").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("play_records_user_date_idx").on(table.userId, table.playedAt)]);
