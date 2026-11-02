"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, HeartHandshake, MapPin } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { EmptyState, PageSkeleton } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { formatEventDate } from "@/components/event-card";
import type { CommunityEvent } from "@/lib/types";

function JoinedEventsContent() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<CommunityEvent[]>("/api/me/joined-events", { authenticated: true })
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load your joined events."))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = events.filter((event) => new Date(event.eventDate).getTime() > Date.now());
  const past = events.filter((event) => new Date(event.eventDate).getTime() <= Date.now());
  const list = (items: CommunityEvent[]) => <div className="joined-list">{items.map((event) => <article className="joined-row" key={event._id}><div className="joined-date-block"><span>{new Date(event.eventDate).toLocaleDateString("en-BD", { month: "short" }).toUpperCase()}</span><strong>{new Date(event.eventDate).getDate()}</strong></div><img src={event.imageUrl} alt="" /><div className="joined-info"><span className="event-type-text">{event.eventType}</span><h3>{event.title}</h3><div><span><CalendarDays size={13} /> {formatEventDate(event.eventDate)}</span><span><MapPin size={13} /> {event.location}</span></div></div><Link href={`/events/${event._id}`} className="joined-open" aria-label={`View ${event.title}`}><ArrowUpRight size={19} /></Link></article>)}</div>;

  return (
    <main className="page-wrap dashboard-page joined-page">
      <div className="dashboard-heading"><div><p className="eyebrow">YOUR GOOD DEEDS, IN MOTION</p><h1>Where you'll<br /><em>show up next.</em></h1><p>Every commitment counts. Here's the list of things you've signed up to be part of.</p></div><div className="joined-total"><HeartHandshake size={22} /><strong>{events.length.toString().padStart(2, "0")}</strong><span>YOUR<br />COMMITMENTS</span></div></div>
      {loading ? <PageSkeleton /> : error ? <div className="inline-error"><p>{error}</p></div> : !events.length ? <EmptyState icon={<HeartHandshake size={27} />} title="Your next good day is waiting." description="You haven't joined an event yet. Find a cause that speaks to you and save your spot." action={<Link href="/events" className="button button-dark">Explore upcoming events <ArrowUpRight size={16} /></Link>} /> : <div className="joined-sections"><section><div className="joined-section-heading"><h2>Coming up <span>{upcoming.length.toString().padStart(2, "0")}</span></h2><small>YOUR NEXT CHAPTER</small></div>{upcoming.length ? list(upcoming) : <div className="subtle-empty">No upcoming commitments yet. Your next one is out there.</div>}</section>{past.length > 0 && <section className="past-joined-section"><div className="joined-section-heading"><h2>Already happened <span>{past.length.toString().padStart(2, "0")}</span></h2><small>GOOD THINGS YOU SHOWED UP FOR</small></div>{list(past)}</section>}</div>}
    </main>
  );
}

export default function JoinedEventsPage() {
  return <ProtectedRoute><JoinedEventsContent /></ProtectedRoute>;
}
