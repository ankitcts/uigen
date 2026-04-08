# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, and an LLM (Claude) generates React code that renders in a live preview pane. The app works without an API key using a mock provider that returns static components.

## Commands

- `npm run setup` — Install deps, generate Prisma client, run migrations (first-time setup)
- `npm run dev` — Start dev server with Turbopack (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run test` — Vitest (jsdom environment)
- `npx vitest run src/path/to/test.test.ts` — Run a single test file
- `npm run db:reset` — Reset SQLite database

## Architecture

### AI Chat Flow

1. User sends a message via `ChatProvider` (`src/lib/contexts/chat-context.tsx`), which uses `@ai-sdk/react`'s `useChat` hook
2. Request hits `POST /api/chat` route (`src/app/api/chat/route.ts`) with messages + serialized virtual filesystem
3. The route uses Vercel AI SDK's `streamText` with two tools:
   - `str_replace_editor` (`src/lib/tools/str-replace.ts`) — create/view/edit files via view, create, str_replace, insert commands
   - `file_manager` (`src/lib/tools/file-manager.ts`) — rename/delete files
4. Tools operate on `VirtualFileSystem` (`src/lib/file-system.ts`) — an in-memory filesystem (nothing written to disk)
5. Tool calls stream back to the client where `FileSystemProvider` (`src/lib/contexts/file-system-context.tsx`) applies them to the client-side VFS

### Live Preview Pipeline

`PreviewFrame` (`src/components/preview/PreviewFrame.tsx`) renders generated components in a sandboxed iframe:
1. Collects all files from the VFS
2. Transforms JSX/TSX via `@babel/standalone` (`src/lib/transform/jsx-transformer.ts`)
3. Creates blob URLs and an import map (third-party packages resolve to esm.sh)
4. Generates an HTML document with Tailwind CDN, import map, and React 19 from esm.sh

### LLM Provider

`src/lib/provider.ts` — Returns the Anthropic model (claude-haiku-4-5) when `ANTHROPIC_API_KEY` is set, otherwise returns `MockLanguageModel` that produces canned component responses (counter/form/card).

### Data Model

SQLite via Prisma. The database schema is defined in `prisma/schema.prisma` — always reference it to understand the data structure. Two models: `User` and `Project`. Projects store messages and VFS data as JSON strings. Prisma client is generated to `src/generated/prisma/`.

### Auth

JWT-based sessions (`src/lib/auth.ts`) using `jose`. Server actions in `src/actions/index.ts` handle sign-up/sign-in with bcrypt. Middleware protects `/api/projects` and `/api/filesystem` routes.

### Routing

- `/` — Anonymous users see MainContent directly; authenticated users redirect to their most recent project
- `/[projectId]` — Authenticated project page (redirects to `/` if not logged in)

### UI Layout

`MainContent` (`src/app/main-content.tsx`) is the main client component: resizable left panel (chat) + right panel (preview or code editor with file tree). Uses shadcn/ui (new-york style) with Radix primitives.

## Key Conventions

- Path alias: `@/*` maps to `./src/*`
- shadcn/ui components live in `src/components/ui/`; configured via `components.json`
- Tailwind CSS v4 with `@tailwindcss/postcss`
- The generated components in the VFS use `@/` imports (resolved in the import map to blob URLs)
- The system prompt for the LLM is in `src/lib/prompts/generation.tsx` — requires `/App.jsx` as entry point
