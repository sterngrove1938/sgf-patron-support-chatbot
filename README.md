# Stern Grove Festival Patron Support Chatbot

This is the working scaffold for the Stern Grove Festival website chatbot.

The MVP is designed around three rules:

1. Answer only from the 10 approved Source Pack documents.
2. Keep `Ask a Staff Member` visible throughout the chat.
3. Escalate personal, unsupported, sensitive, or unclear questions instead of guessing.

## Current Status

This scaffold is ready for local UI/backend testing with placeholder credentials. It does not include live OpenAI or Google Drive credentials yet.

## Testing Cost Posture

Before running real API QA, set an OpenAI project budget cap of about `$25`.

Recommended test model:

```text
gpt-5.4-mini
```

Expected testing cost is likely a few dollars for multiple 50-question QA passes. The vector store should stay inside the first free 1 GB of file-search storage.

## Local Run

Copy `.env.example` to `.env` and fill in values when available.

```bash
node scripts/dev-server.js
```

Open:

```text
http://localhost:8787
```

## Deploy Shape

- `api/chat.js` handles browser requests and calls OpenAI server-side.
- `public/widget.js` is the Squarespace-embeddable chat widget.
- `docs/behavior-spec.md` defines response, escalation, and handoff behavior.
- `docs/source-pack-sync.md` defines the planned Google Drive to OpenAI vector store sync.

## Source Pack Boundary

Only these documents should be uploaded to the OpenAI vector store:

1. `01-ticketing-and-lottery`
2. `02-getting-here-transportation`
3. `03-accessibility-ada`
4. `04-what-to-bring`
5. `05-seating-information`
6. `06-food-and-drink`
7. `07-volunteering`
8. `08-code-of-conduct`
9. `09-general-information-contact`
10. `10-2026-season-lineup`

Internal documents can guide instructions and routing, but must not be uploaded as retrieval sources.
