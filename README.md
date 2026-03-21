# fafb UI

React/Vite/Tailwind frontend for [fafb](https://github.com/caboose-mcp/caboose-mcp), deployed to [ui.mcp.chrismarasco.io](https://ui.mcp.chrismarasco.io) via S3 + CloudFront.

**Features:** Browse 130 MCP tools, search by name/category/tag, view tool details and parameters, test sandboxable tools, manage JWT tokens.

`mcp.chrismarasco.io/ui` redirects here.

## Local dev

```bash
cp .env.example .env.local   # set VITE_API_BASE or leave empty for dev proxy
pnpm install
pnpm dev                     # http://localhost:5173
```

The Vite dev server proxies `/api` and `/auth` to `http://localhost:8080` (the Go backend).

## Deploy flow

```
fafb push to main
  └─ notify-ui.yml fires repository_dispatch
       └─ update-pr.yml regenerates changelog.json → opens PR
            └─ CI runs on PR
                 └─ merge PR → deploy.yml → S3 sync + CloudFront invalidation
```

## Infrastructure (one-time setup)

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # fill in values
tofu init
tofu apply
# Copy the printed S3_BUCKET and CLOUDFRONT_DISTRIBUTION_ID into
# GitHub Actions → Settings → Variables for this repo.
```

## GitHub secrets and variables

| Name | Type | Value |
|------|------|-------|
| `AWS_ACCESS_KEY_ID` | Secret | Shared with fafb |
| `AWS_SECRET_ACCESS_KEY` | Secret | Shared with fafb |
| `TF_VAR_ROUTE53_ZONE_ID` | Secret | Route53 zone ID (empty if not using AWS DNS) |
| `FAFB_READ_TOKEN` | Secret | Fine-grained PAT: Contents read on caboose-mcp/caboose-mcp (omit if public) |
| `S3_BUCKET` | Variable | From `tofu output s3_bucket` |
| `CLOUDFRONT_DISTRIBUTION_ID` | Variable | From `tofu output cloudfront_distribution_id` |
| `VITE_API_BASE` | Variable | `https://mcp.chrismarasco.io` |
