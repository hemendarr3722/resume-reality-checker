"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(()=>({}));
      setErr(j.error || "Signup failed");
      return;
    }
    router.push("/auth/signin");
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md glass-card p-8 space-y-6 animate-fade-in-up">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">Start optimizing your resume today</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Name <span className="text-slate-500">(optional)</span></label>
            <input className="input-field" placeholder="John Doe" value={name} onChange={(e)=>setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Email</label>
            <input className="input-field" placeholder="you@example.com" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
            <input className="input-field" placeholder="Min 8 characters" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          {err && (
            <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              ⚠️ {err}
            </div>
          )}
          <button disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-400">
          Already have an account? <Link href="/auth/signin" className="font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
