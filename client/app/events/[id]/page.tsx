"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, Clock3, HeartHandshake, MapPin, ShieldCheck, Users } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/toast-provider";
import { PageSkeleton } from "@/components/ui";
import { formatEventDate } from "@/components/event-card";
import type { CommunityEvent } from "@/lib/types";

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { notify } = useToast();
  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const loadEvent = async () => {
    try {
      const result = await apiRequest<CommunityEvent>(`/api/events/${params.id}`);
      setEvent(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "This event could not be found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvent(); }, [params.id]);

  const joinEvent = async () => {
    if (!session?.user) {
      router.push(`/login?next=${encodeURIComponent(`/events/${params.id}`)}`);
      return;
    }
    setJoining(true);
    try {
      const result = await apiRequest<{ alreadyJoined?: boolean; participantsCount: number }>(`/api/events/${params.id}/join`, { method: "POST", authenticated: true });
      setEvent((current) => current ? { ...current, joined: true, participantsCount: result.participantsCount } : current);
      notify(result.alreadyJoined ? "You are already on the guest list." : "You're in. Thanks for showing up.", "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "We couldn't save your place.", "error");
    } finally {
      setJoining(false);
    }
  };

  if (loading || isPending) return <PageSkeleton />;
  if (error || !event) return <main className="page-wrap"><div className="not-found-card"><span>✳</span><h1>Looks like this one moved on.</h1><p>{error || "We couldn't find that event."}</p><Link href="/events" className="button button-dark">Back to events <ArrowUpRight size={16} /></Link></div></main>;

  const past = new Date(event.eventDate).getTime() <= Date.now();
  return (
    <main className="page-wrap detail-page">
      <Link href="/events" className="back-link"><ArrowLeft size={16} /> Back to all events</Link>
      <div className="detail-hero-image"><img src={event.imageUrl} alt={event.title} /><span className="detail-category">{event.eventType}</span><span className="detail-image-stamp">GOOD<br /><b>HAPPENS</b><br />HERE ✳</span></div>
      <div className="detail-layout">
        <article className="detail-main"><p className="eyebrow">A COMMUNITY INVITATION</p><h1>{event.title}</h1><div className="detail-meta-row"><span><CalendarDays size={16} /> {formatEventDate(event.eventDate)}</span><span><MapPin size={16} /> {event.location}</span><span><Users size={16} /> {event.participantsCount ?? 0} joining</span></div><div className="detail-divider" /><h2>What we're doing</h2><p className="detail-description">{event.description}</p><div className="organizer-card"><div className="organizer-avatar">{event.creatorName?.slice(0, 1).toUpperCase() || "N"}</div><div><small>PUT TOGETHER BY</small><strong>{event.creatorName || "A CommonGround neighbour"}</strong><span>Community organiser</span></div><ShieldCheck size={18} /></div></article>
        <aside className="join-card"><span className="join-card-kicker">YOUR NEXT GOOD DAY</span><div className="join-icon"><HeartHandshake size={23} /></div><h3>There's room<br />for one more.</h3><p>Bring your time, your energy, and a willingness to help. That's enough to get started.</p><div className="join-fact"><CalendarDays size={16} /><span><small>WHEN</small><b>{formatEventDate(event.eventDate)}</b></span></div><div className="join-fact"><MapPin size={16} /><span><small>WHERE</small><b>{event.location}</b></span></div><button className="button button-lime join-button" disabled={joining || past || Boolean(event.joined)} onClick={joinEvent}>{past ? "This event has passed" : event.joined ? <><Check size={17} /> You're on the list</> : joining ? "Saving your place…" : <>Join this event <ArrowUpRight size={17} /></>}</button>{!session?.user && <small className="join-footnote">You'll need to sign in before joining.</small>}{event.joined && <small className="join-footnote joined-note">You're all set. See you there!</small>}<div className="join-card-bottom"><Clock3 size={14} /> {past ? "Event completed" : "A little time can make a big difference."}</div></aside>
      </div>
    </main>
  );
}
