# 🚀 SunoFlow - AI Music Generation Workbench

A professional-grade AI music generation workbench powered by [Suno API (Kie.ai)](https://kie.ai). Built to solve the pain points of the official web version: no batch generation, chaotic asset management, and cumbersome local remixing.

## ✨ Features

- **Batch Generation Queue** - Set up multiple song generations at once
- **Credit Management System** - Atomic transaction-based credit deduction and tracking
- **💳 Payment System** - Integrated Stripe payment with mock mode for testing
  - Multiple payment methods (Credit Card, Alipay, WeChat Pay)
  - 4 pricing tiers with bonus credits
  - Mock payment mode for development testing
- **Local Remix** (Coming Soon) - Upload local audio files for remixing/style transfer
- **Cloud Deployment** - Auto-deploy to Cloudflare Pages with PostgreSQL database
- **Smart Polling** - Automatic status updates for pending generations
- **Global Music Player** - Persistent audio player across the app

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Deployment:** Cloudflare Pages (`@cloudflare/next-on-pages`)
- **UI Library:** Tailwind CSS, Custom Components, Lucide Icons
- **Database:** PostgreSQL (Supabase/Neon) + Prisma ORM
- **State Management:** Zustand (Global Player), TanStack Query v5 (Async Polling)
- **Auth:** Clerk
- **Payment:** Stripe (Credit Card, Alipay, WeChat Pay)
- **HTTP Client:** Axios

## 📦 Installation

### Prerequisites

- Node.js 18+ or pnpm
- PostgreSQL database (Supabase/Neon recommended)
- Clerk account for authentication
- Suno API key from [Kie.ai](https://kie.ai)

### Setup Steps

1. **Clone and Install**
   ```bash
   cd sunoflow
   pnpm install
   ```

2. **Environment Variables**
   ```bash
   cp .env.example .env
   ```

   Fill in your `.env` file:
   ```env
   # Database
   DATABASE_URL="postgresql://..."

   # Suno API
   SUNO_BASE_URL="https://api.kie.ai"
   SUNO_API_KEY="your-api-key"

   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."

   # Stripe Payment (optional for testing with mock mode)
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Database Setup**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

4. **Run Development Server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment to Cloudflare Pages

### Build Configuration

1. **Build Command:** `pnpm pages:build`
2. **Output Directory:** `.vercel/output/static`
3. **Compatibility Flags:** Add `nodejs_compat` in Cloudflare dashboard

### Environment Variables

Set these in Cloudflare Pages dashboard:

```
DATABASE_URL=postgresql://... (use connection pooling URL)
SUNO_API_KEY=your-api-key
SUNO_BASE_URL=https://api.kie.ai
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### Deploy

```bash
pnpm pages:build
```

Then connect your GitHub repo to Cloudflare Pages or use Wrangler CLI.

## 📚 Database Schema

- **User** - User identity linked to Clerk
- **Wallet** - Credit balance with optimistic locking
- **Transaction** - Financial records (recharge, consume, refund)
- **Task** - Music generation tasks with status tracking
- **Upload** - Local audio files for remixing

## 🎵 Usage

1. **Sign In** - Authenticate with Clerk
2. **Recharge Credits** - Visit `/recharge` to purchase credits
   - Use **Mock Payment Mode** for testing (no Stripe setup needed)
   - Switch to real payment in production
3. **Generate Music** - Enter prompt, tags, and preferences
4. **Monitor Progress** - Real-time status updates via smart polling
5. **Play & Download** - Use the global player or download completed tracks

### 💳 Payment System Testing

**Mock Payment (Development Mode):**
```bash
# No configuration needed! Just visit:
http://localhost:3000/recharge

# Toggle is ON by default (yellow banner)
# Select a plan → Pay → Credits added instantly
```

**Real Payment (Production Mode):**
```bash
# 1. Configure Stripe keys in .env
# 2. Toggle OFF mock payment mode
# 3. Test with Stripe test cards
```

See [MOCK_PAYMENT_TEST_GUIDE.md](./MOCK_PAYMENT_TEST_GUIDE.md) for detailed testing instructions.

## 📝 API Routes

**Music Generation:**
- `POST /api/generate` - Start a new music generation task
- `GET /api/tasks` - Fetch all user tasks with status updates

**Payment:**
- `POST /api/payment/create-checkout` - Create Stripe checkout session (real payment)
- `POST /api/payment/mock-checkout` - Create mock payment (testing)
- `POST /api/payment/webhook` - Handle Stripe payment callbacks
- `GET /api/wallet` - Get user wallet balance

## 🔧 Development Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm pages:build  # Build for Cloudflare Pages
pnpm db:generate  # Generate Prisma Client
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Prisma Studio
```

## 🎯 Roadmap

- [x] Text-based music generation
- [x] Task management with polling
- [x] Global music player
- [x] Credit system
- [x] **User wallet top-up (Stripe + Mock Payment)**
- [x] **Multi-tier pricing with bonus credits**
- [ ] Local audio upload for remixing
- [ ] Batch generation queue
- [ ] Advanced audio controls
- [ ] Generation history export
- [ ] Payment history and invoices
- [ ] Subscription plans

## 📚 Documentation

- [📖 Changelog](./CHANGELOG.md) - Version history and updates
- [💳 Mock Payment Test Guide](./MOCK_PAYMENT_TEST_GUIDE.md) - Testing payment without Stripe
- [📋 Test Checklist](./TEST_CHECKLIST.md) - Complete testing guide
- [🔧 Payment System Documentation](./PAYMENT_SYSTEM_COMPLETE.md) - Technical details
- [🚀 Deployment Guide](./PAYMENT_DEPLOYMENT_GUIDE.md) - Production deployment
- [🔗 Integration Guide](./PAYMENT_INTEGRATION_GUIDE.md) - API integration

## 📄 License

MIT

## 🙏 Credits

Built with the PRD specifications. Powered by Suno API via [Kie.ai](https://kie.ai).
