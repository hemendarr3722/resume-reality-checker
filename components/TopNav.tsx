"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function TopNav() {
  const { data } = useSession();
  return (
    <header className="sticky top-0 z-50" style={{
      background: "rgba(10, 14, 26, 0.8)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(99, 102, 241, 0.1)"
    }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
               style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            R
          </div>
          <span className="font-bold text-lg text-white group-hover:text-white">
            Resume<span className="gradient-text">Reality</span>
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {data?.user ? (
            <>
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                Dashboard
              </Link>
              <button onClick={() => signOut()} className="btn-secondary text-xs px-3 py-1.5">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                Sign in
              </Link>
              <Link href="/auth/signup" className="btn-primary text-xs py-2 px-4">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
