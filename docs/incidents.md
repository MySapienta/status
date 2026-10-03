# Writing an incident

Add one file per incident to `incidents/`, named `YYYY-MM-DD-short-name.md`, and push to `main`. The page rebuilds in about a minute.

```
---
title: Parent portal login problems
status: investigating
severity: minor
services: [guardian]
startedAt: 2026-10-03T14:00:00Z
resolvedAt:
---
2026-10-03T14:05:00Z - We are looking into reports that some parents cannot sign in.
```

- `status`: `investigating`, `identified`, `monitoring` or `resolved`.
- `severity`: `minor` or `major`.
- `services`: ids from `services.json`.
- Times are UTC, written like `2026-10-03T14:05:00Z`. Ghana time is the same as UTC.
- Add one line per update, oldest first: time, space, dash, space, what happened.
- When it is fixed, set `status: resolved`, fill `resolvedAt`, and add a final update.

Write for parents and teachers: say what is not working and what they can do, in plain words.
A malformed file fails the tests and the page is not published, so run `pnpm test` before pushing.
