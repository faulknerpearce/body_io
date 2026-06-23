# Cloudflare Pages Functions shim layer

This directory exists so Cloudflare Pages (with the repo-root `wrangler.toml`)
discovers the Pages Functions for the project.

The **real** implementations live in `packages/web/functions/`. The files in
this directory are one-line re-exports of those implementations:

```ts
// functions/mcp/[[path]].ts
export { onRequest } from '../../packages/web/functions/mcp/[[path]].ts'
```

## Why the shim?

Cloudflare Pages looks for `functions/` next to `wrangler.toml`, which in this
repo is at the root. The actual TypeScript sources live in
`packages/web/functions/` so the web package can be type-checked and built in
isolation. Adding a new Pages Function therefore requires two files:

1. The implementation in `packages/web/functions/<path>.ts` (or
   `packages/web/functions/<dir>/index.ts`).
2. A shim in `<root>/functions/<path>.ts` that re-exports `onRequest`.

When adding a shim, **mirror the file path** (including `.well-known/`,
nested `mcp/[[path]].ts`, etc.) so Cloudflare's routing matches the original
URL.

## Removing the shim

If you want to remove this layer, move the root `wrangler.toml`'s
`pages_build_output_dir` to a custom `[build]` setup that scans
`packages/web/functions/` directly. Out of scope for the current audit.
