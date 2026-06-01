# Contributing to dataforseo-mcp-server

Thank you for contributing. Please read this guide before opening a PR.

## Running Tests

```bash
npm install
npm test
```

All tests live in `test/`. Each module has a `*-paths.test.ts` file that verifies endpoint URL construction. Tests must pass before submitting a PR.

## Coding Standards

- **TypeScript** — all files must compile cleanly with `tsc --noEmit`.
- **Type hints** — every function must have explicit parameter and return types; avoid `any`.
- **Zod schemas** — use `z.coerce.number()` (not `z.number()`) for numeric MCP tool inputs. MCP clients frequently pass numeric values as strings, so coercion lets the schema (used for tool introspection) and any validation layer that parses inputs accept stringified numbers. Note that handlers invoked directly via the HTTP bridge (`src/server-http.ts`) do not run Zod parsing, so enforce hard constraints (e.g. array length limits) in the handler rather than relying on the schema alone.
- **No hardcoded credentials** — read credentials exclusively from `process.env`. See `.env.example`.
- **Endpoint accuracy** — always verify the URL path against the official [DataForSEO documentation](https://docs.dataforseo.com/) before coding. Do not guess.

## Adding a New Module

Use the Local Falcon integration (`src/api/localfalcon/`) as the reference pattern:

1. Create `src/api/<module>/index.ts`.
2. Export a `register<Module>Tools(server, client)` function.
3. Register each tool with `server.tool(name, description, zodSchema, handler)`.
4. Import and call your registration function from `src/index.ts`.
5. Add a corresponding `test/<module>-paths.test.ts` with at minimum one path-correctness test per tool.

## Verifying Endpoint Paths (RAG-First Rule)

Before writing any endpoint URL, look it up:

1. Search the project's RAG knowledge base (if configured) with the tool name or endpoint description.
2. Cross-check against the [DataForSEO API docs](https://docs.dataforseo.com/).
3. **Never guess** a URL. Incorrect paths are the primary source of bugs in this codebase.

When a DataForSEO endpoint does not exist (verified in the docs), the tool should return a clear, user-friendly error message rather than making a broken HTTP request. Keep the tool registered for backward compatibility but mark it deprecated in the description.

## Running npm audit

Before opening a PR, run:

```bash
npm audit
```

Fix any **high** or **critical** vulnerabilities. Low/moderate vulnerabilities that require `--force` (breaking changes) may be left as-is with a note in the PR description. Do **not** use `npm audit fix --force` without explicit approval from a maintainer.

## Commit Style

- Use the imperative mood: "Fix endpoint path for …", "Add tool for …".
- One logical change per commit.
- Reference the relevant DataForSEO docs page in the commit body if the change fixes an endpoint URL.
