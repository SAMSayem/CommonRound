import Link from "next/link";
import {
  ArrowUpRight,
  HeartHandshake,
  Camera,
  Mail,
  MapPin
} from "lucide-react";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top container">
        <div className="footer-brand-block">
          <Link href="/" className="brand footer-brand"><span className="brand-mark"><HeartHandshake size={23} /></span><span className="brand-wordmark">common<span>ground</span><small>LOCAL ACTION. SHARED IMPACT.</small></span></Link>
          <p>A little more care in every neighbourhood. Bring your time, your hands, and your good ideas.</p>
          <div className="footer-socials"><a href="https://www.instagram.com/" aria-label="Instagram" target="_blank" rel="noreferrer"><Camera size={18} /></a><a href="https://www.facebook.com/" aria-label="Facebook" target="_blank" rel="noreferrer">f</a><a href="https://x.com/" aria-label="X" target="_blank" rel="noreferrer" className="x-social">𝕏</a></div>
        </div>
        <div className="footer-column"><p className="footer-label">EXPLORE</p><Link href="/events">Upcoming events</Link><Link href="/create-event">Start an initiative</Link><Link href="/joined-events">Your commitments</Link></div>
        <div className="footer-column"><p className="footer-label">YOUR SPACE</p><Link href="/login">Sign in</Link><Link href="/register">Create an account</Link><Link href="/profile">Profile</Link></div>
        <div className="footer-contact"><p className="footer-label">SAY HELLO</p><a href="mailto:hello@commonground.local"><Mail size={16} /> hello@commonground.local</a><span><MapPin size={16} /> Dhaka, Bangladesh</span><span className="footer-note">Built for neighbours, by neighbours.</span></div>
      </div>
      <div className="footer-bottom container"><span>© {new Date().getFullYear()} CommonGround. Made for the common good.</span><span>GOOD IS A THING WE DO TOGETHER <ArrowUpRight size={14} /></span></div>
    </footer>
  );
}
