# =============================================================================
# ALB Module - Application Load Balancer
# Creates ALB, Target Group, and Listeners
# =============================================================================

# -----------------------------------------------------------------------------
# Application Load Balancer
# -----------------------------------------------------------------------------

resource "aws_lb" "main" {
  name               = "${var.project_name}-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.environment == "prod" ? true : false
  enable_http2               = true

  access_logs {
    bucket  = var.access_logs_bucket
    prefix  = "${var.project_name}-alb"
    enabled = var.enable_access_logs
  }

  tags = {
    Name = "${var.project_name}-alb-${var.environment}"
  }
}

# -----------------------------------------------------------------------------
# Target Group
# -----------------------------------------------------------------------------

resource "aws_lb_target_group" "main" {
  name        = "${var.project_name}-tg-${var.environment}"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip" # Required for Fargate

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = var.health_check_path
    protocol            = "HTTP"
    matcher             = "200-299"
  }

  # Slow start gives new tasks time to warm up
  slow_start = 30

  # Deregistration delay for graceful shutdown
  deregistration_delay = 30

  tags = {
    Name = "${var.project_name}-tg-${var.environment}"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# -----------------------------------------------------------------------------
# HTTP Listener
# -----------------------------------------------------------------------------

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = var.enable_https ? "redirect" : "forward"

    # Redirect to HTTPS if enabled
    dynamic "redirect" {
      for_each = var.enable_https ? [1] : []
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }

    # Forward to target group if HTTPS not enabled
    target_group_arn = var.enable_https ? null : aws_lb_target_group.main.arn
  }
}

# -----------------------------------------------------------------------------
# HTTPS Listener (optional)
# -----------------------------------------------------------------------------

resource "aws_lb_listener" "https" {
  count = var.enable_https ? 1 : 0

  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}
