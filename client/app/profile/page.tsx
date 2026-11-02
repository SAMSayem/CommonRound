"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, HeartHandshake, ImagePlus, ShieldCheck, Sparkles } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/toast-provider";
import { apiRequest } from "@/lib/api";
import { PageSkeleton } from "@/components/ui";
import type { CommunityEvent } from "@/lib/types";

function ProfileContent() {
  const { data, isPending, refetch } = authClient.useSession();
  const { notify } = useToast();
  const user = data?.user;
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<CommunityEvent[]>([]);
  const [joined, setJoined] = useState<CommunityEvent[]>([]);

  useEffect(() => {
    if (user) { setName(user.name || ""); setImage(user.image || ""); }
  }, [user?.id, user?.name, user?.image]);

  useEffect(() => {
    Promise.all([
      apiRequest<CommunityEvent[]>("/api/me/events", { authenticated: true }),
      apiRequest<CommunityEvent[]>("/api/me/joined-events", { authenticated: true }),
    ]).then(([createdEvents, joinedEvents]) => { setCreated(createdEvents); setJoined(joinedEvents); }).catch(() => undefined);
  }, []);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim().length < 2) { notify("Your name needs at least two characters.", "error"); return; }
    if (image && !/^https?:\/\//.test(image)) { notify("Please enter a valid photo URL starting with http or https.", "error"); return; }
    setSaving(true);
    const result = await authClient.updateUser({ name: name.trim(), image: image || undefined });
    setSaving(false);
    if (result.error) { notify(result.error.message || "Your profile couldn't be updated.", "error"); return; }
    await refetch();
    notify("Your profile has been updated.", "success");
  };

  if (isPending || !user) return <PageSkeleton />;
  return (
    <main className="page-wrap profile-page dashboard-page">
      <div className="profile-topline"><p className="eyebrow">YOUR CORNER OF THE COMMUNITY</p><span><ShieldCheck size={15} /> ACCOUNT SECURED</span></div>
      <div className="profile-layout"><section className="profile-card"><div className="profile-card-cover"><span>✳</span><span>COMMON GROUND MEMBER</span></div><div className="profile-avatar-large">{image ? <img src={image} alt={name} /> : <span>{name.slice(0, 1).toUpperCase()}</span>}</div><div className="profile-card-info"><h1>{user.name}</h1><p>{user.email}</p><span className="member-since"><Sparkles size={14} /> A neighbour making a difference</span></div><div className="profile-stats"><div><strong>{created.length.toString().padStart(2, "0")}</strong><span>EVENTS<br />CREATED</span></div><div><strong>{joined.length.toString().padStart(2, "0")}</strong><span>EVENTS<br />JOINED</span></div><div><strong>{new Date(user.createdAt || Date.now()).getFullYear()}</strong><span>MEMBER<br />SINCE</span></div></div><div className="profile-card-foot"><HeartHandshake size={17} /> Good looks good on you.</div></section>
        <section className="profile-edit-panel"><p className="eyebrow">A LITTLE ABOUT YOU</p><h2>Make it <em>personal.</em></h2><p>Keep your name and picture up to date so neighbours know who's showing up.</p><form className="profile-form" onSubmit={saveProfile}><label className="field"><span>Display name</span><input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required minLength={2} /></label><label className="field"><span>Profile photo URL</span><div className="input-with-icon"><ImagePlus size={17} /><input type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://your-photo-link.com" /></div><small className="field-hint">Use a public image URL. Leave blank to use your initials.</small></label><button className="button button-dark" type="submit" disabled={saving}>{saving ? "Saving profile…" : "Save profile changes"}<ArrowUpRight size={16} /></button></form><div className="profile-shortcuts"><Link href="/manage-events"><CalendarDays size={17} /><span><b>Manage your events</b><small>Update the initiatives you've created.</small></span><ArrowUpRight size={16} /></Link><Link href="/joined-events"><HeartHandshake size={17} /><span><b>Your joined events</b><small>Keep track of where you'll show up.</small></span><ArrowUpRight size={16} /></Link></div></section></div>
    </main>
  );
}

export default function ProfilePage() {
  return <ProtectedRoute><ProfileContent /></ProtectedRoute>;
}
