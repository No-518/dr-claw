# AGENTS.md — VibeLab

## Project Overview

VibeLab is a full-stack web UI for Claude Code CLI, Cursor CLI, and OpenAI Codex. It provides a desktop/mobile interface for managing AI coding sessions, file editing, git operations, and an integrated Research Lab for AI-driven research automation pipelines.

## Commands

```bash
npm run dev        # Development — runs Express server + Vite dev server concurrently
npm run build      # Build frontend only (Vite production build)
npm run start      # Production — build + start server
npm run typecheck  # TypeScript type checking (frontend only)
```

- Dev frontend: `http://localhost:5173` (proxies API to backend)
- Dev backend: `http://localhost:3001`
- Production: `http://localhost:3001` (serves built frontend from `dist/`)

There is no test runner or linter configured. Do not create test files unless explicitly asked.

## Working Agreements

### Language boundaries
| Directory | Language | Notes |
|-----------|----------|-------|
| `server/` | Plain JavaScript | No TypeScript, no type annotations, no `.ts` files |
| `src/` | TypeScript preferred | Existing `.js`/`.jsx` OK; new files should be `.ts`/`.tsx` |
| `shared/` | Plain JavaScript | Imported by both frontend and backend |

### Import rules
- ES modules everywhere (`import`/`export`). **Never** use `require()`.
- Backend imports **must** include `.js` extension: `import foo from './foo.js'`
- Frontend imports omit extensions (Vite resolves them).

### Component patterns
- Feature directories: `src/components/<feature>/view/` for main views, `subcomponents/` for children.
- UI primitives: `src/components/ui/` follow shadcn patterns (`cva` + `tailwind-merge` + `React.forwardRef`).

### State management
- React Context + custom hooks only. No Redux, Zustand, or other state libraries.
- 5 Context providers in `App.tsx`: Auth, WebSocket, Theme, TaskMaster, TasksSettings.

### Commit messages
- Conventional commits: `feat(scope):`, `fix(scope):`, `refactor(scope):`, `docs(scope):`

## Frontend Patterns

### React & TypeScript
- React 18 + TypeScript with Vite, Tailwind CSS, React Router 6.
- Entry: `src/main.jsx` → `src/App.tsx` → `src/components/app/AppContent.tsx`
- Core types in `src/types/app.ts`: `AppTab`, `SessionProvider`, `Project`, `ProjectSession`.
- Tab types: `chat`, `files`, `shell`, `git`, `researchlab`, `skills`, `tasks`, `preview`.

### API layer
- **Always** use `authenticatedFetch` or the `api` object from `src/utils/api.js`.
- **Never** use raw `fetch()` in frontend code (except unauthenticated auth endpoints in `api.js`).
- `authenticatedFetch` auto-attaches JWT token and Content-Type headers.
- The `api` object provides typed methods for each endpoint.

### i18n
- 3 locales: `en`, `zh-CN`, `ko` in `src/i18n/locales/`.
- Namespaces: `common`, `chat`, `sidebar`, `auth`, `settings`, `codeEditor`.
- Use `useTranslation('namespace')` from `react-i18next`.
- **Every string change must update all 3 locales.**

### Styling
- Tailwind CSS only. No CSS modules, styled-components, or other CSS-in-JS.
- Use `cn()` from `src/lib/utils.js` to merge class names.
- Icons: `lucide-react` only.
- Dark mode: class-based Tailwind via `ThemeContext`.

## Backend Patterns

### Express server
- `server/index.js` — main entry, mounts routes, sets up WebSocket server, file watcher.
- Routes in `server/routes/`: `agent`, `auth`, `git`, `projects`, `mcp`, `settings`, `taskmaster`, `cursor`, `codex`, `skills`, `user`, `commands`, `cli-auth`, `mcp-utils`.
- Route pattern: export Express Router from `server/routes/<name>.js`, import and mount in `server/index.js`.

### Authentication
- Protected routes: `app.use('/api/...', authenticateToken, router)`
- `authenticateToken` middleware from `server/middleware/auth.js`.
- JWT tokens + bcrypt password hashing.
- Public endpoints: `/api/auth/*`, `/health`.

