# KnowledgeVault Frontend

React, TypeScript, Vite, Tailwind CSS, and Radix UI power the KnowledgeVault web client. The app lets authenticated users create notebooks, upload or import documents, manage group members, and chat against indexed document knowledge from the backend API.

## Tech Stack

- React 19 with React Router
- TypeScript and Vite
- Tailwind CSS with Radix UI primitives
- Axios for API access
- Cloudflare Pages configuration via `wrangler.toml`

## Prerequisites

- Node.js 20 or newer
- npm
- A running KnowledgeVault backend, usually at `http://localhost:4000/api`

## Environment

Create `client/.env` for local development:

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_DEV_USER_ID=dev-user-1
VITE_MAX_UPLOAD_MB=25
```

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend API base URL. Defaults to `http://localhost:4000/api` if omitted. |
| `VITE_DEV_USER_ID` | Sends an `x-user-id` header during Vite development when backend dev auth is enabled. |
| `VITE_MAX_UPLOAD_MB` | Client-side upload size limit shown by the document uploader. |

The API client sends credentials with requests, so the backend `CORS_ORIGIN` must include the frontend origin.

For production builds, set `VITE_API_BASE_URL` to the deployed API URL. The checked-in `wrangler.toml` points Cloudflare Pages at `https://knowledge-vault-api.isher.dev/api`.

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

Vite serves the app at `http://localhost:5173` by default.

## Available Scripts

- `npm run dev` starts the local Vite development server.
- `npm run build` type-checks the project and writes a production build to `dist/`.
- `npm run lint` runs ESLint across the frontend codebase.
- `npm run preview` serves the built app locally for a production-style preview.

## Project Layout

```text
client/
  public/              Static assets and Cloudflare redirects
  src/
    components/        Shared layout and UI components
    features/          Auth, chat, documents, notebooks, overview, users
    hooks/             Shared React hooks
    lib/               API client and utility helpers
    pages/             Top-level routed pages
    types/             Shared TypeScript types
```

## Main Routes

- `/login` signs in an existing user.
- `/register` creates an account and starts email verification.
- `/create-notebook` creates a notebook after authentication.
- `/notebook/:id` opens the main dashboard, documents, chat, and notebook views.

## Backend Integration

The frontend expects backend responses to use the envelope shape:

```ts
{
  success: boolean;
  data: unknown;
  error: null | { code: string; message: string; details?: unknown };
  meta?: { requestId: string; timestamp: string };
}
```

Frontend API normalization lives in `src/lib/api.ts`. When local backend `ALLOW_DEV_AUTH=true` and `VITE_DEV_USER_ID` is set, the client sends the dev user header automatically during Vite development.
