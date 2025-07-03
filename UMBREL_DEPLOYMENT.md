# Bitmap BRC-420 Indexer - Umbrel Deployment Guide

This guide explains how to deploy the Bitmap BRC-420 Indexer as an Umbrel Community App.

## 🏗️ Architecture

The Bitmap BRC-420 Indexer is designed as a single-service Docker container that provides:

- **Web Interface**: React-based frontend accessible at port 8080
- **REST API**: Express.js backend serving API endpoints
- **Block Processor**: Background service for indexing Bitcoin blocks
- **Database**: SQLite database for storing indexed data

## 📋 Prerequisites

Before installing, ensure these Umbrel apps are installed and running:

### Required Dependencies
- **Bitcoin Core**: Provides blockchain data
- **Ordinals**: Provides inscription data and validation services

### Recommended Dependencies  
- **Mempool**: Provides enhanced transaction and fee information

## 🚀 Installation Methods

### Method 1: Community App Store (Recommended)

1. **Add the Community App Store**:
   ```
   Repository URL: https://github.com/switch-900/bitmap-brc420-community-app-store
   ```

2. **Install Dependencies**:
   - Install Bitcoin Core from the official Umbrel App Store
   - Install Ordinals from the official Umbrel App Store
   - Install Mempool (optional but recommended)

3. **Install Bitmap BRC-420 Indexer**:
   - Find "Bitmap BRC-420 Indexer" in your community app store
   - Click Install and wait for the deployment to complete

### Method 2: Manual Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/switch-900/Bitmap-BRC420-Indexer.git
   cd Bitmap-BRC420-Indexer
   ```

2. **Run Setup Script**:
   ```bash
   chmod +x setup-umbrel.sh
   ./setup-umbrel.sh
   ```

3. **Follow the setup script instructions**

## ⚙️ Configuration

### Environment Variables

The app automatically configures itself for Umbrel, but you can customize these settings:

| Variable | Default | Description |
|----------|---------|-------------|
| `START_BLOCK` | `792435` | Starting block for indexing |
| `CONCURRENCY_LIMIT` | `10` | Concurrent API requests |
| `RUN_INDEXER` | `true` | Enable/disable block processing |
| `DB_PATH` | `/app/data/brc420.db` | Database file path |

### Umbrel Service Discovery

The app automatically detects and connects to local Umbrel services:

- **Ordinals API**: `http://ordinals_web_1:4000`
- **Mempool API**: `http://mempool_web_1:3006/api`

## 🔧 Service Architecture

### Docker Compose Structure

```yaml
services:
  app_proxy:
    # Umbrel's reverse proxy configuration
    
  web:
    image: ghcr.io/switch-900/Bitmap-BRC420-Indexer:latest
    # Main application container
    # Serves both web interface and API
    # Runs background indexing process
```

### Data Persistence

- **Database**: `/app/data/` (persistent volume)
- **Logs**: `/app/logs/` (persistent volume)

### Networking

- **Web Interface**: Port 8080 (proxied by Umbrel)
- **Internal API**: Port 5000 (container-internal)
- **Service Discovery**: Automatic via Docker networking

## 📊 Monitoring

### Health Checks

The app includes built-in health monitoring:

- **Health Endpoint**: `GET /health`
- **Docker Health Check**: Automated container health monitoring
- **Application Logs**: Available in Umbrel app logs

### Performance Metrics

Monitor these metrics for optimal performance:

- **Database Size**: Check `/app/data/` disk usage
- **Memory Usage**: Typical usage: 200-500MB
- **CPU Usage**: Varies with indexing activity
- **Network**: Depends on API call frequency

## 🔍 Troubleshooting

### Common Issues

1. **App Won't Start**
   ```bash
   # Check if dependencies are running
   docker ps | grep -E "(bitcoin|ordinals)"
   
   # Check app logs
   docker logs Bitmap-BRC420-Indexer_web_1
   ```

2. **Slow Indexing**
   ```bash
   # Check API connectivity
   curl http://ordinals_web_1:4000/api/status
   
   # Reduce concurrency if needed
   # Edit CONCURRENCY_LIMIT in docker-compose.yml
   ```

3. **Database Issues**
   ```bash
   # Check disk space
   df -h /app/data
   
   # Reset database (removes all data)
   rm /app/data/brc420.db
   ```

### Log Analysis

Application logs are structured and include:

- **Indexing Progress**: Block processing status
- **API Calls**: External service connectivity
- **Database Operations**: Data insertion/validation
- **Error Handling**: Detailed error information

### Debugging Mode

Enable debug logging by setting environment variables:

```yaml
environment:
  - LOG_LEVEL=debug
  - NODE_ENV=development
```

## 🔄 Updates

### Automatic Updates

The app follows Umbrel's update mechanism:

1. **New Release**: Developer publishes new Docker image
2. **Update Available**: Umbrel notifies user of available update
3. **User Action**: User initiates update through Umbrel interface
4. **Automatic Process**: Umbrel pulls new image and restarts container

### Manual Updates

```bash
# Pull latest image
docker pull ghcr.io/switch-900/Bitmap-BRC420-Indexer:latest

# Restart the app through Umbrel interface
# or manually:
docker-compose restart web
```

## 🗃️ Data Management

### Backup

Important data to backup:

```bash
# Database backup
cp /app/data/brc420.db /backup/location/

# Configuration backup  
cp /umbrel/apps/Bitmap-BRC420-Indexer/docker-compose.yml /backup/location/
```

### Migration

To migrate data between Umbrel instances:

1. **Export Data**: Backup database file
2. **Install App**: Install on new Umbrel instance  
3. **Stop App**: Stop the app service
4. **Import Data**: Copy database file to new instance
5. **Start App**: Restart the app service

## 🔐 Security

### Network Security

- **Internal Network**: App communicates only within Umbrel's Docker network
- **No External Access**: Direct access to Bitcoin/Ordinals services not exposed
- **Proxy Protection**: All external access goes through Umbrel's proxy

### Data Security

- **Local Storage**: All data remains on your Umbrel device
- **No External Services**: No data sent to external services
- **User Control**: Full control over indexed data

## 📈 Performance Optimization

### Resource Allocation

Recommended resource limits:

```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.1'
```

### Database Optimization

The app includes optimized database schemas:

- **Indexes**: Strategic indexing for fast queries
- **Pagination**: Efficient data loading
- **Cleanup**: Automatic cleanup of temporary data

## 🛠️ Development

### Local Development

For developers wanting to modify the app:

```bash
# Clone repository
git clone https://github.com/switch-900/Bitmap-BRC420-Indexer.git

# Install dependencies
npm install

# Start development servers
npm run dev
```

### Building Custom Images

```bash
# Build custom Docker image
docker build -t my-Bitmap-BRC420-Indexer .

# Update docker-compose.yml to use custom image
```

## 🤝 Support

### Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/switch-900/Bitmap-BRC420-Indexer/issues)
- **Documentation**: Check the README files for detailed information
- **Community**: Join Bitcoin inscription community discussions

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built for Umbrel**: This app is specifically optimized for the Umbrel ecosystem, providing seamless integration with your Bitcoin node and related services.
