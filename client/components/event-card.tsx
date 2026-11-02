import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Users } from "lucide-react";
import type { CommunityEvent } from "@/lib/types";

export function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function EventCard({ event, index = 0 }: { event: CommunityEvent; index?: number }) {
  return (
    <article className="event-card" style={{ animationDelay: `${index * 55}ms` }}>
      <Link href={`/events/${event._id}`} className="event-card-image-link" aria-label={`View ${event.title}`}>
        <div className="event-card-image-wrap">
          <img src={event.imageUrl} alt={event.title} loading="lazy" />
          <span className="event-type-pill">{event.eventType}</span>
          <span className="image-arrow"><ArrowUpRight size={18} /></span>
        </div>
      </Link>
      <div className="event-card-body">
        <div className="event-card-date"><CalendarDays size={14} /> {formatEventDate(event.eventDate)}</div>
        <h3><Link href={`/events/${event._id}`}>{event.title}</Link></h3>
        <div className="event-card-meta"><span><MapPin size={14} /> {event.location}</span><span><Users size={14} /> {event.participantsCount ?? 0} joining</span></div>
        <div className="event-card-bottom"><span className="host-label">HOSTED BY <strong>{event.creatorName || "A neighbour"}</strong></span><Link href={`/events/${event._id}`} className="card-link">View details <ArrowUpRight size={15} /></Link></div>
      </div>
    </article>
  );
}
