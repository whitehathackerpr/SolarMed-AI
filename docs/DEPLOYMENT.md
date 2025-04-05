# SolarMed AI Deployment Guide

## Overview

This guide covers the deployment process for SolarMed AI, including both development and production environments. The application consists of a Vue.js frontend and a FastAPI backend, with offline-first capabilities.

## Prerequisites

### System Requirements
- Linux/Windows Server
- Node.js v16 or higher
- Python v3.8 or higher
- SQLite
- Nginx (recommended)
- Docker (optional)

### Hardware Requirements
- CPU: 2+ cores
- RAM: 4GB minimum
- Storage: 20GB minimum
- Network: Stable internet connection

## Environment Setup

### Development Environment

1. **Frontend Setup**
```bash
# Clone repository
git clone https://github.com/your-org/solarmed-ai.git
cd solarmed-ai/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with development settings

# Start development server
npm run dev
```

2. **Backend Setup**
```bash
cd ../backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with development settings

# Start development server
uvicorn main:app --reload
```

### Production Environment

1. **System Preparation**
```bash
# Update system
sudo apt update
sudo apt upgrade

# Install required packages
sudo apt install nginx python3-venv nodejs npm
```

2. **Frontend Deployment**
```bash
# Build frontend
cd frontend
npm install
npm run build

# Configure Nginx
sudo nano /etc/nginx/sites-available/solarmed-ai
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/solarmed-ai/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **Backend Deployment**
```bash
# Set up Python environment
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure systemd service
sudo nano /etc/systemd/system/solarmed-ai.service
```

Systemd service configuration:
```ini
[Unit]
Description=SolarMed AI Backend
After=network.target

[Service]
User=your-user
Group=your-group
WorkingDirectory=/path/to/solarmed-ai/backend
Environment="PATH=/path/to/solarmed-ai/backend/venv/bin"
ExecStart=/path/to/solarmed-ai/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

## Docker Deployment

### Docker Compose Setup

1. **Create docker-compose.yml**
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:8000

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend/data:/app/data
    environment:
      - DATABASE_URL=sqlite:///./data/solarmed.db
```

2. **Build and Start**
```bash
docker-compose build
docker-compose up -d
```

## Database Setup

### SQLite Configuration
1. Create database directory:
```bash
mkdir -p backend/data
```

2. Initialize database:
```bash
cd backend
python -c "from app.db.base import Base; from app.db.session import engine; Base.metadata.create_all(bind=engine)"
```

## Security Configuration

### SSL/TLS Setup
1. Obtain SSL certificate:
```bash
sudo apt install certbot
sudo certbot --nginx -d your-domain.com
```

2. Configure Nginx for SSL:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

### Firewall Configuration
```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

## Monitoring and Maintenance

### Logging
1. Frontend logs:
```bash
# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

2. Backend logs:
```bash
# Systemd logs
journalctl -u solarmed-ai -f
```

### Backup Strategy
1. Database backup:
```bash
# Create backup script
nano /usr/local/bin/backup-solarmed.sh
```

Backup script:
```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
cp /path/to/solarmed-ai/backend/data/solarmed.db $BACKUP_DIR/solarmed_$DATE.db

# Keep last 7 days of backups
find $BACKUP_DIR -name "solarmed_*.db" -mtime +7 -delete
```

2. Schedule backups:
```bash
# Add to crontab
0 2 * * * /usr/local/bin/backup-solarmed.sh
```

### Performance Monitoring
1. Install monitoring tools:
```bash
sudo apt install htop iotop
```

2. Set up monitoring:
```bash
# Monitor system resources
htop

# Monitor disk I/O
iotop
```

## Scaling Considerations

### Vertical Scaling
1. Increase server resources:
- Add more CPU cores
- Increase RAM
- Upgrade storage

### Horizontal Scaling
1. Load balancing setup:
```nginx
upstream backend_servers {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}

server {
    location /api {
        proxy_pass http://backend_servers;
    }
}
```

## Troubleshooting

### Common Issues

1. **Frontend Not Loading**
- Check Nginx configuration
- Verify SSL certificates
- Check file permissions

2. **Backend Not Responding**
- Check systemd service status
- Review error logs
- Verify database connection

3. **Database Issues**
- Check disk space
- Verify file permissions
- Check database integrity

### Debug Mode
1. Enable debug logging:
```bash
# Backend
uvicorn main:app --reload --log-level debug

# Frontend
npm run dev -- --debug
```

## Updates and Maintenance

### Application Updates
1. Pull latest changes:
```bash
git pull origin main
```

2. Update dependencies:
```bash
# Frontend
npm install
npm run build

# Backend
pip install -r requirements.txt
```

3. Restart services:
```bash
# Backend
sudo systemctl restart solarmed-ai

# Frontend
sudo systemctl restart nginx
```

### Security Updates
1. System updates:
```bash
sudo apt update
sudo apt upgrade
```

2. Dependency updates:
```bash
# Frontend
npm audit fix

# Backend
pip list --outdated
pip install -U package-name
```

## Disaster Recovery

### Backup Restoration
1. Stop services:
```bash
sudo systemctl stop solarmed-ai
sudo systemctl stop nginx
```

2. Restore database:
```bash
cp /path/to/backup/solarmed.db /path/to/solarmed-ai/backend/data/
```

3. Restart services:
```bash
sudo systemctl start solarmed-ai
sudo systemctl start nginx
```

### Emergency Procedures
1. Contact support
2. Access backup systems
3. Implement failover procedures
4. Document incident response 