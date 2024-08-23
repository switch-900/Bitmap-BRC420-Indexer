export interface Deploy {
    p: string;
    op: string;
    id: string;
    source_id: string;
    name: string;
    max: number;
    price: number;
    block_height: number;
    inscription_index: number;
    timestamp: number;
    current_wallet: string;
    deployer_address: string;
    current_mint_count: number;
  }
  
  export interface Mint {
    id: string;
    deploy_id: string;
    block_height: number;
    inscription_index: number;
    timestamp: number;
    current_wallet: string;
  }
  
  export interface Bitmap {
    inscription_id: string;
    bitmap_number: number;
    content: string;
    block_height: number;
    inscription_index: number;
    timestamp: number;
    current_wallet: string;
  }
  
  export interface Transfer {
    inscription_id: string;
    from_wallet: string;
    to_wallet: string;
    block_height: number;
    timestamp: number;
  }