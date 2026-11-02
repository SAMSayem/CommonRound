"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { EVENT_TYPES, type CommunityEvent } from "@/lib/types";
import { EventCard } from "@/components/event-card";
import { EmptyState, SectionHeading } from "@/components/ui";

export default function EventsPage() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All causes");
  const [sort, setSort] = useState("soonest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    apiRequest<CommunityEvent[]>("/api/events?scope=upcoming&sort=soonest")
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load events."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const search = query.toLowerCase().trim();
    return events.filter((event) => {
      const matchesType = filter === "All causes" || event.eventType === filter;
      const matchesSearch = !search || `${event.title} ${event.location} ${event.description}`.toLowerCase().includes(search);
      return matchesType && matchesSearch;
    }).sort((a, b) => sort === "latest" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [events, filter, query, sort]);

  return (
    <main className="page-wrap events-page">
      <div className="page-hero page-hero-compact">
        <div><p className="eyebrow"><span className="eyebrow-dot" /> THE COMMUNITY CALENDAR</p><h1>Find your kind<br />of <em>good.</em></h1><p>From a cleaner street to a warmer winter, there's a place for you in the work happening around Dhaka.</p></div>
        <div className="page-hero-side"><span className="hero-side-asterisk">✳</span><span>MAKE TIME<br />FOR WHAT<br /><b>MATTERS.</b></span><div className="hero-side-line" /></div>
      </div>
      <section className="events-toolbar-section">
        <div className="events-toolbar">
          <div className="search-field"><Search size={18} /><input placeholder="Search by cause or neighbourhood…" value={query} onChange={(e) => setQuery(e.target.value)} /><kbd>⌘ K</kbd></div>
          <button className={`filter-toggle ${filtersOpen ? "selected" : ""}`} onClick={() => setFiltersOpen((open) => !open)}><SlidersHorizontal size={17} /> Filters <span>{filter !== "All causes" ? "1" : "0"}</span></button>
          <label className="sort-select"><span>Sort by</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="soonest">Soonest first</option><option value="latest">Recently added</option></select></label>
        </div>
        {filtersOpen && <div className="filter-panel"><div className="filter-panel-heading"><span><Filter size={15} /> FILTER BY CAUSE</span><button onClick={() => { setFilter("All causes"); setFiltersOpen(false); }}><X size={14} /> Reset</button></div><div className="filter-chips"><button className={filter === "All causes" ? "filter-chip active" : "filter-chip"} onClick={() => setFilter("All causes")}>All causes</button>{EVENT_TYPES.map((type) => <button key={type} className={filter === type ? "filter-chip active" : "filter-chip"} onClick={() => setFilter(type)}>{type}</button>)}</div></div>}
      </section>
      <section className="events-list-section">
        <div className="events-result-line"><span>{loading ? "Finding good things…" : `${filtered.length} ${filtered.length === 1 ? "opportunity" : "opportunities"} to get involved`}</span><span className="result-location"><CalendarDays size={14} /> Only upcoming events</span></div>
        {loading ? <div className="skeleton-grid">{Array.from({ length: 6 }).map((_, i) => <div className="skeleton-card" key={i}><div className="skeleton skeleton-image" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /><div className="skeleton skeleton-line" /></div>)}</div> : error ? <div className="inline-error"><p>{error}</p><button className="button button-outline" onClick={() => window.location.reload()}>Try again</button></div> : filtered.length ? <div className="event-grid">{filtered.map((event, index) => <EventCard event={event} index={index} key={event._id} />)}</div> : <EmptyState icon={<CalendarDays size={26} />} title="Nothing on the calendar just yet." description="Try another search or cause, or start an initiative of your own." action={<Link href="/create-event" className="button button-dark">Create an event <ArrowUpRight size={16} /></Link>} />}
      </section>
      <div className="events-bottom-note"><span>✳</span><p>Have a good idea? The best community events often start with one person and a simple invitation.</p><Link href="/create-event">Start something <ArrowUpRight size={15} /></Link></div>
    </main>
  );
}
