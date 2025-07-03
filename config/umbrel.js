require('dotenv').config();

module.exports = {
    // Primary API URLs - prefer external APIs for reliability
    ORD_API_URL: process.env.ORD_API_URL || 'https://ordinals.com',
    API_URL: process.env.API_URL || 'https://ordinals.com', 
    API_WALLET_URL: process.env.API_WALLET_URL || 'https://mempool.space/api',
    
    // Bitcoin RPC connection for direct node access (if available in Umbrel)
    BITCOIN_RPC_HOST: process.env.BITCOIN_RPC_HOST || null,
    BITCOIN_RPC_PORT: parseInt(process.env.BITCOIN_RPC_PORT) || 8332,
    BITCOIN_RPC_USER: process.env.BITCOIN_RPC_USER || null,
    BITCOIN_RPC_PASS: process.env.BITCOIN_RPC_PASS || null,
    
    // Indexing configuration - optimized for external APIs
    START_BLOCK: parseInt(process.env.START_BLOCK) || 792435, // first bitmap in block 792435
    RETRY_BLOCK_DELAY: parseInt(process.env.RETRY_BLOCK_DELAY) || 5000, // 5 second delay for external APIs
    DB_PATH: process.env.DB_PATH || './data/brc420.db',
    PORT: parseInt(process.env.PORT) || 5000,
    WEB_PORT: parseInt(process.env.WEB_PORT) || 8080,
    MAX_RETRIES: parseInt(process.env.MAX_RETRIES) || 3, // Reduced retries for external APIs
    RETRY_DELAY: parseInt(process.env.RETRY_DELAY) || 2000, // 2 second delay between retries
    CONCURRENCY_LIMIT: parseInt(process.env.CONCURRENCY_LIMIT) || 3, // Lower concurrency for external APIs
    RUN_INDEXER: process.env.RUN_INDEXER === 'true',
    
    // API timeout settings for external APIs
    API_TIMEOUT: parseInt(process.env.API_TIMEOUT) || 60000, // 60 seconds for external APIs
    STATUS_TIMEOUT: parseInt(process.env.STATUS_TIMEOUT) || 30000, // 30 seconds for status checks
    
    // Umbrel environment detection
    isUmbrelEnvironment() {
        return process.env.UMBREL_APP === 'true' || !!(process.env.APP_DATA_DIR);
    },
    
    // Get the appropriate API URL based on environment
    getApiUrl() {
        return this.ORD_API_URL;
    },
    
    // Try internal Umbrel services first, fallback to external
    async testAndSetBestApiUrl() {
        // List of internal Umbrel endpoints to try first
        const internalEndpoints = this.getInternalUmbrelEndpoints();
        
        // Test internal endpoints first
        for (const endpoint of internalEndpoints) {
            try {
                const response = await fetch(`${endpoint}/status`, { 
                    method: 'GET',
                    timeout: 5000 
                });
                if (response.ok) {
                    console.log(`✅ Using internal Umbrel ordinals API: ${endpoint}`);
                    this.ORD_API_URL = endpoint;
                    this.API_URL = endpoint;
                    return endpoint;
                }
            } catch (error) {
                console.log(`❌ Internal endpoint ${endpoint} not available`);
            }
        }
        
        // Fallback to external API
        console.log(`🌐 Using external ordinals API: ${this.ORD_API_URL}`);
        return this.ORD_API_URL;
    },
    
    // Get internal Umbrel service endpoints to try
    getInternalUmbrelEndpoints() {
        const endpoints = [];
        
        // Environment variable approach (if ordinals app is installed)
        if (process.env.APP_ORDINALS_NODE_IP) {
            endpoints.push(`http://${process.env.APP_ORDINALS_NODE_IP}:4000`);
        }
        
        // Official Umbrel service naming patterns
        const officialEndpoints = [
            'http://ordinals_web_1:4000',
            'http://ordinals_server_1:4000', 
            'http://ordinals_app_1:4000',
            'http://bitcoin-ordinals_web_1:4000',
            'http://bitcoin-ordinals_server_1:4000'
        ];
        
        endpoints.push(...officialEndpoints);
        return endpoints;
    },
    
    // Try internal mempool services first, fallback to external
    async testAndSetBestMempoolUrl() {
        // List of internal Umbrel mempool endpoints to try first
        const internalEndpoints = this.getInternalMempoolEndpoints();
        
        // Test internal endpoints first
        for (const endpoint of internalEndpoints) {
            try {
                const response = await fetch(`${endpoint}/blocks/tip/height`, { 
                    method: 'GET',
                    timeout: 5000 
                });
                if (response.ok) {
                    console.log(`✅ Using internal Umbrel mempool API: ${endpoint}`);
                    this.API_WALLET_URL = endpoint;
                    return endpoint;
                }
            } catch (error) {
                console.log(`❌ Internal mempool endpoint ${endpoint} not available`);
            }
        }
        
        // Fallback to external API
        console.log(`🌐 Using external mempool API: ${this.API_WALLET_URL}`);
        return this.API_WALLET_URL;
    },
    
    // Get internal Umbrel mempool service endpoints to try
    getInternalMempoolEndpoints() {
        const endpoints = [];
        
        // Environment variable approach (if mempool app is installed)
        if (process.env.APP_MEMPOOL_NODE_IP) {
            endpoints.push(`http://${process.env.APP_MEMPOOL_NODE_IP}:3006/api`);
        }
        
        // Official Umbrel mempool service naming patterns
        const officialEndpoints = [
            'http://mempool_web_1:3006/api',
            'http://mempool_api_1:3006/api',
            'http://mempool_server_1:3006/api',
            'http://bitcoin-mempool_web_1:3006/api',
            'http://bitcoin-mempool_api_1:3006/api'
        ];
        
        endpoints.push(...officialEndpoints);
        return endpoints;
    },
    
    // Get the best available mempool API URL
    getMempoolApiUrl() {
        return this.API_WALLET_URL;
    },
    
    // Initialize API URLs by testing internal first, then external
    async initializeApiUrls() {
        if (this.isUmbrelEnvironment()) {
            console.log('🏠 Detected Umbrel environment, testing internal services...');
            await Promise.all([
                this.testAndSetBestApiUrl(),
                this.testAndSetBestMempoolUrl()
            ]);
        } else {
            console.log('🌐 Using external APIs');
        }
    }
};
