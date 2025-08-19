# Get your AWS account ID
```js
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
```

# Login to ECR
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

# Build and push to ECR
```bash
cd app

docker build -t koronet-web-server:latest .

docker tag koronet-web-server:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/koronet-web-server:latest

docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/koronet-web-server:latest
```

# Deploy with Terraform
```bash

cd ../terraform

terraform init

terraform apply -var="aws_account_id=$AWS_ACCOUNT_ID"

```

