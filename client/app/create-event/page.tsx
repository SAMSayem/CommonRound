"use client";

import { ArrowLeft, ArrowUpRight, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { EventForm } from "@/components/event-form";
import { SectionHeading } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/toast-provider";
import type { CommunityEvent, EventInput } from "@/lib/types";

function CreateEventContent() {
  const router = useRouter();
  const { notify } = useToast();

  const createEvent = async (values: EventInput) => {
    await apiRequest<CommunityEvent>("/api/events", { method: "POST", authenticated: true, body: JSON.stringify(values) });
    notify("Your event is live. Let the good gather.", "success");
    router.push("/events");
  };

  return (
    <main className="page-wrap form-page">
      <Link href="/events" className="back-link"><ArrowLeft size={16} /> Back to the calendar</Link>
      <div className="form-page-heading"><p className="eyebrow">A GOOD IDEA STARTS SOMEWHERE</p><h1>Put something<br /><em>good in motion.</em></h1><p>Invite your neighbours into something that matters. Give them the details, and we'll help you find the people.</p><div className="form-page-mark"><HeartHandshake size={28} /></div></div>
      <section className="form-page-card"><SectionHeading eyebrow="YOUR EVENT, YOUR INVITATION" title="Let's make it happen." description="A few thoughtful details are all it takes to get started." /><EventForm onSubmit={createEvent} submitLabel="Publish this event" /></section>
      <div className="form-bottom-note"><span>✳</span><p>Keep it local, clear, and welcoming. The best invitations make everyone feel like they belong.</p><span className="note-signoff">THE COMMON GROUND WAY</span></div>
    </main>
  );
}

export default function CreateEventPage() {
  return <ProtectedRoute><CreateEventContent /></ProtectedRoute>;
}
