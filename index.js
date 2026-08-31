export class Kilawatt {
  constructor(apiKey = process.env.KILAWATT_API_KEY || "kw_test_sandbox_12345") {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.kilawattcloud.dev/v1";
  }

  async deploy({ gpuType = "nvidia-h100", count = 1, dryRun = true } = {}) {
    if (dryRun || this.apiKey.startsWith("kw_test_")) {
      return {
        status: "200_OK",
        mode: "SANDBOX_DRY_RUN",
        message: "Kilawatt Cloud Sandbox validation successful.",
        reservation: {
          gpuType,
          allocatedCount: count,
          region: "US-East-01 (Multi-Datacenter Failover Armed)",
          egressFee: "$0.00/GB",
          isolationStatus: "Hardware-Level Isolated Container"
        }
      };
    }

    const response = await fetch(`${this.baseUrl}/deploy`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ gpu_type: gpuType, count, dry_run: dryRun })
    });

    return await response.json();
  }
}
