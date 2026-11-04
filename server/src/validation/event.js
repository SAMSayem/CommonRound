import { z } from "zod";

const eventTypes = ["Cleanup", "Plantation", "Donation", "Education", "Food Drive", "Health Camp", "Community Support"];

export const eventInputSchema = z.object({
  title: z.string().trim().min(8, "Title must be at least 8 characters.").max(90, "Title must be 90 characters or fewer."),
  description: z.string().trim().min(30, "Description must be at least 30 characters.").max(1200, "Description must be 1,200 characters or fewer."),
  eventType: z.enum(eventTypes),
  imageUrl: z.url("A valid image URL is required."),
  location: z.string().trim().min(5, "Location must be at least 5 characters.").max(160, "Location is too long."),
  eventDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), "A valid event date is required."),
});

export function validateFutureEvent(input) {
  const parsed = eventInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })) };
  }

  const eventDate = new Date(parsed.data.eventDate);
  if (eventDate.getTime() <= Date.now()) {
    return { success: false, errors: [{ field: "eventDate", message: "The event date must be in the future." }] };
  }

  return { success: true, data: { ...parsed.data, eventDate } };
}
