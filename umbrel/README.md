# Bitmap BRC-420 Indexer for Umbrel

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

## 🏗 How it Works

The indexer consists of a single service that combines:

1. **API Server**: Serves REST API endpoints for data access
2. **Web Interface**: React-based frontend for browsing inscriptions and parcels
3. **Block Processor**: Continuously processes Bitcoin blocks for inscriptions
4. **Parcel Validator**: Validates parcel provenance and handles competing claims

### Validation Process

- **BRC-420 Deploys**: Validates JSON structure, required fields, and deployer address
- **BRC-420 Mints**: Validates against corresponding deploy limits and verifies royalty payments
- **Bitmaps**: Validates format and bitmap number uniqueness
- **Parcels**: Validates format, checks parent bitmap exists, verifies provenance via Ordinals API

### Parcel System

The indexer includes comprehensive support for bitmap parcels:

- **Format Validation**: Ensures parcel content follows `{parcelNumber}.{bitmapNumber}.bitmap` format
- **Provenance Checking**: Verifies parcels are legitimate child inscriptions of their parent bitmap
- **Tie-breaker Rules**: Handles competing claims with deterministic rules (earlier block wins, then lexicographically smaller inscription ID)
- **Validity Tracking**: Marks parcels as valid/invalid based on validation results

## 💾 Data Storage

All data is stored in a SQLite database with the following tables:
- `deploys`: BRC-420 deploy inscriptions
- `mints`: BRC-420 mint inscriptions  
- `bitmaps`: Bitmap inscriptions
- `parcels`: Bitmap parcel inscriptions with validation status
- `transfers`: Wallet ownership changes
- `processed_blocks`: Block processing status
- `block_stats`: Block processing statistics

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

## ⚙️ Configuration

The app automatically configures itself for Umbrel environment:

### Environment Variables
- `ORD_API_URL`: Ordinals API endpoint (auto-detected from Umbrel services)
- `API_WALLET_URL`: Mempool API endpoint (auto-detected from Umbrel services)
- `START_BLOCK`: Starting block height for indexing (default: 792435)
- `CONCURRENCY_LIMIT`: Number of concurrent API requests (default: 10)
- `DB_PATH`: Database file path (default: `/app/data/brc420.db`)

### Umbrel Integration
The app automatically detects and connects to:
- **Bitcoin Core**: For blockchain data
- **Ordinals**: For inscription data and parcel validation
- **Mempool**: For transaction and fee information

## 🔧 Requirements

- **Bitcoin Core app**: Required for blockchain data
- **Ordinals app**: Required for inscription data and parcel validation
- **Mempool app**: Optional but recommended for enhanced functionality

## 📊 Web Interface

Access the web interface at `http://umbrel.local:8080` after installation.

Features:
- **Home**: Browse and search BRC-420 deploys
- **Bitmaps**: Browse bitmap inscriptions with links to details
- **Bitmap Details**: View bitmap information with tabbed interface
  - **Details Tab**: Bitmap metadata and ownership
  - **Parcels Tab**: All parcels associated with the bitmap
- **Parcels**: Browse all parcels across all bitmaps
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Installation

1. Add this community app store to your Umbrel
2. Install the required dependencies (Bitcoin Core and Ordinals)
3. Install the Bitmap420 Indexer app
4. Access the web interface at `http://umbrel.local:8080`

The indexer will automatically start processing blocks from the configured start block.

## 📈 Performance

Optimized for Umbrel environment:
- **Local API Connections**: Prioritizes local Umbrel services
- **Efficient Database**: SQLite with optimized indexes
- **Concurrent Processing**: Parallel block processing with configurable limits
- **Resource Management**: Memory and CPU usage optimized for home servers

## 🔒 Privacy

- **Local-only Operation**: All indexing happens on your Umbrel
- **No External Dependencies**: Uses your local Bitcoin node and Ordinals server
- **Data Sovereignty**: Your inscription data never leaves your device

## 🐛 Troubleshooting

### Common Issues

1. **Slow Initial Sync**: The first sync can take several hours depending on the start block
2. **API Connection Issues**: Ensure Bitcoin Core and Ordinals apps are running
3. **Database Errors**: Check available disk space in `/app/data`

### Logs

Application logs are available in the Umbrel app logs section or at `/app/logs/` within the container.

## 🛠 Development

Built with:
- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: React, TypeScript
- **Database**: SQLite with optimized schemas
- **Containerization**: Docker with multi-stage builds
- **Validation**: Joi schemas for data validation

## 📜 License

This project is open source. See the LICENSE file for details.

## 🤝 Support

For issues or questions:
- GitHub Issues: [Report a bug](https://github.com/switch-900/Bitmap-BRC420-Indexer/issues)
- Community: Join the Bitcoin inscription community discussions

---

**Privacy First**: All indexing happens locally on your Umbrel. Your Bitcoin data never leaves your device.

**⚡ Bitcoin Native**: Built specifically for Bitcoin inscriptions with deep understanding of the protocol.
