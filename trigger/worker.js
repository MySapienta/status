// Starts the "Check services" workflow on a dependable schedule.
// GitHub's own scheduler did not fire for this repository, so a Cloudflare cron
// trigger calls workflow_dispatch instead. GITHUB_TOKEN is a Worker secret: a
// fine-grained token limited to this repository with Actions read and write.
const DISPATCH_URL = 'https://api.github.com/repos/MySapienta/status/actions/workflows/check.yml/dispatches'

export default {
  async scheduled(_event, env) {
    const response = await fetch(DISPATCH_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.GITHUB_TOKEN}`,
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28',
        'user-agent': 'mysapienta-status-trigger',
      },
      body: JSON.stringify({ ref: 'main' }),
    })
    if (!response.ok) {
      throw new Error(`Could not start the check workflow: HTTP ${response.status} ${await response.text()}`)
    }
  },
}
