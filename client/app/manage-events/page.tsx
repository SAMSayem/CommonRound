"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Edit3, Plus, Trash2, X } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { PageSkeleton, EmptyState, SectionHeading } from "@/components/ui";
import { EventForm } from "@/components/event-form";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/toast-provider";
import type { CommunityEvent, EventInput } from "@/lib/types";
import { formatEventDate } from "@/components/event-card";

function ManageEventsContent() {
  const { notify } = useToast();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<CommunityEvent | null>(null);
  const [deleting, setDeleting] = useState<CommunityEvent | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = () => {
    setLoading(true);
    apiRequest<CommunityEvent[]>("/api/me/events", { authenticated: true })
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load your events."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateEvent = async (values: EventInput) => {
    if (!editing) return;
    await apiRequest<CommunityEvent>(`/api/events/${editing._id}`, { method: "PATCH", authenticated: true, body: JSON.stringify(values) });
    setEditing(null);
    notify("Your event has been updated.", "success");
    load();
  };

  const deleteEvent = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await apiRequest(`/api/events/${deleting._id}`, { method: "DELETE", authenticated: true });
      setEvents((current) => current.filter((event) => event._id !== deleting._id));
      notify("Event deleted. Thanks for keeping things up to date.", "success");
      setDeleting(null);
    } catch (err) {
      notify(err instanceof Error ? err.message : "This event could not be deleted.", "error");
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <main className="page-wrap dashboard-page">
      <div className="dashboard-heading"><div><p className="eyebrow">YOUR INITIATIVES</p><h1>Things you've<br /><em>set in motion.</em></h1><p>Keep your event details fresh and make it easy for people to show up.</p></div><Link href="/create-event" className="button button-dark"><Plus size={17} /> Create a new event</Link></div>
      <div className="dashboard-count-line"><span>{loading ? "Loading your events…" : `${events.length} ${events.length === 1 ? "event" : "events"} created by you`}</span><span className="dashboard-count-tag">YOUR ORGANISER SPACE</span></div>
      {loading ? <PageSkeleton /> : error ? <div className="inline-error"><p>{error}</p><button className="button button-outline" onClick={load}>Try again</button></div> : events.length ? <div className="manage-list">{events.map((event) => <article className="manage-event-row" key={event._id}><img src={event.imageUrl} alt="" /><div className="manage-event-info"><span className="event-type-text">{event.eventType}</span><h3>{event.title}</h3><div className="manage-event-meta"><span><CalendarDays size={14} /> {formatEventDate(event.eventDate)}</span><span>↗ {event.participantsCount ?? 0} joined</span></div></div><div className="manage-event-actions"><Link href={`/events/${event._id}`} className="button button-small button-outline">Preview <ArrowUpRight size={14} /></Link><button className="icon-button edit-icon" onClick={() => setEditing(event)} aria-label={`Edit ${event.title}`}><Edit3 size={17} /></button><button className="icon-button delete-icon" onClick={() => setDeleting(event)} aria-label={`Delete ${event.title}`}><Trash2 size={17} /></button></div></article>)}</div> : <EmptyState icon={<CalendarDays size={26} />} title="Your organiser story starts here." description="Create your first event and invite your neighbours to take part." action={<Link href="/create-event" className="button button-dark">Create your first event <ArrowUpRight size={16} /></Link>} />}

      {editing && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditing(null); }}><div className="modal-card edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title"><div className="modal-heading"><div><p className="eyebrow">MAKE IT EVEN BETTER</p><h2 id="edit-title">Edit your event</h2></div><button className="icon-button" onClick={() => setEditing(null)} aria-label="Close editor"><X size={19} /></button></div><EventForm key={editing._id} initialEvent={editing} submitLabel="Save changes" onSubmit={updateEvent} onCancel={() => setEditing(null)} /></div></div>}
      {deleting && <div className="modal-backdrop"><div className="confirm-card" role="dialog" aria-modal="true" aria-labelledby="delete-title"><span className="confirm-symbol">!</span><h2 id="delete-title">Remove this event?</h2><p><strong>{deleting.title}</strong> will be deleted, including its participant list. This can't be undone.</p><div className="confirm-actions"><button className="button button-ghost" onClick={() => setDeleting(null)} disabled={deleteBusy}>Keep event</button><button className="button button-danger" onClick={deleteEvent} disabled={deleteBusy}>{deleteBusy ? "Deleting…" : "Yes, delete it"}</button></div></div></div>}
    </main>
  );
}

export default function ManageEventsPage() {
  return <ProtectedRoute><ManageEventsContent /></ProtectedRoute>;
}
