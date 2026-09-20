# 🚀 Production Deployment Guide

## 📋 Overview

This guide walks you through deploying the GHCR Devcontainer Forge v2.9.0 with authentication, environment management, and container orchestration.

---

## 🔐 Authentication System

### Features
- ✅ User registration with email validation
- ✅ Secure login with JWT tokens
- ✅ Password strength validation
- ✅ Remember me functionality
- ✅ Protected routes
- ✅ Token refresh mechanism
- ✅ Session management

### Environment Variables
```bash
# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
```

---

## 🐳 Container Deployment

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 20+ (for local development)
- PostgreSQL 16+ (included in docker-compose)
- Redis 7+ (included in docker-compose)

### Step 1: Clone Repository
```bash
git clone https://github.com/nyeinpyaesone-ui/devcontainer.git
cd devcontainer
```

### Step 2: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required Environment Variables:**
```bash
# API Configuration
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_API_VERSION=v1

# GitHub Container Registry
VITE_GHCR_REGISTRY=ghcr.io
VITE_GHCR_NAMESPACE=your-namespace
VITE_GHCR_TOKEN=your_github_token

# JWT Secrets (generate secure random strings)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/devcontainer_db
REDIS_URL=redis://redis:6379
```

### Step 3: Build and Start Containers
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### Step 4: Verify Deployment
```bash
# Check frontend
curl http://localhost

# Check backend API
curl http://localhost:3000/health

# Check database
docker-compose exec postgres psql -U postgres -c "SELECT version();"

# Check Redis
docker-compose exec redis redis-cli ping
```

---

## 📦 GitHub Container Registry (GHCR)

### Build and Push Image
```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u your-username --password-stdin

# Build image
docker build -t ghcr.io/nyeinpyaesone-ui/devcontainer:2.9.0 .

# Tag as latest
docker tag ghcr.io/nyeinpyaesone-ui/devcontainer:2.9.0 ghcr.io/nyeinpyaesone-ui/devcontainer:latest

# Push to GHCR
docker push ghcr.io/nyeinpyaesone-ui/devcontainer:2.9.0
docker push ghcr.io/nyeinpyaesone-ui/devcontainer:latest
```

### Pull and Run from GHCR
```bash
# Pull image
docker pull ghcr.io/nyeinpyaesone-ui/devcontainer:latest

# Run container
docker run -d \
  --name devcontainer-forge \
  -p 80:80 \
  -e VITE_API_BASE_URL=https://api.yourdomain.com/api \
  -e VITE_GHCR_TOKEN=your_token \
  ghcr.io/nyeinpyaesone-ui/devcontainer:latest
```

---

## 🗄️ Database Setup

### Initialize Database
```bash
# Run migrations
docker-compose exec backend npm run db:migrate

# Seed initial data (optional)
docker-compose exec backend npm run db:seed
```

### Database Schema
The application uses PostgreSQL with the following tables:
- `users` - User accounts and authentication
- `configurations` - Devcontainer configurations
- `templates` - Configuration templates
- `analytics` - Analytics data
- `collaboration_sessions` - Collaboration sessions
- `commits` - Version control commits
- `compliance_reports` - Compliance reports

---

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit `.env` file to git
- Use strong, random secrets for JWT
- Rotate tokens regularly
- Use environment-specific variables

### 2. Network Security
- Use HTTPS in production
- Configure firewall rules
- Limit exposed ports
- Use internal Docker network

### 3. Database Security
- Use strong passwords
- Limit database access
- Regular backups
- Enable SSL/TLS

### 4. Container Security
- Run as non-root user
- Use specific image tags
- Scan images for vulnerabilities
- Limit container resources

---

## 📊 Monitoring and Logging

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Health Checks
```bash
# Check all services
docker-compose ps

# Check individual service health
docker inspect --format='{{.State.Health.Status}}' devcontainer-forge-frontend
docker inspect --format='{{.State.Health.Status}}' devcontainer-forge-backend
```

### Metrics
- Frontend: http://localhost/metrics
- Backend: http://localhost:3000/metrics
- Database: `docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_database;"`

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to GHCR
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ghcr.io/nyeinpyaesone-ui/devcontainer:latest
            ghcr.io/nyeinpyaesone-ui/devcontainer:${{ github.sha }}
      
      - name: Deploy to server
        run: |
          ssh user@server 'cd /app && docker-compose pull && docker-compose up -d'
```

---

## 🛠️ Maintenance

### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres devcontainer_db > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20260115.sql | docker-compose exec -T postgres psql -U postgres devcontainer_db
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Run migrations
docker-compose exec backend npm run db:migrate
```

### Cleanup
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove stopped containers
docker container prune
```

---

## 🎯 Production Checklist

Before going live:

- [ ] Environment variables configured
- [ ] JWT secrets generated and secure
- [ ] Database initialized and migrated
- [ ] SSL/TLS certificates installed
- [ ] Firewall rules configured
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Health checks passing
- [ ] Load testing completed
- [ ] Security audit passed

---

## 📞 Support

### Troubleshooting

**Issue: Cannot connect to database**
```bash
# Check if postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

**Issue: Authentication failing**
```bash
# Check backend logs
docker-compose logs backend

# Verify JWT secrets in .env
cat .env | grep JWT

# Restart backend
docker-compose restart backend
```

**Issue: Frontend not loading**
```bash
# Check frontend logs
docker-compose logs frontend

# Verify nginx config
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Restart frontend
docker-compose restart frontend
```

### Contact
- **Issues:** https://github.com/nyeinpyaesone-ui/devcontainer/issues
- **Discussions:** https://github.com/nyeinpyaesone-ui/devcontainer/discussions
- **Email:** support@devcontainer-forge.com

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [React Router Documentation](https://reactrouter.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Deployment Status:** ✅ Ready for Production  
**Version:** 2.9.0  
**Last Updated:** 2026-01-15
