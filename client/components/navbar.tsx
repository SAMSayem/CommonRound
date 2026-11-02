"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUpRight, HeartHandshake, LogOut, Menu, UserRound, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/toast-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Upcoming events" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isPending } = authClient.useSession();
  const { notify } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const user = data?.user;

  const handleLogout = async () => {
    await authClient.signOut();
    setProfileOpen(false);
    notify("You have signed out. See you out there.", "success");
    router.push("/");
    router.refresh();
  };

  return (
    <header className="site-header">
      <div className="announcement"><span className="announcement-dot" /> GOOD THINGS HAPPEN WHEN WE SHOW UP <span className="announcement-divider">/</span> DHAKA, BANGLADESH</div>
      <nav className="nav-shell container" aria-label="Main navigation">
        <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><HeartHandshake size={23} strokeWidth={1.8} /></span>
          <span className="brand-wordmark">common<span>ground</span><small>LOCAL ACTION. SHARED IMPACT.</small></span>
        </Link>

        <div className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>
          {publicLinks.map((link) => (
            <Link key={link.href} href={link.href} className={pathname === link.href || (link.href === "/events" && pathname.startsWith("/events")) ? "nav-link active" : "nav-link"} onClick={() => setMenuOpen(false)}>{link.label}</Link>
          ))}
          {user && <Link href="/create-event" className="nav-link mobile-only-link" onClick={() => setMenuOpen(false)}>Create an event</Link>}
        </div>

        <div className="nav-actions">
          <ThemeToggle />
          {isPending ? <div className="nav-avatar-placeholder" /> : user ? (
            <>
            <div className="profile-menu-wrap">
              <button className="profile-trigger" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-label="Open profile menu" title={user.name}>
                {user.image ? <img src={user.image} alt="" /> : <span className="avatar-fallback">{user.name?.slice(0, 1).toUpperCase() || "U"}</span>}
                <span className="profile-trigger-name">{user.name?.split(" ")[0] || "Account"}</span><ArrowDown size={14} />
              </button>
              {profileOpen && <>
                <button className="menu-dismiss" aria-label="Close profile menu" onClick={() => setProfileOpen(false)} />
                <div className="profile-dropdown">
                  <div className="dropdown-user"><strong>{user.name}</strong><span>{user.email}</span></div>
                  <Link href="/profile" onClick={() => setProfileOpen(false)}><UserRound size={16} /> My profile</Link>
                  <Link href="/create-event" onClick={() => setProfileOpen(false)}><HeartHandshake size={16} /> Create event</Link>
                  <Link href="/manage-events" onClick={() => setProfileOpen(false)}><span className="dropdown-mini-icon">✳</span> Manage events</Link>
                  <Link href="/joined-events" onClick={() => setProfileOpen(false)}><span className="dropdown-mini-icon">↗</span> Joined events</Link>
                  <button onClick={handleLogout}><LogOut size={16} /> Sign out</button>
                </div>
              </>}
            </div>
            <button className="nav-signout" onClick={handleLogout}><LogOut size={14} /> Sign out</button>
            </>
          ) : <Link className="button button-dark nav-login" href={`/login?next=${encodeURIComponent(pathname || "/")}`}>Sign in <ArrowUpRight size={16} /></Link>}
          <button className="mobile-menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </nav>
    </header>
  );
}
