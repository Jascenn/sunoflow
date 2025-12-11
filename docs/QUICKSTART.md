# ⚡ Quick Start Guide

Get SunoFlow running in 5 minutes!

## Prerequisites Check

- [ ] Node.js 18+ installed
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] PostgreSQL database ready (Supabase/Neon recommended)
- [ ] Clerk account created
- [ ] Suno API key from Kie.ai

## Step-by-Step Setup

### 1️⃣ Install Dependencies (30 seconds)

```bash
cd /Volumes/Mypssd/Development/00_Pay_Project_Archive/sunoflow
pnpm install
```

### 2️⃣ Configure Environment (2 minutes)

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Get from Supabase/Neon
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Get from Kie.ai
SUNO_API_KEY="your-api-key-here"
SUNO_BASE_URL="https://api.kie.ai"

# Get from Clerk Dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Keep these as default
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

### 3️⃣ Setup Database (1 minute)

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema to database
pnpm db:push
```

### 4️⃣ Run Development Server (10 seconds)

```bash
pnpm dev
```

Open http://localhost:3000 🎉

## First Time Usage

### A. Sign Up
1. Click "Get Started"
2. Sign up with Clerk
3. You'll get 100 free credits automatically

### B. Generate Your First Track
1. Go to Dashboard (`/dashboard`)
2. Enter a prompt: "Create an upbeat electronic dance track"
3. Add tags: "EDM, energetic, club"
4. Click "Generate Music"
5. Wait for generation to complete (usually 30-60 seconds)

### C. Play Your Music
- Click play button in the task list
- Or use the global player at the bottom

## Quick Troubleshooting

### "Unauthorized" Error
→ Make sure you're signed in with Clerk

### "User not found" Error
→ Setup Clerk webhook (see below)

### Database Connection Error
→ Check your `DATABASE_URL` in `.env`

### Prisma Generation Fails
→ Temporarily disable proxy/VPN

## Setup Clerk Webhook (For Auto User Creation)

1. **Clerk Dashboard** → Webhooks → Add Endpoint
2. **Endpoint URL**:
   - Dev: Use ngrok → `https://your-ngrok.com/api/webhooks/clerk`
   - Prod: `https://your-domain.com/api/webhooks/clerk`
3. **Subscribe to**: `user.created`
4. **Save** and test

**Why needed?** This auto-creates User + Wallet when someone signs up.

## Project Structure (Quick Reference)

```
Key Files:
├── app/dashboard/page.tsx        ← Main UI
├── app/api/generate/route.ts     ← Music generation
├── app/api/tasks/route.ts        ← Fetch tasks
├── components/music/             ← UI components
├── hooks/use-tasks.ts            ← Smart polling
├── lib/suno-client.ts            ← API client
└── prisma/schema.prisma          ← Database
```

## Useful Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm db:studio        # Open Prisma Studio (DB GUI)
pnpm pages:build      # Build for Cloudflare
```

## What's Next?

- Read [README.md](./README.md) for full documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deploy
- Review [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for architecture

## Need Help?

**Common Issues:**
- Check all environment variables are set
- Ensure database is accessible
- Verify API keys are valid
- Make sure webhook is configured

**Still stuck?**
- Check the console for errors
- Review Prisma Studio for database state
- Test API routes directly with curl/Postman

---

**Ready to generate some music?** 🎵 Let's go!
