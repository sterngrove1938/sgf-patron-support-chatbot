import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import handler from "../api/chat.js";

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "127.0.0.1";
const root = process.cwd();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function toWebRequest(nodeRequest, body) {
  return new Request(`http://localhost:${port}${nodeRequest.url}`, {
    method: nodeRequest.method,
    headers: nodeRequest.headers,
    body
  });
}

function send(nodeResponse, status, body, headers = {}) {
  nodeResponse.writeHead(status, headers);
  nodeResponse.end(body);
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://localhost:${port}`);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = join(root, "public", pathname);
  const content = await readFile(filePath);
  const type = mimeTypes[extname(filePath)] || "application/octet-stream";
  send(response, 200, content, { "content-type": type });
}

createServer(async (request, response) => {
  try {
    if (request.url === "/api/chat") {
      const body = await readBody(request);
      const webResponse = await handler(toWebRequest(request, body));
      const text = await webResponse.text();
      send(response, webResponse.status, text, Object.fromEntries(webResponse.headers));
      return;
    }

    await serveStatic(request, response);
  } catch (error) {
    if (error.code === "ENOENT") {
      send(response, 404, "Not found", { "content-type": "text/plain; charset=utf-8" });
      return;
    }

    console.error(error);
    send(response, 500, "Server error", { "content-type": "text/plain; charset=utf-8" });
  }
}).listen(port, host, () => {
  console.log(`SGF chatbot prototype running at http://${host}:${port}`);
});
