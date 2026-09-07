import { KilawattApiError, KilawattConnectionError } from "./errors.js";
import type {
  ApiErrorBody,
  JobRequest,
  JobResponse,
  KilawattClientOptions,
} from "./types.js";

const DEFAULT_BASE_URL = "https://www.kilawattcloud.dev/api/public/v1";

export class KilawattClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(options: KilawattClientOptions = {}) {
    const apiKey = options.apiKey ?? process.env["KILAWATT_API_KEY"];
    if (!apiKey) {
      throw new Error(
        "Missing Kilawatt API key. Pass { apiKey } or set KILAWATT_API_KEY.",
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs ?? 60_000;
    const f = options.fetch ?? globalThis.fetch;
    if (!f) {
      throw new Error("No fetch implementation available. Use Node 18+ or pass { fetch }.");
    }
    this.fetchImpl = f;
  }

  /** POST /v1/agent/exec — run an agent execution workload. */
  agentExec(request: JobRequest = {}): Promise<JobResponse> {
    return this.post("agent/exec", request);
  }

  /** POST /v1/fine-tune — run a fine-tuning job. */
  fineTune(request: JobRequest = {}): Promise<JobResponse> {
    return this.post("fine-tune", request);
  }

  /** POST /v1/batch/inference — run a batch inference job. */
  batchInference(request: JobRequest = {}): Promise<JobResponse> {
    return this.post("batch/inference", request);
  }

  private async post(path: string, body: JobRequest): Promise<JobResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}/${path}`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (cause) {
      const timedOut = controller.signal.aborted;
      throw new KilawattConnectionError(
        timedOut
          ? `Request to /${path} timed out after ${this.timeoutMs}ms`
          : `Request to /${path} failed`,
        cause,
      );
    } finally {
      clearTimeout(timer);
    }

    const text = await response.text();
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = text;
    }

    if (!response.ok) {
      throw new KilawattApiError(
        response.status,
        (parsed ?? text) as ApiErrorBody | string,
      );
    }
    return parsed as JobResponse;
  }
}
