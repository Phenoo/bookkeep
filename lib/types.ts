export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  status: string;
  lastUpdated: string;
}

// Existing types

// New types for orders
export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  category?: string;
}

export interface Order {
  _id: string;
  customId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  category?: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  notes?: string;
  orderDate: string;
  createdBy?: string;
}
