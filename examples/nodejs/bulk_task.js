import { readFile } from "node:fs/promises";

const apiKey = process.env.EMAILCHECKPRO_API_KEY;
if (!apiKey) throw new Error("Set EMAILCHECKPRO_API_KEY");
const baseUrl = (process.env.API_BASE_URL || "https://emailcheckpro.com").replace(/\/$/, "");
const path = process.env.FILE || "examples/emails.txt";
const form = new FormData();
form.set("service_type", "email_batch");
form.set("file", new Blob([await readFile(path)]), "emails.txt");
const headers = { "X-API-Key": apiKey };
if (process.env.IDEMPOTENCY_KEY) headers["Idempotency-Key"] = process.env.IDEMPOTENCY_KEY;

async function readApi(response) {
  if (!response.ok) throw new Error(await response.text());
  const envelope = await response.json();
  if (envelope.code !== 0) throw new Error(JSON.stringify(envelope));
  return envelope.data;
}

const created = await readApi(await fetch(`${baseUrl}/api/v1/bulk-tasks`, {
  method: "POST", headers, body: form, signal: AbortSignal.timeout(180_000),
}));
const taskId = created.id;
console.log("submitted", taskId);
for (;;) {
  await new Promise((resolve) => setTimeout(resolve, 30_000));
  const data = await readApi(await fetch(`${baseUrl}/api/v1/bulk-tasks/${encodeURIComponent(taskId)}`, {
    headers: { "X-API-Key": apiKey }, signal: AbortSignal.timeout(60_000),
  }));
  console.log(data);
  if (data.status === "failed") throw new Error(`Task failed: ${data.reason || ""} ${data.reason_detail || ""}`);
  if (data.status === "success" && data.result_url) break;
}
