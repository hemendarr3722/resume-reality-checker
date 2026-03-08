"use client";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl });
    setLoading(false);
    if (res?.error) setErr("Invalid email or password");
    else router.push(callbackUrl);
  }

  return (
    <div className="w-full max-w-md glass-card p-8 space-y-6 animate-fade-in-up">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-400">Sign in to your account</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Email</label>
          <input className="input-field" placeholder="you@example.com" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
          <input className="input-field" placeholder="••••••••" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>
        {err && (
          <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
            ⚠️ {err}
          </div>
        )}
        <button disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-center text-sm text-slate-400">
        New here? <Link href="/auth/signup" className="font-medium">Create an account</Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Suspense fallback={
        <div className="w-full max-w-md glass-card p-8 text-center text-slate-400">Loading...</div>
      }>
        <SignInForm />
      </Suspense>
    </div>
  );
}
