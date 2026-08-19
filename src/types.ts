export type UserRole = 'customer' | 'manager' | 'vendor' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  whatsappNumber: string;
  role: UserRole;
  hostelDomain?: string;
  roomIdentifier?: string;
  floorIndex?: number;
  isActive: boolean;
  registeredAt: string;
  avatarUrl?: string;
}

export type OrderState =
  | 'STATE_01_PENDING_PAYMENT'
  | 'STATE_02_PAYMENT_VERIFIED'
  | 'STATE_03_APPROVED'
  | 'STATE_04_ASSIGNED_TO_VENDOR'
  | 'STATE_05_VENDOR_ACCEPTED'
  | 'STATE_06_PREPARING'
  | 'STATE_07_OUT_FOR_DELIVERY'
  | 'STATE_08_DELIVERED'
  | 'STATE_09_COMPLETED'
  | 'STATE_CANCELLED';

export interface OrderStateDefinition {
  state: OrderState;
  label: string;
  description: string;
  stageNumber: number;
}

export type FulfillmentTrack = 'water_depot' | 'water_room_delivery' | 'food_delivery';

export interface OrderItem {
  id: string;
  name: string;
  category: 'water' | 'food' | 'drink' | 'snack';
  unitPrice: number;
  quantity: number;
  vendorName?: string;
}

export interface OrderRecord {
  id: string; // e.g., AQ-2026-0812
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerEmail?: string;
  
  // Spatial coordinates
  hostelDomain: string; // e.g. "ESUTH Boys Hostel Block A", "ESUTH Girls Hostel Block B"
  roomIdentifier: string; // e.g. "Room 204"
  floorIndex: number; // 0 = Ground Floor, 1 = 1st Floor, etc.
  
  // Logistics
  fulfillmentTrack: FulfillmentTrack;
  targetDeliveryDate: string; // YYYY-MM-DD
  targetDeliveryTimeSlot: string; // e.g. "10:00 AM - 12:00 PM"
  specialInstructions?: string;
  
  // Items & Finance
  items: OrderItem[];
  itemsSubtotal: number;
  convenienceFee: number; // Flat N300 for food
  totalAmount: number;
  
  // Payment
  paymentMethod: 'bank_transfer' | 'digital_credit';
  paymentReceiptUrl?: string;
  paymentVerifiedBy?: string;
  paymentVerifiedAt?: string;
  
  // Lifecycle
  state: OrderState;
  stateHistory: {
    state: OrderState;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }[];
  
  // Vendor Assignment
  assignedVendorId?: string;
  assignedVendorName?: string;
  vendorAcceptedAt?: string;
  
  // Feedback
  rating?: number;
  reviewComment?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  description: string;
  price: number;
  category: 'Rice & Pasta' | 'Swallow & Soups' | 'Snacks & Pastries' | 'Drinks & Smoothies' | 'Grills & Shawarma';
  imageUrl: string;
  isAvailable: boolean;
  preparationMinutes: number;
}

export interface FoodRestaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  estimatedDeliveryWindow: string;
  hostelLocation: string;
  logoUrl: string;
  isOpen: boolean;
}

export type ComplaintClassification =
  | 'Late Delivery Breach'
  | 'Inaccurate Bag Quantity Discrepancy'
  | 'Wrong Product/Mismatched Selection'
  | 'Poor Vendor Conduct Service Report'
  | 'Refund Request Initialization'
  | 'Generic Miscellaneous / Other';

export interface ComplaintTicket {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  classification: ComplaintClassification;
  subject: string;
  description: string;
  status: 'Open' | 'Under Investigation' | 'Resolved' | 'Closed';
  adminResolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ReminderSetting {
  id: string;
  customerId: string;
  cadence: 'Daily' | 'Every 2 Days' | 'Weekly' | 'Custom';
  customDays?: number;
  preferredBagCount: number;
  preferredFulfillmentTrack: FulfillmentTrack;
  preferredDeliveryTime: string;
  preferredHostelDomain: string;
  preferredRoomIdentifier: string;
  preferredFloorIndex: number;
  channel: 'WhatsApp' | 'SMS' | 'In-App' | 'All Channels';
  isEnabled: boolean;
  lastTriggeredAt?: string;
  nextScheduledAt?: string;
}

export interface PricingConfig {
  waterDepotPerBag: number; // N450
  waterRoomDeliveryPerBag: number; // N500
  foodConvenienceFee: number; // N300
  minFoodLeadTimeHours: number; // 6 hours
  supportHotline: string; // 09157004812
  supportWhatsapp: string; // +2349157004812
}
