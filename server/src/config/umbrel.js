require('dotenv').config();

module.exports = {
    // Primary API URLs - use Umbrel internal services
    ORD_API_URL: process.env.ORD_API_URL || 'http://ordinals_web_1:4000',
    API_URL: process.env.API_URL || 'http://ordinals_web_1:4000',
    API_WALLET_URL: process.env.API_WALLET_URL || 'http://mempool_web_1:3006/api',
    
    // Indexing configuration - optimized for local node
    START_BLOCK: parseInt(process.env.START_BLOCK) || 792435, // first brc-420 in block 807604 first bitmap in block 792435
    RETRY_BLOCK_DELAY: parseInt(process.env.RETRY_BLOCK_DELAY) || 1, // Reduced delay for local node
    DB_PATH: process.env.DB_PATH || './data/brc420.db',
    PORT: parseInt(process.env.PORT) || 5000,
    WEB_PORT: parseInt(process.env.WEB_PORT) || 8080,
    MAX_RETRIES: parseInt(process.env.MAX_RETRIES) || 5, // Increased retries
    RETRY_DELAY: parseInt(process.env.RETRY_DELAY) || 1000, // Reduced delay for local node  
    CONCURRENCY_LIMIT: parseInt(process.env.CONCURRENCY_LIMIT) || 10, // Increased concurrency for local node
    RUN_INDEXER: process.env.RUN_INDEXER === 'true' || true,
    
    // API timeout settings for local node
    API_TIMEOUT: parseInt(process.env.API_TIMEOUT) || 30000, // 30 seconds for local node
    STATUS_TIMEOUT: parseInt(process.env.STATUS_TIMEOUT) || 10000, // 10 seconds for status checks
    
    // Determine if we're running in Umbrel environment
    isUmbrelEnvironment() {
        return process.env.UMBREL_APP === 'true';
    },    
    
    // Get the appropriate API URL based on environment
    getApiUrl() {
        return this.ORD_API_URL;
    },
      
    // Get local Ordinals URL for frontend content
    getLocalOrdinalsUrl() {
        return this.ORD_API_URL.replace('/api', '');
    },
    
    // Get all possible local API endpoints to test
    getLocalApiEndpoints() {
        const endpoints = [];
        
        // If explicitly configured, try that first
        if (process.env.ORD_API_URL) {
            endpoints.push(process.env.ORD_API_URL);
        }
        
        // OFFICIAL UMBREL SERVICE NAMING PATTERNS
        const officialUmbrelEndpoints = [
            'http://ordinals_web_1:4000',          // Most likely official pattern
            'http://ordinals_server_1:4000',       // Alternative service name
            'http://ordinals_app_1:4000',          // Another alternative
            'http://bitcoin-ordinals_web_1:4000',  // If app-id includes 'bitcoin-'
            'http://bitcoin-ordinals_server_1:4000'
        ];
        
        // Environment variable approach (official Umbrel pattern)
        if (process.env.APP_ORDINALS_NODE_IP) {
            endpoints.push(`http://${process.env.APP_ORDINALS_NODE_IP}:4000`);
        }
        
        endpoints.push(...officialUmbrelEndpoints);
        return [...new Set(endpoints)]; // Remove duplicates
    },
    
    // Get all possible mempool API endpoints to test
    getMempoolApiEndpoints() {
        const endpoints = [];
        
        // If explicitly configured, try that first
        if (process.env.API_WALLET_URL) {
            endpoints.push(process.env.API_WALLET_URL);
        }
        
        // OFFICIAL UMBREL SERVICE NAMING PATTERNS for Mempool
        const officialUmbrelMempoolEndpoints = [
            'http://mempool_web_1:3006/api',        // Most likely official pattern
            'http://mempool_api_1:3006/api',        // Alternative service name
            'http://mempool_server_1:3006/api',     // Another alternative
            'http://bitcoin-mempool_web_1:3006/api', // If app-id includes 'bitcoin-'
            'http://bitcoin-mempool_api_1:3006/api'
        ];
        
        // Environment variable approach (official Umbrel pattern)
        if (process.env.APP_MEMPOOL_NODE_IP) {
            endpoints.push(`http://${process.env.APP_MEMPOOL_NODE_IP}:3006/api`);
        }
        
        // From official Umbrel mempool app exports.sh - use internal Docker IP
        if (process.env.APP_MEMPOOL_API_IP) {
            endpoints.push(`http://${process.env.APP_MEMPOOL_API_IP}:3006/api`);
        }
        
        endpoints.push(...officialUmbrelMempoolEndpoints);
        return [...new Set(endpoints)]; // Remove duplicates
    },
    
    // Get the appropriate mempool API URL for the current environment  
    getMempoolApiUrl() {
        return this.API_WALLET_URL;
    }
};
