provider "aws" {
  region = "us-east-1"
  access_key = "foo"
  secret_key = "foo"
  skip_credentials_validation = true
  skip_requesting_account_id = true
  skip_metadata_api_check = true
  endpoints {
    sqs = "http://localhost:4566"
  }
}

resource "aws_sqs_queue" "test-queue" {
  name      =   "test-queue"
  policy    =   <<POLICY
  {
      "Version":"2012-10-17",
      "Statement":[
          {
              "Effect" : "Allow",
              "Principal":"*",
              "Action":"sqs:SendMessage",
              "Resource":"arn:aws:sqs:*:*:s3-event-notification-queue"
          }
      ]
  }
  POLICY
}