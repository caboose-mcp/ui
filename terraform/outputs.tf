output "s3_bucket" {
  description = "S3 bucket name — set as GitHub Actions variable S3_BUCKET."
  value       = aws_s3_bucket.ui.bucket
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — set as GitHub Actions variable CLOUDFRONT_DISTRIBUTION_ID."
  value       = aws_cloudfront_distribution.ui.id
}

output "cloudfront_domain" {
  description = "CloudFront raw domain name — add a CNAME here if not using Route53."
  value       = aws_cloudfront_distribution.ui.domain_name
}

output "ui_url" {
  description = "Public UI URL."
  value       = "https://${var.ui_domain}"
}

output "acm_validation_records" {
  description = "DNS validation CNAMEs — add these if route53_zone_id is empty."
  value = {
    for dvo in aws_acm_certificate.ui.domain_validation_options :
    dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }
}
