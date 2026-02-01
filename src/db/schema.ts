import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  varchar,
  serial,
} from "drizzle-orm/pg-core";

export const signupTypeEnum = pgEnum("signup_type", ["agent", "human"]);
export const roleInterestEnum = pgEnum("role_interest", [
  "buyer",
  "seller",
  "both",
]);

export const waitlistSignups = pgTable("waitlist_signups", {
  id: serial("id").primaryKey(),
  signupType: signupTypeEnum("signup_type").notNull(),
  moltbookUsername: varchar("moltbook_username", { length: 100 }),
  email: text("email"),
  roleInterest: roleInterestEnum("role_interest").notNull(),
  xUsername: varchar("x_username", { length: 100 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
