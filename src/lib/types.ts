
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice?: number;
  stock?: number;
  sareeImg: string;
  sareeImgHint: string;
  modelImg: string;
  variety?: string;
  likes?: number;
  shares?: number;
  ownerId?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserProfile {
  role: 'customer' | 'admin' | 'wholesaler';
}

export interface WholesalerRequest {
  id?: string;
  name: string;
  isManufacturer: boolean;
  address: string;
  email: string;
  phone: string;
  sareeTypes: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}
