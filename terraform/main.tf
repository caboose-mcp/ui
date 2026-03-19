# terraform/main.tf — S3 static site + CloudFront for ui.mcp.chrismarasco.io
#
# State: shared caboose-mcp-tfstate bucket under a separate key.
# Reads caboose-mcp outputs (IAM user name, Route53 zone) via terraform_remote_state.
#
# Prerequisites:
#   - caboose-mcp terraform has been applied at least once (state readable)
#   - caboose-mcp-tfstate S3 bucket exists
#   - aws configure (or AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)
#   - tofu init && tofu apply

terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "caboose-mcp-tfstate"
    key    = "caboose-mcp-ui/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# ─── Remote state: read caboose-mcp outputs ───────────────────────────────────
# Used to get the shared IAM user name (to attach deploy policy) and zone ID.

data "terraform_remote_state" "mcp" {
  backend = "s3"
  config = {
    bucket = "caboose-mcp-tfstate"
    key    = "caboose-mcp/terraform.tfstate"
    region = "us-east-1"
  }
}

locals {
  # Prefer the route53_zone_id variable; fall back to what caboose-mcp was given.
  zone_id = var.route53_zone_id != "" ? var.route53_zone_id : data.terraform_remote_state.mcp.outputs.route53_zone_id

  common_tags = {
    Project     = "caboose-mcp-ui"
    ManagedBy   = "terraform"
    Environment = var.environment
  }
}

# ─── S3: static site bucket ───────────────────────────────────────────────────

resource "aws_s3_bucket" "ui" {
  bucket = replace(var.ui_domain, ".", "-")
  tags   = local.common_tags
}

resource "aws_s3_bucket_versioning" "ui" {
  bucket = aws_s3_bucket.ui.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_public_access_block" "ui" {
  bucket                  = aws_s3_bucket.ui.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ─── CloudFront OAC ───────────────────────────────────────────────────────────

resource "aws_cloudfront_origin_access_control" "ui" {
  name                              = "caboose-mcp-ui"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Allow CloudFront to read from the S3 bucket
resource "aws_s3_bucket_policy" "ui" {
  bucket = aws_s3_bucket.ui.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowCloudFrontOAC"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.ui.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.ui.arn
        }
      }
    }]
  })
}

# ─── ACM certificate (must be us-east-1 for CloudFront) ──────────────────────

resource "aws_acm_certificate" "ui" {
  domain_name       = var.ui_domain
  validation_method = "DNS"
  lifecycle { create_before_destroy = true }
  tags = local.common_tags
}

resource "aws_route53_record" "cert_validation" {
  for_each = local.zone_id != "" ? {
    for dvo in aws_acm_certificate.ui.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  } : {}

  zone_id = local.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "ui" {
  count                   = local.zone_id != "" ? 1 : 0
  certificate_arn         = aws_acm_certificate.ui.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# ─── CloudFront distribution ──────────────────────────────────────────────────

resource "aws_cloudfront_distribution" "ui" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.ui_domain]
  price_class         = "PriceClass_100"
  tags                = local.common_tags

  origin {
    domain_name              = aws_s3_bucket.ui.bucket_regional_domain_name
    origin_id                = "s3-ui"
    origin_access_control_id = aws_cloudfront_origin_access_control.ui.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-ui"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
    compress    = true
  }

  # SPA routing: 403/404 from S3 → serve index.html with 200 so React Router handles it
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.ui.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  depends_on = [aws_acm_certificate_validation.ui]
}

# ─── Route53 A record ─────────────────────────────────────────────────────────

resource "aws_route53_record" "ui" {
  count   = local.zone_id != "" ? 1 : 0
  zone_id = local.zone_id
  name    = var.ui_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.ui.domain_name
    zone_id                = aws_cloudfront_distribution.ui.hosted_zone_id
    evaluate_target_health = false
  }
}

# ─── IAM: grant the shared caboose_cli user deploy access ─────────────────────
# Attaches a policy to the IAM user created in the caboose-mcp terraform so the
# same AWS_ACCESS_KEY_ID/SECRET used in CI can deploy both the backend and the UI.

resource "aws_iam_user_policy" "ui_deploy" {
  name = "caboose-mcp-ui-deploy"
  user = data.terraform_remote_state.mcp.outputs.iam_user_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3UIDeploy"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket",
        ]
        Resource = [
          aws_s3_bucket.ui.arn,
          "${aws_s3_bucket.ui.arn}/*",
        ]
      },
      {
        Sid      = "CloudFrontInvalidate"
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation"]
        Resource = aws_cloudfront_distribution.ui.arn
      },
    ]
  })
}
