
export type ProductCategory = 'saree' | 'crochet' | 'lehenga';

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
  thumbnailImg?: string;
  thumbnailModelImg?: string;
  variety?: string;
  category: ProductCategory;
  likes?: number;
  shares?: number;
  ownerId?: string;
  updatedAt?: any; 
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserProfile {
  role: 'customer' | 'admin' | 'wholesaler';
  email?: string;
  businessName?: string;
  bannerUrl?: string;
}

export interface ShippingDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
}

export interface OrderItem {
  id: string;
  name: string;
  ownerId: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_id: string;
  user_id: string;
  email: string;
  amount_paise: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  shipping_details?: ShippingDetails;
  created_at: any;
  updated_at: any;
  courier?: string;
  tracking_id?: string;
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
