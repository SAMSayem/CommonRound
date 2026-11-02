"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, HeartHandshake, Leaf, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/validation";
import { useToast } from "@/components/toast-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = registerSchema.safeParse({ name, email, photoUrl, password });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => { const key = String(issue.path[0]); if (!nextErrors[key]) nextErrors[key] = issue.message; });
      setErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    setFormError("");
    const result = await authClient.signUp.email({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      image: parsed.data.photoUrl || undefined,
    });
    setSubmitting(false);
    if (result.error) {
      setFormError(result.error.message || "Your account could not be created. Please try again.");
      return;
    }
    notify("Your CommonGround account is ready. Let's do some good.", "success");
    router.replace("/");
    router.refresh();
  };

  return (
    <main className="auth-page page-wrap">
      <div className="auth-backdrop-mark">✳</div>
      <div className="auth-card register-card">
        <div className="auth-art-panel"><div className="auth-art-top"><span className="brand-mark"><HeartHandshake size={23} /></span><span>COMMON<br />GROUND</span></div><div className="auth-art-content"><span className="auth-art-eyebrow">THERE'S A PLACE FOR YOU</span><h2>Come as you<br />are. Leave a<br /><em>difference.</em></h2><p>Meet neighbours. Make memories. Do a little good, together.</p></div><div className="auth-art-bottom"><Leaf size={17} /><span>Every helping hand belongs.</span></div><div className="auth-art-orbit" /></div>
        <div className="auth-form-panel"><Link href="/" className="auth-mobile-brand"><HeartHandshake size={21} /> commonground</Link><Link href="/" className="back-link auth-back-link"><ArrowLeft size={15} /> Back home</Link><div className="auth-heading"><p className="eyebrow">MAKE YOURSELF AT HOME</p><h1>Join the <em>good.</em></h1><p>Create an account and find your way into the community.</p></div>
          {formError && <div className="form-alert" role="alert">{formError}</div>}
          <form className="auth-form" onSubmit={submit} noValidate>
            <label className="field"><span>Your name</span><input autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); setErrors((v) => ({ ...v, name: "" })); }} placeholder="How should we call you?" />{errors.name && <small className="field-error">{errors.name}</small>}</label>
            <label className="field"><span>Email address</span><input type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((v) => ({ ...v, email: "" })); }} placeholder="you@example.com" />{errors.email && <small className="field-error">{errors.email}</small>}</label>
            <label className="field"><span>Profile photo URL <small>(optional)</small></span><input type="url" value={photoUrl} onChange={(e) => { setPhotoUrl(e.target.value); setErrors((v) => ({ ...v, photoUrl: "" })); }} placeholder="https://your-photo-link.com" />{errors.photoUrl && <small className="field-error">{errors.photoUrl}</small>}</label>
            <label className="field"><span>Create a password</span><div className="password-field"><input type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((v) => ({ ...v, password: "" })); }} placeholder="At least 6 characters" /><button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password && <small className="field-error">{errors.password}</small>}<small className="field-hint">Use 6+ characters, including uppercase and lowercase letters.</small></label>
            <button type="submit" className="button button-dark auth-submit" disabled={submitting}>{submitting ? "Creating your account…" : "Create my account"}<ArrowUpRight size={17} /></button>
          </form>
          <div className="oauth-note"><ShieldCheck size={15} /> Your profile is only used to support your community activity.</div>
          <p className="auth-switch">Already have an account? <Link href="/login">Sign in <ArrowUpRight size={14} /></Link></p>
        </div>
      </div>
    </main>
  );
}
