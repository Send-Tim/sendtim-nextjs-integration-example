# Sendtim REST API + Next.js example

A small learning project for a community signup. It calls the Sendtim REST API from Next.js Route Handlers, keeping the API key on the server.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set `SENDTIM_API_KEY` to an API key created in **Sendtim → Settings → API**.
3. Start the app with `npm run dev` and open <http://localhost:3000>.
4. Submit the form with an email address, then check the contact in your Sendtim workspace.

Never use a `NEXT_PUBLIC_` prefix for the API key. `.env.local` is ignored by Git.

## Demo API routes

- `POST /api/contacts` — validates and upserts the signup contact.
- `GET /api/health` — public liveness check; it does not contact Sendtim or expose configuration.
- `GET /api/lists` — reads Sendtim lists, protected by the separate `SENDTIM_ADMIN_TOKEN`.

The shared helper in `app/api/_lib/sendtim.ts` adds the Bearer token, disables caching, applies a 10-second timeout, and keeps upstream error details out of the public response. The form submits an email and optional name. The optional `properties` object accepts only the string fields `company` and `source` in this example.

The public route includes same-origin validation, a 10 KB request limit, basic input validation, and an in-memory limit of five requests per ten minutes per client. The in-memory limiter is appropriate for this small example; use a shared limiter such as Redis or a provider-native rate limit for a multi-instance production deployment.

The public form syncs contacts, while the separately protected lists route demonstrates reading workspace data. It does not expose contacts through a public GET route, create a campaign, or guarantee that a contact is subscribed to a particular list. Confirm the supported contact fields, list subscription flow, consent requirements, and privacy obligations in your Sendtim workspace before using it with real signups. Use a test workspace/list for a public deployment.

The lists route is intentionally protected. Set `SENDTIM_ADMIN_TOKEN` to a long random value and send it as `x-demo-admin-token` when testing:

```bash
curl http://localhost:3000/api/lists \\
  -H "x-demo-admin-token: YOUR_ADMIN_TOKEN"
```

Do not put either token in client-side code or use a `NEXT_PUBLIC_` prefix.

## Public repository checklist

- Keep the Sendtim key only in `.env.local` or the hosting provider's secret manager; never use a `NEXT_PUBLIC_` prefix.
- Run `npm audit` before deployment and commit the generated `package-lock.json`.
- Add provider-level rate limiting or bot protection if the demo receives public traffic.
- Review Git history before publishing and rotate any credential that was ever committed.

## References

- [Sendtim API documentation](https://sendtim.com/docs)
- [Sendtim OpenAPI document](https://sendtim.com/openapi.yaml)
