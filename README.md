# Email Bulk Deliverability Check — `email_batch` | EmailCheckPro

Bulk deliverability check is built for lists from a thousand addresses upward: upload a file, the task runs in the background, and you download a result archive when it completes. Any domain is accepted in the same file — there is no provider to choose.

This is the official EmailCheckPro example repository for **one** bulk product, `email_batch`. It is an asynchronous task: upload a file, get a task id immediately, poll the task, and download the result file when it finishes.

- **Product page:** https://emailcheckpro.com/products/email_batch
- **API documentation:** https://emailcheckpro.com/api-docs
- **API base URL:** `https://emailcheckpro.com`
- **Authentication:** `X-API-Key`
- **Get an API key:** https://emailcheckpro.com/register

## What is it usually used for?

- List cleaning
- Database hygiene
- Periodic re-checks

## What does the result file contain?

| Column | Example | Meaning |
|---|---|---|
| `email` | `alex.kim@example.com` | The submitted address. |
| `activated` | `yes` | Whether the address is deliverable — whether it can receive mail. |
| `result` | `deliverable` | Deliverability outcome, e.g. `deliverable`. The value passes through from the verification engine. |
| `reason` | `accepted_email` | Why that outcome was reached, e.g. `accepted_email`. The value passes through from the verification engine. |

The result is a **point-in-time signal**, not a verdict, and not identity data. It describes what the provider reported at the moment the task ran.

## How do I submit a task?

Upload a `.txt` or `.csv` with **one email address per line**, 1,000–100,000 valid entries. There is **no country** on email tasks: do not send the `country` field.

```bash
curl -X POST 'https://emailcheckpro.com/api/v1/bulk-tasks' \
  -H 'X-API-Key: YOUR_API_KEY' \
  -F 'product=email_batch' \
  -F 'file=@emails.txt'
```

The response returns the task id and `status=processing`, along with the server-side quote taken before processing starts.

## How do I poll a task and download the result?

```bash
curl -fsS 'https://emailcheckpro.com/api/v1/bulk-tasks/TASK_ID' -H 'X-API-Key: YOUR_API_KEY'
```

`status` is `processing`, `success` or `failed` — there is no progress percentage to poll for. **Do not poll more often than once every 30 seconds.** When the task succeeds the response carries the result-file download link.

## Bulk task or realtime check?

`POST /api/v1/bulk-tasks` (this repository) takes a file of 1,000–100,000 entries and answers later — that is the shape for list cleaning, campaign preparation and enrichment runs. A **realtime** check (`POST /api/v1/check`, or `POST /api/v1/batch-check` for up to 100 identifiers) answers inside the same HTTP response, for a signup form or a live lookup. The two are separate endpoints and are not interchangeable; see the other repositories under [emailcheckpro](https://github.com/emailcheckpro).

## What about billing?

The whole file is reserved on submit. When the task finishes you are charged only for the entries that were actually checked and the remainder is returned. A failed task is refunded in full.

## What are the limits and error codes?

| Limit | Value |
|---|---|
| Entries per task | 1,000–100,000 |
| File formats | `.txt`, `.csv`, one entry per line |
| Products per task | 1 (`email_batch`) |
| Country | not applicable — omit the field |
| Poll interval | no more than once per 30 seconds |

`40000`/`40001` are request or file errors; `40100` is an invalid key; `40200` is insufficient balance; `42900` is rate limited — honour `Retry-After`; `50300` is temporary maintenance. `GET /api/v1/balance` returns the current balance in `data.balance_micros`.

Keep the key on a trusted server and read it from `EMAILCHECKPRO_API_KEY`. Never commit it or expose it in production browser code.

## Runnable examples in seven languages

| Language | Example |
|---|---|
| Python | [`examples/python`](examples/python) |
| Node.js | [`examples/nodejs`](examples/nodejs) |
| Go | [`examples/go`](examples/go) |
| Java | [`examples/java`](examples/java) |
| C# | [`examples/csharp`](examples/csharp) |
| PHP | [`examples/php`](examples/php) |
| Shell / curl | [`examples/shell`](examples/shell) |

## Official resources and responsible use

- **This product:** https://emailcheckpro.com/products/email_batch
- **All products:** https://emailcheckpro.com/products
- **Documentation:** https://emailcheckpro.com/api-docs
- **Registration:** https://emailcheckpro.com/register
- **Pricing:** https://emailcheckpro.com/pricing
- **OpenAPI contract:** [`openapi.yaml`](openapi.yaml)
- **License:** [MIT](LICENSE) for the sample code

Submit only data you are authorized to process, and comply with applicable privacy laws and platform terms. Report the signal you received as a signal; do not relabel it downstream as a conclusion it does not support.

---

*Last reviewed: 2026-09-22 · Maintained by EmailCheckPro. Canonical documentation: https://emailcheckpro.com/api-docs*
