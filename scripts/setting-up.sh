cd ../infrastructure

docker-compose up -d

terraform init

terraform plan

terraform apply

aws  --endpoint-url=http://localhost:4566 sqs list-queues
