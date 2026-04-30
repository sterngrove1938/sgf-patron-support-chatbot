import { openAsBlob } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const apiKey = process.env.OPENAI_API_KEY;
const sourceDir = process.env.SOURCE_PACK_DIR || "source-pack";
const storeName = process.env.VECTOR_STORE_NAME || "sgf-source-pack-staging";

const expectedFiles = [
  "01-ticketing-and-lottery",
  "02-getting-here-transportation",
  "03-accessibility-ada",
  "04-what-to-bring",
  "05-seating-information",
  "06-food-and-drink",
  "07-volunteering",
  "08-code-of-conduct",
  "09-general-information-contact",
  "10-2026-season-lineup"
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function openAI(path, options = {}) {
  const response = await fetch(`https://api.openai.com/v1${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${apiKey}`,
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`${options.method || "GET"} ${path} failed: ${response.status} ${details}`);
  }

  return response.json();
}

async function findSourceFiles() {
  const entries = await readdir(sourceDir);
  const files = [];

  for (const expected of expectedFiles) {
    const match = entries.find((entry) => basename(entry, extname(entry)) === expected);
    if (!match) {
      fail(`Missing Source Pack file for ${expected} in ${sourceDir}`);
    }

    const path = join(sourceDir, match);
    const fileStat = await stat(path);
    if (!fileStat.isFile()) {
      fail(`${path} is not a file`);
    }

    files.push(path);
  }

  return files;
}

async function uploadFile(path) {
  const form = new FormData();
  const file = await openAsBlob(path);
  form.append("purpose", "user_data");
  form.append("file", file, basename(path));

  return openAI("/files", {
    method: "POST",
    body: form
  });
}

async function createVectorStore(fileIds) {
  return openAI("/vector_stores", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: storeName,
      description: "Stern Grove Festival approved patron-facing Source Pack.",
      file_ids: fileIds
    })
  });
}

if (!apiKey) {
  fail("Set OPENAI_API_KEY before running this script.");
}

const files = await findSourceFiles();
console.log(`Uploading ${files.length} Source Pack files...`);

const uploaded = [];
for (const file of files) {
  const result = await uploadFile(file);
  uploaded.push(result);
  console.log(`Uploaded ${basename(file)} -> ${result.id}`);
}

const store = await createVectorStore(uploaded.map((file) => file.id));

console.log("");
console.log("Vector store created.");
console.log(`OPENAI_VECTOR_STORE_ID=${store.id}`);
console.log("");
console.log("Add that value to Vercel environment variables, then redeploy.");
