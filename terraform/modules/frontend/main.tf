resource "aws_s3_bucket" "frontend" {
  bucket = var.bucket_name
  
  tags = {
    Name        = "Frontend Bucket"
    Environment = "Production"
    Terraform   = "true"
  }
  
  lifecycle {
    # This prevents errors when the bucket already exists
    ignore_changes = [bucket]
    # This prevents destruction of the bucket when Terraform runs
    prevent_destroy = true
  }
}

# Enable website hosting
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
  
  lifecycle {
    # Prevent errors with existing website configuration
    ignore_changes = [
      index_document,
      error_document
    ]
  }
}

# Disable Block Public Access for this bucket
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Bucket policy for public read access
resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
  
  # Wait for the public access block settings to be applied first
  depends_on = [aws_s3_bucket_public_access_block.frontend]
} 