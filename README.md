# MySapienta status

The public status page at https://status.mysapienta.com.

- `checker/` checks each service in `services.json` every 5 minutes (GitHub Actions) and commits the results to the `data` branch.
- `src/` is the page. It reads `status.json` and `history.json` from the `data` branch.
- `incidents/` holds one markdown file per incident. See `docs/incidents.md`.

This repository is public. Do not add secrets, internal hostnames or staging URLs.

## Commands

```
pnpm install
pnpm dev      # run the page locally against live data
pnpm test     # unit and component tests
pnpm e2e      # screenshot tests (local only)
pnpm check    # run the checker once, writes to ./data
```

## Adding a service

Add a line to `services.json` and push. `healthy` is `ok` (must return 2xx) or `reachable` (any response below 500).

## Things to know

- GitHub runs scheduled jobs late, often by 5 to 15 minutes. Outages shorter than about 10 minutes may not be recorded.
- GitHub turns off scheduled workflows after 60 days without repository activity. The checker's own commits count as activity; if checks ever stop, re-enable the workflow under Actions.
- The page warns visitors when the last check is more than 20 minutes old.
