
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

export interface Order {
  id: string;
  order_id: string;
  user_id: string;
  email: string;
  amount_paise: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  items: any[];
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
