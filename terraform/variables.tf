variable "aws_region" {
  description = "AWS region. ACM for CloudFront must be us-east-1."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment tag."
  type        = string
  default     = "personal"
}

variable "ui_domain" {
  description = "Custom domain for the UI (e.g. ui.mcp.chrismarasco.io)."
  type        = string
  default     = "ui.mcp.chrismarasco.io"
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID. Leave empty if DNS is managed elsewhere — you'll get validation CNAMEs to add manually."
  type        = string
  default     = ""
}
