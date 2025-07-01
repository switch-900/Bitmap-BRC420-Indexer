# Bitmap BRC-420 Indexer

A comprehensive Bitcoin inscription indexer that runs on your Umbrel node, specifically designed to index and track BRC-420 inscriptions, Bitcoin bitmap inscriptions, and bitmap parcels.

## 🚀 Features

- **Real-time Indexing**: Continuously monitors the Bitcoin blockchain for new BRC-420, bitmap, and parcel inscriptions
- **Parcel Support**: Full support for bitmap parcels with provenance validation and tie-breaker rules
- **Robust Validation**: Implements strict validation rules for BRC-420 deploys and mints including royalty payment verification
- **Web Interface**: Beautiful React-based web interface with tabbed navigation for parcels
- **REST API**: Complete API for programmatic access to indexed data
- **Error Recovery**: Automatic retry mechanism for failed blocks
- **Resource Efficient**: Optimized for running on Umbrel nodes
- **Local-only Operation**: Connects to your Umbrel's Bitcoin Core and Ordinals services

## 🏗 Architecture

This is a full-stack TypeScript application with:

### Backend (`server/`)
- **Node.js + Express.js** API server
- **SQLite** database with optimized schemas
- **Block Processor** for continuous blockchain monitoring
- **Parcel Validator** with provenance checking
- **Joi** schemas for data validation

### Frontend (`client/`)
- **React** with TypeScript
- **React Router** for navigation
- **Axios** for API communication
- **Responsive design** for desktop and mobile

### Monorepo Structure
- **npm workspaces** for unified dependency management
- **TypeScript** configuration for both client and server
- **Docker** multi-stage builds for production deployment

## 🔌 API Endpoints

### Core Endpoints
- `GET /api/deploys` - List deploy inscriptions
- `GET /api/deploys/with-mints` - Deploys with mint counts
- `GET /api/deploy/:id/summary` - Deploy details with statistics
- `GET /api/deploy/:id/mints` - Mints for specific deploy
- `GET /api/bitmaps` - List bitmap inscriptions
- `GET /api/bitmap/:number` - Specific bitmap details

### Parcel Endpoints
- `GET /api/parcels` - List all parcels with search
- `GET /api/parcel/:inscription_id` - Specific parcel details
- `GET /api/bitmap/:bitmap_number/parcels` - Parcels for specific bitmap

### Utility Endpoints
- `GET /api/wallet/:inscription_id/history` - Wallet transfer history
- `GET /health` - Health check endpoint

## 🚀 Installation

### Option 1: Umbrel Community App Store (Recommended)

1. **Add the Community App Store to your Umbrel**:
   ```
   https://github.com/switch-900/bitmap-brc420-community-app-store
   ```

2. **Install Dependencies**:
   - Bitcoin Core (required)
   - Ordinals (required)  
   - Mempool (optional but recommended)

3. **Install the App**:
   - Find "Bitmap BRC-420 Indexer" in your community apps
   - Click Install and wait for deployment

4. **Access the Interface**:
   - Web UI: `http://umbrel.local:8080`
   - API: `http://umbrel.local:8080/api`

### Option 2: Development Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/switch-900/Bitmap-BRC420-Indexer.git
   cd Bitmap-BRC420-Indexer
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Build the Application**:
   ```bash
   npm run build
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

### Option 3: Docker Deployment

1. **Build the Docker Image**:
   ```bash
   docker build -t bitmap-brc420-indexer .
   ```

2. **Run the Container**:
   ```bash
   docker run -p 8080:8080 -v ./data:/app/data bitmap-brc420-indexer
   ```

## ⚙️ Configuration

### Environment Variables

- `ORD_API_URL`: Ordinals API endpoint (default: `http://localhost:4000`)
- `API_WALLET_URL`: Mempool API endpoint (default: `http://localhost:3006/api`)
- `START_BLOCK`: Starting block height for indexing (default: `792435`)
- `CONCURRENCY_LIMIT`: Number of concurrent API requests (default: `10`)
- `DB_PATH`: Database file path (default: `./data/brc420.db`)
- `PORT`: API server port (default: `5000`)
- `WEB_PORT`: Web interface port (default: `8080`)

### Umbrel Integration

When running on Umbrel, the app automatically configures itself to use:
- `ordinals_web_1:4000` for Ordinals API
- `mempool_web_1:3006/api` for Mempool API

## 🏗 Development

### Prerequisites
- Node.js 18+
- npm 9+
- TypeScript 4.4+

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── db/           # Database layer
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Utilities
│   │   └── workers/      # Background workers
│   └── package.json
├── Dockerfile             # Multi-stage Docker build
└── package.json          # Root package with workspaces
```

### Available Scripts

- `npm run build` - Build both client and server
- `npm run dev` - Start development servers with hot reload
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run linting

### Docker Development

```bash
# Build development image
docker build -t bitmap-brc420-indexer:dev .

# Run with volume mounts for development
docker run -p 8080:8080 -v ./data:/app/data -v ./logs:/app/logs bitmap-brc420-indexer:dev
```

## 📊 Data Storage

All data is stored in SQLite with the following schema:

- **deploys**: BRC-420 deployment inscriptions
- **mints**: BRC-420 mint inscriptions  
- **bitmaps**: Bitmap inscriptions
- **parcels**: Bitmap parcel inscriptions with validation status
- **transfers**: Wallet ownership changes
- **processed_blocks**: Block processing status
- **block_stats**: Block processing statistics

## 🔒 Privacy & Security

- **Local Operation**: All indexing happens on your node
- **No External APIs**: Uses only your Bitcoin Core and Ordinals services  
- **Data Sovereignty**: Your inscription data never leaves your device
- **Open Source**: All code is publicly auditable

## 📈 Performance

Optimized for resource-constrained environments:
- **Efficient Queries**: Optimized SQLite indexes
- **Concurrent Processing**: Configurable concurrency limits
- **Error Recovery**: Automatic retry mechanisms
- **Memory Management**: Streaming data processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is open source. See the [LICENSE](LICENSE) file for details.

## 🛠 Support

- **Issues**: [GitHub Issues](https://github.com/switch-900/Bitmap-BRC420-Indexer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/switch-900/Bitmap-BRC420-Indexer/discussions)
- **Community**: [Bitcoin Inscription Community](https://bitcointalk.org)

## 🔗 Related Projects

- **Community App Store**: [bitmap-brc420-community-app-store](https://github.com/switch-900/bitmap-brc420-community-app-store)
- **Umbrel**: [getumbrel.com](https://getumbrel.com)
- **Ordinals**: [ordinals.com](https://ordinals.com)

---

**⚡ Bitcoin Native** - Built specifically for Bitcoin inscriptions with deep protocol understanding.

**🔒 Privacy First** - All processing happens locally on your node. Your data never leaves your device.
