# Resume Reality Checker (MVP)

A Next.js SaaS starter for:
- Projects per job (company/role + JD)
- Resume versioning (like Git)
- OpenAI-powered ATS + match analysis (server-side)
- Basic diffs between versions

## Prerequisites
- Node.js 18+
- A PostgreSQL database (local or hosted)
- An OpenAI API key

## Setup

1) Install deps
```bash
npm install
```

2) Create `.env` from `.env.example`
```bash
cp .env.example .env
```

Fill:
- `DATABASE_URL`
- `NEXTAUTH_SECRET` (use any random string)
- `OPENAI_API_KEY`
- optionally `OPENAI_MODEL`

3) Migrate DB + generate client
```bash
npx prisma migrate dev --name init
npx prisma generate
```

(Optional) seed demo data:
```bash
npm run seed
```

4) Run dev server
```bash
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel
1) Push repo to GitHub
2) Import on Vercel
3) Set env vars on Vercel:
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL (your production URL)
- OPENAI_API_KEY
- OPENAI_MODEL (optional)

4) Deploy

## Notes
- OpenAI calls are server-side only (API key never in browser).
- File upload supports PDF and DOCX (<= 5MB).
- Diff UI is basic and can be upgraded later.
