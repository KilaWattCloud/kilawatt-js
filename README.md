# kilawatt-js

[![Build Status](https://github.com/KilaWattCloud/kilawatt-js/workflows/Test/badge.svg)](https://github.com/KilaWattCloud/kilawatt-js/actions)
[![Version](https://img.shields.io/github/v/release/KilaWattCloud/kilawatt-js)](https://github.com/KilaWattCloud/kilawatt-js/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Official Node.js / TypeScript client for the [Kilawatt Cloud](https://www.kilawattcloud.dev) GPU compute API.

Wraps the three live workload endpoints: agent execution, fine-tuning and batch inference. Nothing else — no stubs, no unreleased methods.

## Install

```sh
npm install kilawatt-js
```

Requires Node.js 18+ (uses the built-in `fetch`).

## Quick start

```ts
import { KilawattClient } from "kilawatt-js";

const client = new KilawattClient({ apiKey: process.env.KILAWATT_API_KEY });

const job = await client.agentExec({
  gpu_type: "nvidia-h100",
  card_count: 2,
  duration_seconds: 900,
  routing_policy: "lowest_cost",
  payload: { task: "summarise-corpus" },
});

console.log(job.id, job.provider, job.billed_usd);
```

If `apiKey` is omitted, the client reads `KILAWATT_API_KEY` from the environment.

## Methods

| Method | Endpoint |
| --- | --- |
| `client.agentExec(request)` | `POST /v1/agent/exec` |
| `client.fineTune(request)` | `POST /v1/fine-tune` |
| `client.batchInference(request)` | `POST /v1/batch/inference` |

### Request

Every field is optional; the gateway applies the defaults shown.

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `gpu_type` | `string` | `"nvidia-h100"` | e.g. `nvidia-h200`, `nvidia-b200` |
| `card_count` | `number` | `1` | 1–64 |
| `duration_seconds` | `number` | `600` | 1–86400, pre-authorized up front |
| `routing_policy` | `"lowest_cost" \| "lowest_latency" \| "zero_quota"` | `"lowest_cost"` | Smart Order Router policy |
| `workload_type` | `"agent_exec" \| "fine_tune" \| "batch_inference"` | endpoint default | Override only if needed |
| `payload` | `Record<string, unknown>` | – | Workload-specific data |

### Response

```ts
{
  id: string;
  provider: string;          // public label of the node that took the job
  workload_type: "agent_exec" | "fine_tune" | "batch_inference";
  gpu_type: string;
  card_count: number;
  routing_policy: RoutingPolicy;
  failover_from: string[];   // nodes tried before this one
  billed_usd: number;
  status: "running";
}
```

## Error handling

Non-2xx responses throw `KilawattApiError` carrying the gateway's real message and status.

```ts
import { KilawattApiError, KilawattConnectionError } from "kilawatt-js";

try {
  await client.batchInference({ gpu_type: "nvidia-b200", card_count: 8 });
} catch (err) {
  if (err instanceof KilawattApiError) {
    if (err.isPaymentRequired) {
      console.error(`Fund wallet: $${err.requiredUsd} needed — ${err.message}`);
    } else if (err.isRateLimited) {
      console.error("Rate or concurrency limit hit:", err.message);
    } else if (err.isCapacityError) {
      console.error("No node available:", err.attempts);
    } else {
      console.error(err.status, err.message);
    }
  } else if (err instanceof KilawattConnectionError) {
    console.error("Network problem:", err.message);
  }
}
```

| Status | Meaning |
| --- | --- |
| 400 | Invalid JSON or payload (`err.details` has the validation issues) |
| 401 | Missing, unknown or revoked API key |
| 402 | Insufficient balance or a spend cap blocked the job (`err.requiredUsd`) |
| 404 | Unknown endpoint |
| 429 | Per-key rate limit or concurrency limit |
| 503 | No node could place the job (`err.attempts`); safe to retry |

## Configuration

```ts
new KilawattClient({
  apiKey: "kw_live_…",
  baseUrl: "https://www.kilawattcloud.dev/api/public/v1", // default
  timeoutMs: 60_000,                                      // default
  fetch: customFetch,                                     // optional
});
```

## License

MIT
