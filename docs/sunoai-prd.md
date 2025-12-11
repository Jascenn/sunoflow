# 🚀 Project PRD: SunoFlow (AI Music Workbench)

## 1\. 项目概览 (Overview)

**Project Name:** SunoFlow
**Description:** 一个基于 Kie.ai (Suno API) 的专业级 AI 音乐生成工作台。旨在解决官方网页版无法批量生成、资产管理混乱、本地 Remix 繁琐的痛点。
**Key Features:**

  * **批量生成队列:** 支持一次性设置生成多首歌曲。
  * **积分消费体系:** 基于原子事务的积分扣除与记录。
  * **本地 Remix:** 支持上传本地音频作为参考进行续写/风格转换。
  * **云端部署:** 自动部署至 Cloudflare Pages，使用 Postgres 数据库。

## 2\. 技术栈 (Tech Stack)

  * **Framework:** Next.js 14 (App Router, TypeScript)
  * **Deployment:** Cloudflare Pages (using `@cloudflare/next-on-pages`)
  * **UI Library:** Tailwind CSS, Shadcn/UI, Lucide Icons
  * **Database:** PostgreSQL (Supabase/Neon) + Prisma ORM
  * **State Management:** Zustand (Global Player), TanStack Query v5 (Async Polling)
  * **Auth:** Clerk
  * **HTTP:** Axios

-----

## 3\. 数据库设计 (Database Schema)

