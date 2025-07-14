# PesoWise Deployment Guide

This guide covers different deployment strategies for the PesoWise financial management application.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database (for production)
- Domain name (for production deployment)
- SSL certificate (recommended for production)

## Quick Start with Docker Compose

### 1. Clone and Setup

```bash
git clone <repository-url>
cd pesowise-full-code
cp web-app/.env.example web-app/.env
```

### 2. Configure Environment Variables

Edit `web-app/.env`:
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_NAME=PesoWise
REACT_APP_VERSION=1.0.0
```

### 3. Start the Application

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Database: localhost:5432

## Production Deployment

### 1. Environment Configuration

Create production environment files:

**Backend Environment Variables:**
```bash
# Database
DATABASE_URL=jdbc:postgresql://your-db-host:5432/pesowise_prod
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_db_password

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-256-bits
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Email Service
MAIL_HOST=smtp.your-provider.com
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-email-password

# File Storage
FILE_UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=10MB

# OCR Service (Optional)
OCR_ENABLED=true
OCR_API_KEY=your-ocr-api-key
OCR_API_URL=https://api.ocr-service.com
```

**Frontend Environment Variables:**
```bash
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_NAME=PesoWise
REACT_APP_VERSION=1.0.0
```

### 2. Database Setup

```sql
-- Create production database
CREATE DATABASE pesowise_prod;
CREATE USER pesowise WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pesowise_prod TO pesowise;
```

### 3. Docker Production Deployment

```bash
# Build and deploy with production settings
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. Nginx Reverse Proxy (Recommended)

Create `/etc/nginx/sites-available/pesowise`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Cloud Deployment Options

### AWS Deployment

#### Using ECS Fargate

1. **Push Images to ECR**
```bash
# Build and tag images
docker build -t pesowise-backend ./server
docker build -t pesowise-frontend ./web-app

# Tag for ECR
docker tag pesowise-backend:latest your-account.dkr.ecr.region.amazonaws.com/pesowise-backend:latest
docker tag pesowise-frontend:latest your-account.dkr.ecr.region.amazonaws.com/pesowise-frontend:latest

# Push to ECR
docker push your-account.dkr.ecr.region.amazonaws.com/pesowise-backend:latest
docker push your-account.dkr.ecr.region.amazonaws.com/pesowise-frontend:latest
```

2. **Create RDS PostgreSQL Instance**
3. **Set up ECS Cluster and Services**
4. **Configure Application Load Balancer**

#### Using Elastic Beanstalk

1. **Create EB Application**
```bash
eb init pesowise
eb create pesowise-prod
```

2. **Deploy Backend**
```bash
cd server
eb deploy
```

3. **Deploy Frontend to S3 + CloudFront**

### Google Cloud Platform

#### Using Cloud Run

```bash
# Deploy backend
gcloud run deploy pesowise-backend \
  --image gcr.io/your-project/pesowise-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy frontend
gcloud run deploy pesowise-frontend \
  --image gcr.io/your-project/pesowise-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Deployment

#### Using Container Instances

```bash
# Create resource group
az group create --name pesowise-rg --location eastus

# Deploy backend
az container create \
  --resource-group pesowise-rg \
  --name pesowise-backend \
  --image pesowise-backend:latest \
  --ports 8080

# Deploy frontend
az container create \
  --resource-group pesowise-rg \
  --name pesowise-frontend \
  --image pesowise-frontend:latest \
  --ports 80
```

## Monitoring and Maintenance

### Health Checks

The application includes built-in health check endpoints:

- **Backend**: `http://localhost:8080/actuator/health`
- **Frontend**: `http://localhost:3000/health`

### Logging

Configure log aggregation:

```yaml
# Add to docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Backup Strategy

#### Database Backup

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U pesowise pesowise_prod > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

#### File Storage Backup

```bash
# Backup uploaded files
rsync -av /app/uploads/ s3://your-file-backup-bucket/
```

### Security Considerations

1. **Use strong JWT secrets** (minimum 256 bits)
2. **Enable HTTPS** in production
3. **Regular security updates** for dependencies
4. **Database encryption** at rest
5. **API rate limiting** (implement in nginx or application layer)
6. **Input validation** and sanitization
7. **Regular security audits**

### Performance Optimization

1. **Enable gzip compression** (configured in nginx.conf)
2. **Use CDN** for static assets
3. **Database indexing** for frequently queried fields
4. **Connection pooling** for database
5. **Caching strategies** (Redis for session storage)

### Scaling Considerations

1. **Horizontal scaling** with load balancer
2. **Database read replicas** for better performance
3. **File storage** on cloud services (AWS S3, Google Cloud Storage)
4. **Container orchestration** (Kubernetes for large scale)

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials
   - Verify network connectivity
   - Ensure database is running

2. **CORS Errors**
   - Verify CORS_ALLOWED_ORIGINS configuration
   - Check API URL in frontend environment

3. **File Upload Issues**
   - Check file permissions on upload directory
   - Verify MAX_FILE_SIZE setting

4. **JWT Token Issues**
   - Ensure JWT_SECRET is consistent
   - Check token expiration settings

### Debug Commands

```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Execute commands in container
docker-compose exec backend bash
docker-compose exec postgres psql -U pesowise -d pesowise_prod

# Check database connectivity
docker-compose exec backend nc -zv postgres 5432
```

## Support

For deployment support and troubleshooting:

1. Check the logs for error messages
2. Review environment variable configuration
3. Verify network connectivity between services
4. Ensure all required ports are open
5. Check database migrations have run successfully

Remember to always test deployments in a staging environment before deploying to production.
