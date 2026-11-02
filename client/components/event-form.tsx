"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ImagePlus, MapPin, CalendarDays, Sparkles } from "lucide-react";
import { EVENT_TYPES, type CommunityEvent, type EventInput } from "@/lib/types";
import { eventSchema } from "@/lib/validation";

function toLocalDateTime(value?: string) {
  const date = value ? new Date(value) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

const blankForm = {
  title: "",
  description: "",
  eventType: "Community Support" as EventInput["eventType"],
  imageUrl: "",
  location: "",
  eventDate: toLocalDateTime(),
};

export function EventForm({
  initialEvent,
  submitLabel = "Publish event",
  onSubmit,
  onCancel,
}: {
  initialEvent?: CommunityEvent;
  submitLabel?: string;
  onSubmit: (values: EventInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState(() => initialEvent ? {
    title: initialEvent.title,
    description: initialEvent.description,
    eventType: initialEvent.eventType,
    imageUrl: initialEvent.imageUrl,
    location: initialEvent.location,
    eventDate: toLocalDateTime(initialEvent.eventDate),
  } : blankForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const imageValid = useMemo(() => {
    try { return Boolean(form.imageUrl && new URL(form.imageUrl)); } catch { return false; }
  }, [form.imageUrl]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value } as typeof form));
    setErrors((current) => ({ ...current, [key]: "" }));
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedDate = new Date(form.eventDate);
    const eventDate = Number.isNaN(parsedDate.getTime()) ? form.eventDate : parsedDate.toISOString();
    const parsed = eventSchema.safeParse({ ...form, eventDate });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      setFormError("A few details need your attention before this can go live.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await onSubmit(parsed.data);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="event-form" onSubmit={handleSubmit} noValidate>
      <div className="form-intro"><span className="mini-icon"><Sparkles size={18} /></span><div><strong>Make room for good.</strong><p>Clear details help the right people find their way to you.</p></div></div>
      {formError && <div className="form-alert" role="alert">{formError}</div>}
      <div className="form-grid">
        <label className="field field-span-2"><span>Event title <b>*</b></span><input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. A warmer winter for Mirpur" maxLength={90} />{errors.title && <small className="field-error">{errors.title}</small>}</label>
        <label className="field"><span>What kind of action? <b>*</b></span><select value={form.eventType} onChange={(e) => update("eventType", e.target.value)}>{EVENT_TYPES.map((type) => <option value={type} key={type}>{type}</option>)}</select>{errors.eventType && <small className="field-error">{errors.eventType}</small>}</label>
        <label className="field"><span>When are we meeting? <b>*</b></span><div className="input-with-icon"><CalendarDays size={17} /><input type="datetime-local" min={toLocalDateTime()} value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} /></div>{errors.eventDate && <small className="field-error">{errors.eventDate}</small>}</label>
        <label className="field field-span-2"><span>Where will it happen? <b>*</b></span><div className="input-with-icon"><MapPin size={17} /><input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Neighbourhood, area, city" maxLength={160} /></div>{errors.location && <small className="field-error">{errors.location}</small>}</label>
        <label className="field field-span-2"><span>Tell people what to expect <b>*</b></span><textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Share the purpose, who this helps, what volunteers will do, and anything they should bring…" rows={5} maxLength={1200} /> <span className="field-foot"><small>{form.description.length}/1,200 characters</small>{errors.description && <small className="field-error">{errors.description}</small>}</span></label>
        <label className="field field-span-2"><span>Event cover image URL <b>*</b></span><div className="input-with-icon"><ImagePlus size={17} /><input type="url" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://your-image-link.com/photo.jpg" /></div>{errors.imageUrl && <small className="field-error">{errors.imageUrl}</small>}</label>
        {imageValid && <div className="image-preview field-span-2"><img src={form.imageUrl} alt="Event cover preview" /><span>Cover image preview</span></div>}
      </div>
      <div className="form-actions">
        {onCancel && <button type="button" className="button button-ghost" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="button button-dark" disabled={submitting}>{submitting ? "Saving your event…" : submitLabel}<span className="button-arrow">↗</span></button>
      </div>
    </form>
  );
}
