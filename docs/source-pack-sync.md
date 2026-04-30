# Source Pack Sync Plan

## Goal

Keep the OpenAI vector store aligned with the approved Google Drive `Source Pack` folder.

## Source Scope

Sync only the 10 approved patron-facing documents. Do not sync implementation docs, UX rules, internal escalation rules, common support scenario notes, QA spreadsheets, or build prompts.

## Daily Sync

The production job should run daily and:

1. List files in the Google Drive Source Pack folder.
2. Confirm only the 10 approved documents are present.
3. Compare each file's modified time and content hash to the last sync record.
4. Export changed Google Docs as text or Markdown.
5. Upload changed content to OpenAI Files.
6. Attach or replace changed files in the OpenAI vector store.
7. Log timestamp, changed files, skipped files, failures, and vector store id.

## Cost Controls

- Keep one vector store for the Source Pack.
- Use the first 1 GB of free vector storage.
- Limit file search results during testing, starting with `max_num_results: 4`.
- Set a temporary OpenAI project budget cap of about `$25`.

## Pending Production Decisions

- Google Drive auth method: OAuth app or service account.
- Deployment host for scheduled sync: Vercel Cron, Render cron, Railway cron, or equivalent.
- Where sync logs live: lightweight database, hosted file/log drain, or admin-only sheet.
