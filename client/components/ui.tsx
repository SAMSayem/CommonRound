import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <main className="page-wrap skeleton-page">
      <div className="skeleton skeleton-kicker" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-copy" />
      <div className="skeleton-grid">
        {Array.from({ length: 3 }).map((_, index) => <div className="skeleton-card" key={index}><div className="skeleton skeleton-image" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /><div className="skeleton skeleton-line" /></div>)}
      </div>
    </main>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <a className="text-link" href={href}>{children}<ArrowUpRight size={16} /></a>;
}
