# MySapienta status

The public status page at https://status.mysapienta.com.

- `checker/` checks each service in `services.json` every 5 minutes (GitHub Actions) and commits the results to the `data` branch.
- `trigger/` is a Cloudflare Worker whose 5-minute cron starts that check. GitHub's own scheduler did not fire for this repository, so it is kept only as an hourly backup.
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

- Checks run every 5 minutes. Outages shorter than that may not be recorded.
- The Worker starts checks with a GitHub token stored as the `GITHUB_TOKEN` Worker secret (fine-grained, this repository only, Actions read and write). When that token expires the checks stop: create a new one and run `npx wrangler secret put GITHUB_TOKEN` in `trigger/`.
- To redeploy the Worker: `cd trigger && npx wrangler deploy`.
- The page warns visitors when the last check is more than 20 minutes old.
