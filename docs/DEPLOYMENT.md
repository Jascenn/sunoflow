# Cloudflare Pages Deployment Guide

## Overview

This project uses `@cloudflare/next-on-pages` to deploy Next.js App Router to Cloudflare Pages.

---

## 1. Prerequisites

- **Cloudflare Account**: [Sign up](https://dash.cloudflare.com/sign-up)
- **Database**: A PostgreSQL database utilizing **Connection Pooling**.
  > **Critical**: Cloudflare Workers run on the edge. You CANNOT use a standard direct connection string (port 5432) or you will exhaust connections.
  > - **Neon**: Use the pooled connection string (usually ends in `-pool`).
  > - **Supabase**: Use the Transaction Mode connection string (port 6543).

---

## 2. Configuration Steps

### 1. Database Setup

Ensure your `DATABASE_URL` environment variable is set to the **pooled** connection string.

```env
# Example (Supabase Transaction Mode)
DATABASE_URL="postgresql://user:pass@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### 2. Cloudflare Project Setup

1. Log in to Cloudflare Dashboard > **Workers & Pages**.
2. Click **Create Application** > **Pages** > **Connect to Git**.
3. Select your repository.

### 3. Build Settings (Crucial)

Configure the following settings EXACTLY:

- **Framework Preset**: `Next.js`
- **Build Command**: `npx @cloudflare/next-on-pages` (or `pnpm pages:build` if using pnpm)
- **Build Output Directory**: `.vercel/output/static`
- **Root Directory**: `/` (leave empty)

### 4. Compatibility Flags

Go to **Settings** > **Functions** > **Compatibility Flags** and add:

- `nodejs_compat`

> This flag is required for Prisma and Stripe to work in the Workers environment.

### 5. Environment Variables

Add the following in **Settings** > **Environment Variables** > **Production**:

```bash
# --- Database ---
DATABASE_URL="postgresql://[user]:[pass]@[host]:6543/[db]?pgbouncer=true"

# --- Clerk Auth ---
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_WEBHOOK_SECRET=whsec_...

# --- Stripe Payments ---
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...

# --- Suno AI ---
SUNO_PROVIDER="302ai"
SUNO_BASE_URL="https://api.302.ai"
SUNO_API_KEY="sk-..."

# --- System ---
NODE_ENV="production"
```

---

## 3. Deployment

1. Click **Save and Deploy**.
2. Watch the build logs. It should run `prisma generate` (via postinstall or build script) and then `next-on-pages`.

---

## 4. Post-Deployment Checks

1. **Database Migration**: Run `pnpm prisma db push` from your **local machine** (ensure `.env` has the production DB URL) to structure the production database. Cloudflare build does NOT run migrations automatically.
2. **Webhooks**: Update your Clerk and Stripe webhooks to point to your new Cloudflare domain (e.g., `https://sunoflow.pages.dev/api/webhooks/...`).

---

## Troubleshooting

### "PrismaClient is unable to run in this browser environment"

- **Fix**: Ensure `nodejs_compat` compatibility flag is set in Cloudflare Settings.

### "Too many connections"

- **Fix**: You are likely using the direct database port (5432). Switch to the Pooled Port (e.g., 6543 for Supabase) in `DATABASE_URL`.

### "500 Internal Server Error" on API

- **Fix**: Check Cloudflare Functions logs (Real-time logs). Often due to missing Environment Variables.
