import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="text-center space-y-6 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium"
             style={{ background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)", color: "#a5b4fc" }}>
          ✨ Powered by AI — 100% Free
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
          Stop guessing why<br />
          <span className="gradient-text">you&#39;re getting rejected.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
          Upload your resume + paste a job description. Get ATS risks, missing keywords,
          red flags, and specific fixes — then track every version like Git.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link href="/auth/signup" className="btn-primary text-base py-3 px-8">
            Get started free →
          </Link>
          <Link href="/auth/signin" className="btn-secondary text-base py-3 px-8">
            Sign in
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            icon: "🎯",
            title: "Projects per job",
            desc: "Create one project per company/role. Keep your job applications organized with dedicated workspaces.",
          },
          {
            icon: "📊",
            title: "Resume versioning",
            desc: "Upload new versions and compare changes side-by-side. Track your improvements like Git.",
          },
          {
            icon: "🤖",
            title: "AI-powered analysis",
            desc: "Get ATS scores, keyword coverage, red flags, and actionable fixes — all powered by Gemini AI.",
          },
        ].map((f) => (
          <div key={f.title} className="glass-card p-6 space-y-3"
               style={{ animationDelay: "0.1s" }}>
            <div className="text-3xl">{f.icon}</div>
            <div className="font-semibold text-lg text-white">{f.title}</div>
            <div className="text-sm text-slate-400 leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="text-center space-y-8">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="grid gap-6 md:grid-cols-4 max-w-4xl mx-auto">
          {[
            { step: "1", title: "Create project", desc: "Add company name, role, and job description" },
            { step: "2", title: "Upload resume", desc: "Paste text or upload PDF/DOCX files" },
            { step: "3", title: "Run analysis", desc: "AI analyzes match against the JD" },
            { step: "4", title: "Improve & track", desc: "Fix issues, upload new versions, repeat" },
          ].map((s) => (
            <div key={s.step} className="space-y-3">
              <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-sm font-bold text-white"
                   style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                {s.step}
              </div>
              <div className="font-medium text-white">{s.title}</div>
              <div className="text-xs text-slate-400">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
