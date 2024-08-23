
export interface Deploy {
    id: string;
    name: string;
    max: number;
    price: number;
    deployer_address: string;
    total_mints: number;
    block_height: number;
    timestamp: number;
    source_id: string;
    wallet: string;
  }
  
  export interface Mint {
    id: string;
    deploy_id: string;
    source_id: string;
    mint_address: string;
    transaction_id: string;
    block_height: number;
    timestamp: number;
    wallet: string;
  }
  
  export interface Bitmap {
    inscription_id: string;
    bitmap_number: number;
    content: string;
    address: string;
    timestamp: number;
    block_height: number;
    wallet: string;
  }