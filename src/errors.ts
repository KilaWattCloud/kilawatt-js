import type { ApiErrorBody, FailoverAttempt } from "./types.js";

/** Thrown for any non-2xx gateway response. Carries the real API error text. */
export class KilawattApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | string;
  readonly details?: unknown;
  readonly requiredUsd?: number;
  readonly attempts?: FailoverAttempt[];

  constructor(status: number, body: ApiErrorBody | string) {
    const message =
      typeof body === "string" ? body : body.error || `Kilawatt API error ${status}`;
    super(message);
    this.name = "KilawattApiError";
    this.status = status;
    this.body = body;
    if (typeof body !== "string") {
      this.details = body.details;
      this.requiredUsd = body.required_usd;
      this.attempts = body.attempts;
    }
  }

  /** 401 — key missing, unknown or revoked. */
  get isAuthError() {
    return this.status === 401;
  }
  /** 402 — insufficient balance or a spend cap blocked the job. */
  get isPaymentRequired() {
    return this.status === 402;
  }
  /** 429 — per-key rate or concurrency limit. */
  get isRateLimited() {
    return this.status === 429;
  }
  /** 503 — no node could place the job; safe to retry. */
  get isCapacityError() {
    return this.status === 503;
  }
}

/** Thrown when the request never produced a response (network error or timeout). */
export class KilawattConnectionError extends Error {
  readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "KilawattConnectionError";
    this.cause = cause;
  }
}
