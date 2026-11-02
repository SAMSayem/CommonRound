"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, HeartHandshake, Leaf, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/lib/validation";
import { useToast } from "@/components/toast-provider";

export default function LoginPage() {
  const router = useRouter();
  const [next, setNext] = useState("/");
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("next");
    if (requested?.startsWith("/")) setNext(requested);
  }, []);
  const { notify } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => { nextErrors[String(issue.path[0])] = issue.message; });
      setErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    setFormError("");
    const result = await authClient.signIn.email({ email, password });
    setSubmitting(false);
    if (result.error) {
      setFormError(result.error.message || "We couldn't sign you in. Check your details and try again.");
      return;
    }
    notify("Welcome back. Good to have you here.", "success");
    router.replace(next.startsWith("/") ? next : "/");
    router.refresh();
  };

  const signInGoogle = async () => {
    const result = await authClient.signIn.social({ provider: "google", callbackURL: next.startsWith("/") ? next : "/" });
    if (result.error) setFormError(result.error.message || "Google sign-in is unavailable right now.");
  };

  return (
    <main className="auth-page page-wrap">
      <div className="auth-backdrop-mark">✳</div>
      <div className="auth-card">
        <div className="auth-art-panel"><div className="auth-art-top"><span className="brand-mark"><HeartHandshake size={23} /></span><span>COMMON<br />GROUND</span></div><div className="auth-art-content"><span className="auth-art-eyebrow">GOOD TO SEE YOU AGAIN</span><h2>There's more<br />good to <em>do.</em></h2><p>Your next small action could mean a lot to someone nearby.</p></div><div className="auth-art-bottom"><Leaf size={17} /><span>Show up for your people.</span></div><div className="auth-art-orbit" /></div>
        <div className="auth-form-panel"><Link href="/" className="auth-mobile-brand"><HeartHandshake size={21} /> commonground</Link><Link href="/" className="back-link auth-back-link"><ArrowLeft size={15} /> Back home</Link><div className="auth-heading"><p className="eyebrow">YOUR COMMUNITY IS WAITING</p><h1>Welcome <em>back.</em></h1><p>Sign in to keep your good work going.</p></div>
          {formError && <div className="form-alert" role="alert">{formError}</div>}
          <form className="auth-form" onSubmit={submit} noValidate>
            <label className="field"><span>Email address</span><input type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((current) => ({ ...current, email: "" })); }} placeholder="you@example.com" />{errors.email && <small className="field-error">{errors.email}</small>}</label>
            <label className="field"><span>Password</span><div className="password-field"><input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((current) => ({ ...current, password: "" })); }} placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password && <small className="field-error">{errors.password}</small>}</label>
            <button type="submit" className="button button-dark auth-submit" disabled={submitting}>{submitting ? "Signing you in…" : "Sign in to CommonGround"}<ArrowUpRight size={17} /></button>
          </form>
          {googleEnabled && <><div className="auth-divider"><span /> OR CONTINUE WITH <span /></div><button className="button button-social" onClick={signInGoogle}><span className="google-g">G</span> Continue with Google</button></>}
          {!googleEnabled && <div className="oauth-note"><ShieldCheck size={15} /> Email sign-in is ready. Google sign-in can be enabled with OAuth keys in your environment.</div>}
          <p className="auth-switch">New around here? <Link href="/register">Create an account <ArrowUpRight size={14} /></Link></p>
        </div>
      </div>
    </main>
  );
}
