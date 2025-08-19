# outputs.tf

output "alb_hostname" {
  value       = aws_lb.main.dns_name
  description = "The DNS name of the load balancer"
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.main.name
  description = "The name of the ECS cluster"
}

output "ecs_service_name" {
  value       = aws_ecs_service.app.name
  description = "The name of the ECS service"
}

output "vpc_id" {
  value       = aws_vpc.main.id
  description = "The ID of the VPC"
}

output "public_subnet_ids" {
  value       = aws_subnet.public[*].id
  description = "List of public subnet IDs"
}

output "private_subnet_ids" {
  value       = aws_subnet.private[*].id
  description = "List of private subnet IDs"
}

output "alb_security_group_id" {
  value       = aws_security_group.alb.id
  description = "The ID of the ALB security group"
}

output "ecs_security_group_id" {
  value       = aws_security_group.ecs_tasks.id
  description = "The ID of the ECS tasks security group"
}

output "cloudwatch_log_group_name" {
  value       = aws_cloudwatch_log_group.app_logs.name
  description = "The name of the CloudWatch log group"
}