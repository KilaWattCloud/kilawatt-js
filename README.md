# kilawatt-js

Official Node.js and TypeScript SDK for [Kilawatt Cloud](https://www.kilawattcloud.dev) — zero-quota, multi-datacenter GPU orchestration gateway.

Route AI workloads to H100, H200, B200, and A100 clusters across partner data centers through a single API. No quota requests, no waitlists, no infrastructure to own.

## Install

npm install @kilawatt/sdk

## Quick start

import { Kilawatt } from "@kilawatt/sdk";

const client = new Kilawatt({
  apiKey: process.env.KILAWATT_API_KEY,
});

const instance = await client.instances.create({
  gpuType: "h100",
  count: 8,
  policy: "zero_quota",
});

console.log(instance.status); // "provisioning"

## Authentication

Get an API key from your Kilawatt Cloud dashboard (https://www.kilawattcloud.dev) under Settings then API Keys. Pass it to the client either directly or via the KILAWATT_API_KEY environment variable.

const client = new Kilawatt({ apiKey: "kw_live_..." });

Use a kw_test_... key for sandbox/dry-run deploys with no billing impact.

## Usage

### Create an instance

const instance = await client.instances.create({
  gpuType: "h100",
  count: 8,
  policy: "zero_quota",
  region: "us-east",
});

### List instances

const instances = await client.instances.list({ status: "running" });

### Get instance status

const instance = await client.instances.get(instanceId);

### Stop an instance

await client.instances.stop(instanceId);

### Get a pricing quote

const quote = await client.quotes.create({
  gpuType: "b200",
  count: 16,
  term: "1yr",
});

## TypeScript

Types are included out of the box.

import { Kilawatt, Instance, GpuType } from "@kilawatt/sdk";

## Requirements

Node.js 18 or later. A Kilawatt Cloud API key from kilawattcloud.dev.

## Documentation

Full API reference at kilawattcloud.dev/docs

## Related

MCP Server: https://github.com/KilaWattCloud/kilawatt-mcp-server-
Examples: https://github.com/KilaWattCloud/kilawatt-examples-

## License

MIT — see LICENSE file
