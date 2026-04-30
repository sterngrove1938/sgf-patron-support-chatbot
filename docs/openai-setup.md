# OpenAI Setup

## 1. Create The Project

1. Go to `https://platform.openai.com/`.
2. Open the project selector.
3. Create a project named `Stern Grove Chatbot`.
4. Set a temporary testing budget cap around `$25`.

## 2. Create The API Key

1. In the `Stern Grove Chatbot` project, open API keys.
2. Create a new project API key.
3. Copy it once.
4. Do not paste it into chat, GitHub, Squarespace, or public docs.

Use it only in:

- Vercel environment variable `OPENAI_API_KEY`.
- A local ignored `.env` file if we need to run vector-store creation locally.

## 3. Create The Vector Store

The project includes a helper:

```bash
SOURCE_PACK_DIR=source-pack OPENAI_API_KEY=... node scripts/create-vector-store.js
```

It expects exactly these 10 files in `source-pack/`:

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

The script prints:

```text
OPENAI_VECTOR_STORE_ID=vs_...
```

Add that value to Vercel.

## 4. Vercel Variables For Live QA

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.4-mini
OPENAI_VECTOR_STORE_ID=vs_...
PATRON_EXPERIENCE_FORM_URL=...
DEVELOPMENT_EMAIL=development@sterngrove.org
HR_EMAIL=hr@sterngrove.org
RECOMMENDED_OPENAI_TEST_BUDGET_USD=25
```

## Sources

- OpenAI vector stores API: `https://platform.openai.com/docs/api-reference/vector-stores/create`
- OpenAI vector store files API: `https://platform.openai.com/docs/api-reference/vector-stores-files/createFile`