### Error handling
- Wrap async handlers in try/catch.
- Return proper HTTP status codes (400, 403, 404, 500).
- Log errors with `console.error('[ERROR]', ...)`.

### Database
- SQLite via `server/database/db.js` — tables: `users`, `api_keys`, `user_credentials`.

### Agent integrations
- `server/claude-sdk.js` — Claude Code via `@anthropic-ai/claude-agent-sdk`
- `server/cursor-cli.js` — Cursor via CLI process spawn
- `server/openai-codex.js` — Codex via `@openai/codex-sdk`
- Model constants: `shared/modelConstants.js` — never hardcode model IDs.

## WebSocket Protocol

### Connection paths
- `/ws` — Chat (agent commands, session management, project updates)
- `/shell` — Terminal PTY (shell I/O, resize events)

### Message format
All messages are JSON with a `type` field:
```json
{ "type": "message-type", ...payload }
```

### Chat message types (client → server)
- `claude-command` / `cursor-command` / `codex-command` — send prompt to agent
- `abort-session` — abort active session
- `check-session-status` — check if session is processing
- `get-active-sessions` — list all active sessions
- `claude-permission-response` — respond to tool approval

### Chat message types (server → client)
- `projects_updated` — project list changed
- `loading_progress` — progress during project scan
- `session-aborted`, `session-status`, `active-sessions`, `error`

### Shell message types
- Client: `init` (start session), `input` (keystrokes), `resize` (terminal dimensions)
- Server: `output` (terminal data), `auth_url` (detected auth URL)

### Authentication
- Token via query parameter or Authorization header.
- Platform mode: auto-authenticates first database user.

## Architecture Reference

| Path | Purpose |
|------|---------|
| `src/main.jsx` | Frontend entry point |
| `src/App.tsx` | Root component with Context providers |
| `src/types/app.ts` | Core TypeScript types |
| `src/utils/api.js` | API layer (`authenticatedFetch`, `api` object) |
| `src/lib/utils.js` | `cn()` utility for Tailwind class merging |
| `src/i18n/locales/` | i18n translation files (en, zh-CN, ko) |
| `src/components/ui/` | shadcn-style UI primitives |
| `server/index.js` | Server entry, route mounting, WebSocket setup |
| `server/routes/` | Express route modules |
| `server/middleware/auth.js` | Auth middleware (`authenticateToken`, `authenticateWebSocket`) |
| `server/database/db.js` | SQLite database setup |
| `shared/modelConstants.js` | Model definitions for all 3 agents |
| `skills/` | Research Lab pipeline skills |
| `skills/skill-tag-mapping.json` | Skill tag configuration (multilingual) |

## Validation

```bash
npm run typecheck   # Must pass
npm run build       # Must pass
```

No test runner exists. Do not add test files unless asked.

## Security

- Validate and resolve all file paths before I/O. Use `path.resolve()` and verify the resolved path stays within allowed directories.
- Use `authenticateToken` middleware on all protected API routes.
- Never log secrets, tokens, or API keys.
- Sanitize user input in file paths, project names, and skill names.

## Common Pitfalls

- **No TypeScript in `server/`** — plain JS only. Type annotations cause runtime errors.
- **No `require()`** — ES modules only (`"type": "module"` in package.json).
- **No new UI libraries** — use existing dependencies (Tailwind, shadcn/cva, lucide-react).
- **Route mounting** — new route files must be imported and mounted in `server/index.js`.
- **i18n completeness** — update all 3 locales when changing strings.
- **Model constants** — use `shared/modelConstants.js`, never hardcode model IDs.
- **API layer** — use `authenticatedFetch` / `api` object, never raw `fetch()` in frontend.
- **Backend imports** — must include `.js` extension.

## Deployment Modes

- **OSS mode** (default): local SQLite auth, direct WebSocket.
- **Platform mode** (`VITE_IS_PLATFORM=true`): hosted deployment, auth via proxy.
