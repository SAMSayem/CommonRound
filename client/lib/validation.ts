import { z } from "zod";
import { EVENT_TYPES } from "@/lib/types";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter a name with at least 2 characters.").max(60, "Name is too long."),
  email: z.email("Enter a valid email address."),
  photoUrl: z.union([z.literal(""), z.url("Enter a valid image URL.")]).optional(),
  password: z.string()
    .min(6, "Password must contain at least 6 characters.")
    .regex(/[a-z]/, "Add at least one lowercase letter.")
    .regex(/[A-Z]/, "Add at least one uppercase letter."),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(6, "Password must contain at least 6 characters."),
});

export const eventSchema = z.object({
  title: z.string().trim().min(8, "Use at least 8 characters for the title.").max(90, "Title must be 90 characters or fewer."),
  description: z.string().trim().min(30, "Add a little more detail (at least 30 characters).")
    .max(1200, "Description must be 1,200 characters or fewer."),
  eventType: z.enum(EVENT_TYPES),
  imageUrl: z.url("Enter a valid image URL."),
  location: z.string().trim().min(5, "Add a more specific location.").max(160, "Location is too long."),
  eventDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Choose a valid date and time.")
    .refine((value) => new Date(value).getTime() > Date.now(), "The event date must be in the future."),
});