**Instruction:** Create `prisma/schema.prisma` with the following models.

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 1. User Identity
model User {
  id            String    @id @default(uuid())
  clerkId       String    @unique
  email         String    @unique
  name          String?
  avatarUrl     String?
  
  wallet        Wallet?
  transactions  Transaction[]
  tasks         Task[]
  uploads       Upload[]  // Local audio files for remixing
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// 2. Credit System (Wallet)
model Wallet {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  balance   Int      @default(0) // Available credits
  version   Int      @default(0) // Optimistic locking
  updatedAt DateTime @updatedAt
}

// 3. Financial Records (Double-Entry)
model Transaction {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  amount      Int      // +100 (Recharge) or -5 (Consume)
  type        String   // 'RECHARGE', 'CONSUME', 'REFUND'
  description String?
  referenceId String?  // Optional: Task ID or Order ID
  createdAt   DateTime @default(now())
  
  @@index([userId])
}

// 4. Music Generation Tasks
model Task {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  // Suno API Fields
  sunoTaskId  String?  @unique // ID returned by Kie.ai
  prompt      String
  tags        String?
  model       String   // 'chirp-v3-5', 'v4'
  status      String   // 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
  
  // Results
  title       String?
  audioUrl    String?
  imageUrl    String?
  duration    Float?
  
  // Remix / Extend Reference
  parentAudioId String? // If generated from an upload or existing song
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 5. Local Audio Uploads (For Remixing)
model Upload {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  fileName    String
  fileSize    Int
  remoteId    String   // The 'audio_id' returned by Kie.ai upload endpoint
  status      String   // 'READY', 'FAILED'
  
  createdAt   DateTime @default(now())
}
```

-----

## 4\. API 接口定义 (Type Definitions)

**Instruction:** Create `lib/types/suno.ts`.

```typescript
export type SunoModel = 'chirp-v3-5' | 'chirp-v3-0';

export interface SunoGenerateParams {
  prompt: string;
  tags?: string;
  mv?: SunoModel;
  title?: string;
  make_instrumental?: boolean;
  continue_clip_id?: string; // For Remix/Extend
  continue_at?: number;
}

export interface SunoTaskResponse {
  id: string; // The Suno Task ID
  status: 'submitted' | 'queued' | 'streaming' | 'complete' | 'error';
  audio_url?: string;
  image_url?: string;
  title?: string;
  metadata?: any;
}
```

-----

## 5\. 核心业务逻辑 (Core Logic Specs)

### 5.1 API Client (`lib/suno-client.ts`)

  * Create a singleton class `SunoClient`.
  * **Base URL:** Load from `process.env.SUNO_BASE_URL`.
  * **Auth:** Load `process.env.SUNO_API_KEY` and set as `Authorization: Bearer <token>` header.
  * **Methods:**
      * `generate(params)`: Calls POST `/generate`.
      * `getStatus(ids[])`: Calls GET `/feed?ids=...`.
      * `uploadAudio(formData)`: Calls the upload endpoint for Remix files.

### 5.2 后端代理与积分扣除 (`app/api/generate/route.ts`)

**Process Flow:**

1.  **Auth Check:** Verify Clerk user (`auth().userId`).
2.  **Validation:** Check if user has enough credits in `Wallet`.
3.  **Transaction:** Use `prisma.$transaction`:
      * Decrement `Wallet.balance`.
      * Create `Transaction` record (`type: 'CONSUME'`).
      * Call `SunoClient.generate()`.
      * Create `Task` record with `status: 'PENDING'`.
4.  **Error Handling:** If API call fails, throw error and ensure transaction rolls back.

### 5.3 前端状态与轮询 (`Hooks`)

  * **`useBatchGenerator` Hook:**
      * Uses **TanStack Query** to fetch `/api/tasks`.
      * **Smart Polling:** `refetchInterval` is set to `3000` (3s) *only when* there is at least one task with `status !== 'COMPLETED' && status !== 'FAILED'`.
  * **`usePlayerStore` (Zustand):**
      * State: `currentTrack`, `isPlaying`, `volume`.
      * Component: A persistent `PlayerBar` in `app/layout.tsx`.

-----

## 6\. 部署配置 (Deployment Config)

**Instruction:** Strictly follow these steps for Cloudflare Pages compatibility.

1.  **Package.json:**
    Add script: `"pages:build": "npx @cloudflare/next-on-pages"`
    Add dependency: `npm install -D @cloudflare/next-on-pages`

2.  **Runtime Config:**
    In `app/api/generate/route.ts` (and all API routes), add:

    ```typescript
    export const runtime = 'nodejs'; // Use Node compatibility mode
    ```

3.  **Cloudflare Dashboard Settings:**

      * **Build Command:** `npm run pages:build`
      * **Output Directory:** `.vercel/output/static`
      * **Compatibility Flags:** Add `nodejs_compat`
      * **Environment Variables:**
          * `DATABASE_URL` (Must be a connection pool URL if using Supabase/Neon).
          * `SUNO_API_KEY`, `SUNO_BASE_URL`
          * `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

-----

## 7\. Implementation Steps (For AI)

**Please execute the following tasks in order:**

1.  **Setup:** Initialize Shadcn/UI, install `axios`, `zustand`, `@tanstack/react-query`, `lucide-react`, `@prisma/client`, `prisma`, `@clerk/nextjs`.
2.  **Database:** Create `prisma/schema.prisma` using the schema above and run `npx prisma generate`.
3.  **Lib:** Create `lib/suno-client.ts` and `lib/types/suno.ts`.
4.  **Backend:** Implement `app/api/generate/route.ts` with the transaction logic.
5.  **Frontend (Components):** Create `components/music/generator-form.tsx` (with tabs for Text/Remix) and `components/music/task-list.tsx`.
6.  **Frontend (State):** Implement `hooks/use-player-store.ts` and the `PlayerBar` component.
7.  **Deployment Prep:** Update `package.json` build scripts.

-----

### 💡 提示 (给凌一)

**如何使用：**

1.  确保你本地已经初始化了一个 Next.js 项目 (`npx create-next-app@latest`).
2.  复制上面的 Markdown 内容。
3.  打开 **Cursor** 或 **VS Code + Claude**。
4.  输入：`"Here is the PRD for my project SunoFlow. Please start with Step 1: Setup and Database."`