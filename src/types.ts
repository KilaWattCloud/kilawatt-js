/**
 * Types mirror the live gateway contract implemented in
 * src/routes/api/public/v1/$.ts (payloadSchema + JSON responses).
 */

export type RoutingPolicy = "lowest_cost" | "lowest_latency" | "zero_quota";

export type WorkloadType = "agent_exec" | "fine_tune" | "batch_inference";

/** Body accepted by every v1 workload endpoint. All fields have server defaults. */
export interface JobRequest {
  /** e.g. "nvidia-h100", "nvidia-h200", "nvidia-b200". Default: "nvidia-h100". */
  gpu_type?: string;
  /** 1–64 GPUs. Default: 1. */
  card_count?: number;
  /** 1–86400 seconds of pre-authorized runtime. Default: 600. */
  duration_seconds?: number;
  /** Smart Order Router policy. Default: "lowest_cost". */
  routing_policy?: RoutingPolicy;
  /** Overrides the workload implied by the endpoint. */
  workload_type?: WorkloadType;
  /** Arbitrary workload-specific payload forwarded to the job. */
  payload?: Record<string, unknown>;
}

/** 200 response from a successful placement. */
export interface JobResponse {
  id: string;
  /** Public node label of the node that accepted the job. */
  provider: string;
  workload_type: WorkloadType;
  gpu_type: string;
  card_count: number;
  routing_policy: RoutingPolicy;
  /** Public labels of nodes tried before the successful one. */
  failover_from: string[];
  billed_usd: number;
  status: "running";
}

/** Per-node failure detail returned with a 503. */
export interface FailoverAttempt {
  node: string;
  error: string;
}

/** Error body shapes returned by the gateway. */
export interface ApiErrorBody {
  error: string;
  /** 400 — zod validation issues. */
  details?: unknown;
  /** 402 — USD needed to pre-authorize the job. */
  required_usd?: number;
  /** 503 — nodes attempted before giving up. */
  attempts?: FailoverAttempt[];
}

export interface KilawattClientOptions {
  /** Kilawatt API key (kw_live_…). Falls back to process.env.KILAWATT_API_KEY. */
  apiKey?: string;
  /** Defaults to https://www.kilawattcloud.dev/api/public/v1 */
  baseUrl?: string;
  /** Request timeout in ms. Default 60000. */
  timeoutMs?: number;
  /** Custom fetch implementation (defaults to global fetch). */
  fetch?: typeof globalThis.fetch;
}
