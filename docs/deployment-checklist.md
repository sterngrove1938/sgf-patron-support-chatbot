# Staging Deployment Checklist

## Accounts

- GitHub repository for this project.
- Vercel account connected to the GitHub repository.
- OpenAI API project with a temporary testing budget cap around `$25`.

## OpenAI Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.4-mini
OPENAI_VECTOR_STORE_ID=...
PATRON_EXPERIENCE_FORM_URL=...
DEVELOPMENT_EMAIL=development@sterngrove.org
HR_EMAIL=hr@sterngrove.org
RECOMMENDED_OPENAI_TEST_BUDGET_USD=25
```

Do not put secrets in GitHub source files.

## Deployment Phases

### 1. Hosted Stub

Deploy before adding `OPENAI_API_KEY` and `OPENAI_VECTOR_STORE_ID`.

Expected behavior:

- Public Vercel URL loads the widget.
- Chat endpoint responds in stub mode.
- `Ask a Staff Member` button opens the configured form destination once available.

### 2. Live OpenAI

After the API key and vector store are ready:

- Add `OPENAI_API_KEY`.
- Add `OPENAI_VECTOR_STORE_ID`.
- Confirm `OPENAI_MODEL=gpt-5.4-mini`.
- Redeploy.
- Run the 7 minimum QA questions, then the 50-question test set.

## OpenAI API Key Steps

1. Go to the OpenAI Platform dashboard.
2. Create or select the SGF chatbot project.
3. Set a project budget cap around `$25` for initial testing.
4. Create a new API key for the project.
5. Copy it once and store it directly in Vercel environment variables.
6. Do not paste the key into chat, docs, GitHub, or client-side code.

## Vector Store Steps

Once the API key exists:

1. Export only the 10 approved Source Pack docs from Google Drive.
2. Create one vector store named `sgf-source-pack-staging`.
3. Upload the 10 exported files.
4. Wait until all vector store files are processed.
5. Copy the vector store id, which starts with `vs_`.
6. Set `OPENAI_VECTOR_STORE_ID` in Vercel.

## Launch Gate

Do not embed this on the live Stern Grove website until:

- Source Pack docs 01-10 are the only vector store files.
- The 7 minimum tests pass.
- The 50-question test set has been run.
- Raw form URL does not appear in chat answer text.
- Ask a Staff Member remains visible throughout the chat.
