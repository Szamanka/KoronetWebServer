variable "aws_region" {
  description = "The AWS region to deploy resources in."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "A unique name for the project, used as a prefix for resources."
  type        = string
  default     = "koronet"
}

variable "app_port" {
  description = "The port the application listens on."
  type        = number
  default     = 3000
}

# variable "docker_hub_username" {
#   description = "Your Docker Hub username for image pulling."
#   type        = string
# }
variable "aws_account_id" {
  description = "AWS Account ID for ECR"
  type        = string
}

variable "ecr_repository_name" {
  description = "Name of the ECR repository"
  type        = string
  default     = "koronet-web-server"
}

variable "image_name" {
  description = "The name of the Docker image in Docker Hub."
  type        = string
  default     = "koronet-web-server"
}

variable "image_tag" {
  description = "The tag of the Docker image to deploy."
  type        = string
  default     = "latest"
}

# ECS Configuration
variable "desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 2
}

variable "min_capacity" {
  description = "Minimum number of ECS tasks for autoscaling"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of ECS tasks for autoscaling"
  type        = number
  default     = 4
}

# Database and Redis configuration
variable "db_host" {
  description = "PostgreSQL database host"
  type        = string
  default     = ""
}

variable "db_user" {
  description = "PostgreSQL database username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "PostgreSQL database password"
  type        = string
  sensitive   = true
  # No default for security reasons - must be provided
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "koronet_db"
}

variable "redis_host" {
  description = "Redis host"
  type        = string
  default     = ""
}

variable "redis_password" {
  description = "Redis password"
  type        = string
  sensitive   = true
  # No default for security reasons - must be provided
}