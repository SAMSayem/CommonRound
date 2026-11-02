"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpenCheck, CalendarDays, Check, HeartHandshake, Leaf, MapPin, ShieldCheck, Sprout, Users, Wheat } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { CommunityEvent } from "@/lib/types";
import { EventCard } from "@/components/event-card";
import { SectionHeading } from "@/components/ui";

const gallery = [
  { image: "https://vbd.com.bd/images/2025/10/batch-whatsapp-image-2025-10-11-at-215706-72cfb041jpg_1760522436.jpg", label: "A cleaner corner of the city", category: "NEIGHBOURHOOD CLEANUP" },
  { image: "https://i0.wp.com/obhizatrik.org/wp-content/uploads/2024/07/IMG-20240702-WA0014-1.jpg?fit=1600%2C1201&ssl=1", label: "Rooted in a greener future", category: "TREE PLANTING" },
  { image: "https://encdn.bd-pratidin.com/public/news_images/2025/10/03/1759494195-f535bb60d1057a578b05cd0da157c9eb.jpg", label: "A meal shared is hope shared", category: "FOOD DISTRIBUTION" },
];

export default function HomePage() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    apiRequest<CommunityEvent[]>("/api/events?scope=upcoming&limit=6&sort=soonest")
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section className="hero-section container">
        <div className="hero-copy">
          <div className="hero-overline"><span className="overline-line" /> A NEIGHBOURHOOD MOVEMENT</div>
          <h1>Good things<br />grow <em>together.</em></h1>
          <p className="hero-description">A city feels different when we look out for each other. Find a local cause, bring what you can, and make your corner of the world a little kinder.</p>
          <div className="hero-actions">
            <Link href="/events" className="button button-lime">Find your next good thing <ArrowUpRight size={17} /></Link>
            <Link href="/create-event" className="button button-text">Start an initiative <ArrowRight size={16} /></Link>
          </div>
          <div className="hero-proof"><div className="proof-avatars"><span>R</span><span>N</span><span>A</span><span>+</span></div><div><strong>Small actions, many hands.</strong><small>Made for people who care about where they live.</small></div></div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-frame"><img src="https://s3sdghub-bucket.s3.eu-west-1.amazonaws.com/core-cms/public/styles/media_image_large/public/IMG_0040_copy_2930x1953.jpg?itok=675jcwtg" alt="Volunteers planting saplings together" /><div className="hero-image-caption"><span className="caption-spark">✳</span><span>BETTER DAYS<br /><b>START HERE.</b></span></div></div>
          <div className="hero-note hero-note-top"><Sprout size={18} /><span>Plant a little hope.</span></div>
          <div className="hero-note hero-note-bottom"><span className="note-icon"><HeartHandshake size={18} /></span><span><b>One neighbourhood.</b><small>Countless ways to care.</small></span></div>
          <div className="hero-sunburst" aria-hidden="true">✳</div>
          <span className="hero-vertical-label">VOLUNTEER · CONNECT · REPEAT</span>
        </div>
      </section>

      <section className="ticker-band" aria-label="Our values"><div className="ticker-track"><span>SHOW UP</span><i>✳</i><span>SHARE WHAT YOU CAN</span><i>✳</i><span>LEAVE THINGS BETTER</span><i>✳</i><span>SHOW UP</span><i>✳</i><span>SHARE WHAT YOU CAN</span><i>✳</i><span>LEAVE THINGS BETTER</span><i>✳</i></div></section>

      <section className="intro-section container section-pad">
        <div className="intro-aside"><span className="section-index">01 / THE IDEA</span><div className="vertical-rule" /><span className="aside-note">A platform for the people who make places feel like home.</span></div>
        <div className="intro-main"><p className="eyebrow">MORE THAN GOOD INTENTIONS</p><h2>Big change is a<br /><span>neighbourhood thing.</span></h2><p className="intro-text">CommonGround brings local volunteer opportunities out of group chats and into the open. Discover work that matters close to home, meet the people behind it, and keep your community moving forward.</p><div className="intro-stat-row"><div><strong>{events.length || "06"}</strong><span>events in the live<br />upcoming preview</span></div><div><strong>01</strong><span>shared place<br />to get involved</span></div><div><strong>∞</strong><span>ways to make<br />a difference</span></div></div></div>
      </section>

      <section className="events-preview-section section-pad">
        <div className="container">
          <SectionHeading eyebrow="02 / FIND YOUR PEOPLE" title="Good work is happening." description="A few ways to show up, lend a hand, and meet the neighbours making things happen." action={<Link href="/events" className="button button-outline">Explore all events <ArrowUpRight size={16} /></Link>} />
          {loading ? <div className="skeleton-grid home-event-skeleton">{Array.from({ length: 3 }).map((_, i) => <div className="skeleton-card" key={i}><div className="skeleton skeleton-image" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /><div className="skeleton skeleton-line" /></div>)}</div> : events.length ? <div className="event-grid">{events.slice(0, 6).map((event, index) => <EventCard key={event._id} event={event} index={index} />)}</div> : <div className="home-empty"><div className="empty-ornament">✳</div><h3>Your next good thing starts here.</h3><p>No upcoming events have been published yet. Be the neighbour who starts the first one.</p><Link href="/create-event" className="button button-dark">Create the first event <ArrowUpRight size={16} /></Link></div>}
        </div>
      </section>

      <section className="how-section section-pad">
        <div className="container how-layout">
          <div className="how-copy"><p className="eyebrow">03 / HOW IT WORKS</p><h2>From “someone should”<br /><em>to “we did”.</em></h2><p>It doesn't take a grand plan. Just one person willing to begin, and a few more willing to join in.</p><Link href="/register" className="button button-lime">Be part of it <ArrowUpRight size={16} /></Link><div className="how-doodle" aria-hidden="true">↘</div></div>
          <div className="steps-list">
            <div className="step-item"><span className="step-number">01</span><div className="step-icon"><MapPin size={21} /></div><div><h3>Find what feels close.</h3><p>Browse local events by cause, date, and neighbourhood.</p></div><ArrowUpRight className="step-arrow" size={18} /></div>
            <div className="step-item"><span className="step-number">02</span><div className="step-icon"><Users size={21} /></div><div><h3>Join the good people.</h3><p>Save your spot and meet others who care about the same things.</p></div><ArrowUpRight className="step-arrow" size={18} /></div>
            <div className="step-item"><span className="step-number">03</span><div className="step-icon"><Sprout size={21} /></div><div><h3>Make the day count.</h3><p>Show up, lend a hand, and keep the momentum growing.</p></div><ArrowUpRight className="step-arrow" size={18} /></div>
          </div>
        </div>
      </section>

      <section className="gallery-section section-pad container">
        <SectionHeading eyebrow="04 / MOMENTS THAT MATTER" title="A little good, out in the world." description="Real community effort is made of small moments. Here are a few reminders of what showing up can look like." />
        <div className="gallery-grid">{gallery.map((item, index) => <article className={`gallery-card gallery-card-${index + 1}`} key={item.label}><img src={item.image} alt={item.label} loading="lazy" /><div className="gallery-overlay"><span>{item.category}</span><h3>{item.label}</h3></div></article>)}</div>
        <p className="gallery-credit">Community action across Bangladesh. Images shown for inspiration; event organisers should use images they own or have permission to share.</p>
      </section>

      <section className="values-band container">
        <div className="values-symbol">✳</div><div><p className="eyebrow">A BETTER KIND OF SOCIAL NETWORK</p><h2>Less scrolling.<br /><em>More doing.</em></h2></div><p>Come for the cause. Stay for the community. Every event is a chance to turn a shared intention into something real.</p><Link href="/events" className="circle-cta" aria-label="Browse upcoming events"><ArrowUpRight size={25} /></Link>
      </section>

      <section className="newsletter-section section-pad">
        <div className="container newsletter-card"><div className="newsletter-deco">✳</div><div className="newsletter-copy"><p className="eyebrow">THE GOOD NEWS LETTER</p><h2>Keep a little good<br /><em>in your inbox.</em></h2><p>Occasional notes about local initiatives, upcoming events, and easy ways to lend a hand.</p></div><form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setSubscribed(true); }}><label htmlFor="newsletter-email">YOUR EMAIL ADDRESS</label><div className="newsletter-input-row"><input id="newsletter-email" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /><button type="submit" aria-label="Subscribe"><ArrowUpRight size={20} /></button></div><small>{subscribed ? "You're on the list. Thanks for caring." : "No noise. Just the occasional nudge to do something good."}</small></form></div>
      </section>
    </main>
  );
}
