# 📁 SunoFlow File Structure

Complete file tree with descriptions.

```
sunoflow/
│
├── 📄 Configuration Files
│   ├── .env.example                    # Environment variables template
│   ├── .gitignore                      # Git ignore rules
│   ├── next.config.js                  # Next.js configuration
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── tailwind.config.js              # Tailwind CSS configuration
│   ├── postcss.config.js               # PostCSS configuration
│   ├── package.json                    # Dependencies & scripts
│   └── pnpm-lock.yaml                  # Dependency lock file
│
├── 📚 Documentation
│   ├── README.md                       # Main project documentation
│   ├── QUICKSTART.md                   # 5-minute setup guide
│   ├── DEPLOYMENT.md                   # Cloudflare Pages deployment
│   ├── PROJECT_SUMMARY.md              # Complete implementation summary
│   └── FILE_STRUCTURE.md               # This file
│
├── 🎨 Frontend (app/)
│   ├── layout.tsx                      # Root layout with Clerk + Providers
│   ├── page.tsx                        # Landing page (/)
│   ├── globals.css                     # Global Tailwind styles
│   ├── providers.tsx                   # TanStack Query provider
│   │
│   ├── dashboard/
│   │   └── page.tsx                    # Main workbench (/dashboard)
│   │
│   └── api/                            # API Routes
│       ├── generate/
│       │   └── route.ts                # POST - Generate music with credit deduction
│       ├── tasks/
│       │   └── route.ts                # GET - Fetch tasks with status updates
│       ├── wallet/
│       │   └── route.ts                # GET - Wallet balance & transactions
│       └── webhooks/
│           └── clerk/
│               └── route.ts            # POST - Auto-create user on signup
│
├── 🧩 Components (components/)
│   ├── music/
│   │   ├── generator-form.tsx          # Music generation form with tabs
│   │   ├── task-list.tsx               # Task list with real-time status
│   │   └── player-bar.tsx              # Global audio player (bottom bar)
│   │
│   └── ui/                             # Basic UI components
│       ├── button.tsx                  # Button component
│       ├── input.tsx                   # Input field component
│       ├── textarea.tsx                # Textarea component
│       └── tabs.tsx                    # Tabs component
│
├── 🪝 Hooks (hooks/)
│   ├── use-player-store.ts             # Zustand store - Global player state
│   └── use-tasks.ts                    # React Query - Smart polling for tasks
│
├── 📚 Libraries (lib/)
│   ├── prisma.ts                       # Prisma Client singleton
│   ├── suno-client.ts                  # Suno API client wrapper
│   └── types/
│       └── suno.ts                     # TypeScript type definitions
│
└── 🗄️ Database (prisma/)
    └── schema.prisma                   # Database schema (5 models)
```

## File Descriptions

### Configuration Files

| File | Purpose |
|------|---------|
| `.env.example` | Template for environment variables (DB, API keys, Clerk) |
| `.gitignore` | Excludes node_modules, .env, .next, etc. |
| `next.config.js` | Next.js config with image optimization |
| `tsconfig.json` | TypeScript compiler settings |
| `tailwind.config.js` | Tailwind CSS customization |
| `postcss.config.js` | PostCSS plugins (Tailwind + Autoprefixer) |
| `package.json` | Dependencies & npm scripts |

### App Routes

#### Pages
- **`app/page.tsx`** - Landing page with "Get Started" button
- **`app/dashboard/page.tsx`** - Main workbench with generator form + task list

#### Layout & Providers
- **`app/layout.tsx`** - Root layout with ClerkProvider, TanStack Query, PlayerBar
- **`app/providers.tsx`** - QueryClientProvider wrapper

#### API Routes
- **`/api/generate`** - Creates music generation task with atomic credit deduction
- **`/api/tasks`** - Returns user's tasks, auto-updates pending statuses from Suno
- **`/api/wallet`** - Returns wallet balance and recent transactions
- **`/api/webhooks/clerk`** - Handles user.created event, creates User + Wallet

### Components

#### Music Components
- **`generator-form.tsx`** - Form with Text/Remix tabs, prompt input, model selection
- **`task-list.tsx`** - Displays tasks with status badges, audio player, download
- **`player-bar.tsx`** - Fixed bottom bar, global audio player with Zustand

#### UI Components (Simplified shadcn/ui)
- **`button.tsx`** - Customizable button (variants: default, outline, ghost)
- **`input.tsx`** - Text input field
- **`textarea.tsx`** - Multi-line text input
- **`tabs.tsx`** - Tab navigation component

### Hooks

- **`use-player-store.ts`** - Zustand store managing currentTrack, isPlaying, volume
- **`use-tasks.ts`** - React Query hook with smart polling (only when tasks pending)

### Libraries

- **`prisma.ts`** - Prisma Client singleton (prevents multiple instances)
- **`suno-client.ts`** - Suno API wrapper (generate, getStatus, uploadAudio)
- **`types/suno.ts`** - TypeScript interfaces for Suno API

### Database

- **`schema.prisma`** - 5 models:
  - **User** - Identity (linked to Clerk)
  - **Wallet** - Credit balance with optimistic locking
  - **Transaction** - Financial records (recharge, consume, refund)
  - **Task** - Music generation tasks
  - **Upload** - Local audio files for remixing

## Key Files to Edit

### Adding Features
- **Generator Form**: `components/music/generator-form.tsx`
- **Task Display**: `components/music/task-list.tsx`
- **Player Logic**: `hooks/use-player-store.ts`

### API Modifications
- **Generation Logic**: `app/api/generate/route.ts`
- **Task Polling**: `app/api/tasks/route.ts`
- **Credit System**: `app/api/wallet/route.ts`

### Database Changes
- **Schema**: `prisma/schema.prisma` (then run `pnpm db:push`)

## Important Constants

### Credit Costs
Located in `app/api/generate/route.ts`:
```typescript
const COST_PER_GENERATION = 5; // Change this to adjust cost
```

### Initial Free Credits
Located in `app/api/webhooks/clerk/route.ts`:
```typescript
balance: 100, // New user free credits
```

### Polling Interval
Located in `hooks/use-tasks.ts`:
```typescript
refetchInterval: hasPendingTasks ? 3000 : false // 3 seconds
```

## File Size Summary

```
Total Files: 35
- TypeScript/TSX: 21
- Config Files: 7
- Documentation: 5
- Prisma Schema: 1
- CSS: 1
```

---

**All files are production-ready!** ✅

Need to modify something? Check the file descriptions above to find the right file.
