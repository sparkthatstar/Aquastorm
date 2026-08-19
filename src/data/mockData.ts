import {
  UserProfile,
  OrderRecord,
  FoodRestaurant,
  FoodItem,
  ComplaintTicket,
  ReminderSetting,
  PricingConfig,
  OrderStateDefinition
} from '../types';

export const ORDER_STATES_META: Record<string, OrderStateDefinition> = {
  STATE_01_PENDING_PAYMENT: {
    state: 'STATE_01_PENDING_PAYMENT',
    stageNumber: 1,
    label: 'Pending Payment',
    description: 'Awaiting bank transfer slip upload from client.'
  },
  STATE_02_PAYMENT_VERIFIED: {
    state: 'STATE_02_PAYMENT_VERIFIED',
    stageNumber: 2,
    label: 'Payment Verified',
    description: 'Platform Manager validated manual transaction proof.'
  },
  STATE_03_APPROVED: {
    state: 'STATE_03_APPROVED',
    stageNumber: 3,
    label: 'Approved',
    description: 'System committed order parameters to active fulfillment pool.'
  },
  STATE_04_ASSIGNED_TO_VENDOR: {
    state: 'STATE_04_ASSIGNED_TO_VENDOR',
    stageNumber: 4,
    label: 'Assigned to Vendor',
    description: 'Campus delivery logistics personnel assigned.'
  },
  STATE_05_VENDOR_ACCEPTED: {
    state: 'STATE_05_VENDOR_ACCEPTED',
    stageNumber: 5,
    label: 'Vendor Accepted',
    description: 'Delivery team member formally acknowledged target ticket.'
  },
  STATE_06_PREPARING: {
    state: 'STATE_06_PREPARING',
    stageNumber: 6,
    label: 'Preparing',
    description: 'Stock assembly, hygiene check, and bag packing initiated.'
  },
  STATE_07_OUT_FOR_DELIVERY: {
    state: 'STATE_07_OUT_FOR_DELIVERY',
    stageNumber: 7,
    label: 'Out For Delivery',
    description: 'Vendor transiting through campus grounds to designated room.'
  },
  STATE_08_DELIVERED: {
    state: 'STATE_08_DELIVERED',
    stageNumber: 8,
    label: 'Delivered',
    description: 'Item handoff confirmed at hostel room coordinate.'
  },
  STATE_09_COMPLETED: {
    state: 'STATE_09_COMPLETED',
    stageNumber: 9,
    label: 'Completed',
    description: 'Post-delivery validation window closed without dispute.'
  },
  STATE_CANCELLED: {
    state: 'STATE_CANCELLED',
    stageNumber: 0,
    label: 'Cancelled (Admin Override)',
    description: 'Order terminated and processed for refund by Admin.'
  }
};

export const INITIAL_PRICING_CONFIG: PricingConfig = {
  waterDepotPerBag: 450,
  waterRoomDeliveryPerBag: 500,
  foodConvenienceFee: 300,
  minFoodLeadTimeHours: 6,
  supportHotline: '09157004812',
  supportWhatsapp: '+2349157004812'
};

export const ESUTH_HOSTEL_DOMAINS = [
  'ESUTH Boys Hostel Block A (Faculty of Engineering)',
  'ESUTH Boys Hostel Block B (Faculty of Sciences)',
  'ESUTH Boys Hostel Block C (Faculty of Management)',
  'ESUTH Girls Hostel Block A (Queens Hall)',
  'ESUTH Girls Hostel Block B (Silvercrest Hall)',
  'ESUTH Girls Hostel Block C (Grace Hall)',
  'Agbani Main Campus Lodge Zone 1 (Off-Campus)',
  'Agbani Main Campus Lodge Zone 2 (Off-Campus)'
];

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'usr_cust_01',
    fullName: 'Chinedu Eze',
    email: 'chinedu.eze@esuth.edu.ng',
    mobileNumber: '08034567890',
    whatsappNumber: '+2348034567890',
    role: 'customer',
    hostelDomain: 'ESUTH Boys Hostel Block A (Faculty of Engineering)',
    roomIdentifier: 'Room 204',
    floorIndex: 2,
    isActive: true,
    registeredAt: '2026-08-01T08:30:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_mgr_01',
    fullName: 'Emeka Okonkwo',
    email: 'operations@aquastorm.ng',
    mobileNumber: '09157004812',
    whatsappNumber: '+2349157004812',
    role: 'manager',
    isActive: true,
    registeredAt: '2026-07-15T09:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_ven_01',
    fullName: 'Musa Ibrahim (Campus Rider 1)',
    email: 'musa.rider@aquastorm.ng',
    mobileNumber: '08123456789',
    whatsappNumber: '+2348123456789',
    role: 'vendor',
    isActive: true,
    registeredAt: '2026-07-20T11:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_adm_01',
    fullName: 'Flourish Onyekwere (Platform Owner)',
    email: 'onyekwereflourish123@gmail.com',
    mobileNumber: '09157004812',
    whatsappNumber: '+2349157004812',
    role: 'admin',
    isActive: true,
    registeredAt: '2026-07-01T00:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  }
];

export const FOOD_RESTAURANTS: FoodRestaurant[] = [
  {
    id: 'rest_01',
    name: 'Campus Delight Kitchen',
    cuisine: 'Authentic Nigerian Rice, Soups & Specials',
    rating: 4.9,
    estimatedDeliveryWindow: 'Scheduled Lead Time (6h min)',
    hostelLocation: 'Behind Block A Commercial Strip, ESUTH',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    isOpen: true
  },
  {
    id: 'rest_02',
    name: 'Mama Nkechi Express Pot',
    cuisine: 'Traditional Soups, Pounded Yam & Fried Fish',
    rating: 4.8,
    estimatedDeliveryWindow: 'Scheduled Lead Time (6h min)',
    hostelLocation: 'Girls Hostel Access Junction, ESUTH',
    logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80',
    isOpen: true
  },
  {
    id: 'rest_03',
    name: 'Storm Fast Grills & Pastries',
    cuisine: 'Beef & Chicken Shawarma, Meat Pies & Cold Smoothies',
    rating: 4.9,
    estimatedDeliveryWindow: 'Scheduled Lead Time (6h min)',
    hostelLocation: 'Student Union Building (SUB) Ground Floor',
    logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80',
    isOpen: true
  }
];

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: 'food_01',
    restaurantId: 'rest_01',
    restaurantName: 'Campus Delight Kitchen',
    name: 'Smoky Jollof Rice + Crispy Chicken & Fried Plantain',
    description: 'Slow-cooked firewood spiced Jollof rice served with seasoned quarter chicken and sweet ripe dodo.',
    price: 1800,
    category: 'Rice & Pasta',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    preparationMinutes: 45
  },
  {
    id: 'food_02',
    restaurantId: 'rest_01',
    restaurantName: 'Campus Delight Kitchen',
    name: 'Special Fried Rice & Peppered Turkey',
    description: 'Wok-tossed basmati style fried rice with veggies, sweet corn, and deep fried spiced turkey wing.',
    price: 2200,
    category: 'Rice & Pasta',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    preparationMinutes: 45
  },
  {
    id: 'food_03',
    restaurantId: 'rest_02',
    restaurantName: 'Mama Nkechi Express Pot',
    name: 'Pounded Yam with Rich Egusi Soup & Goat Meat',
    description: 'Smooth hot pounded yam wrapped with thick melon seed soup, stockfish, and tender goat meat chunks.',
    price: 2400,
    category: 'Swallow & Soups',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    preparationMinutes: 60
  },
  {
    id: 'food_04',
    restaurantId: 'rest_02',
    restaurantName: 'Mama Nkechi Express Pot',
    name: 'Semovita with Oha Soup & Dried Catfish',
    description: 'Traditional Igbo Oha soup prepared with freshly picked leaves, cocoyam thickener, and dried fish.',
    price: 2100,
    category: 'Swallow & Soups',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    preparationMinutes: 60
  },
  {
    id: 'food_05',
    restaurantId: 'rest_03',
    restaurantName: 'Storm Fast Grills & Pastries',
    name: 'Double Sausage Jumbo Beef Shawarma with Extra Cheese',
    description: 'Hot grilled wrap packed with shredded beef suya, 2 chicken franks, creamy mayonnaise sauce & cheese.',
    price: 1900,
    category: 'Grills & Shawarma',
    imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    preparationMinutes: 30
  },
  {
    id: 'food_06',
    restaurantId: 'rest_03',
    restaurantName: 'Storm Fast Grills & Pastries',
    name: 'Freshly Baked Rich Meat Pie (Pair of 2)',
    description: 'Flaky golden pastry loaded with minced beef chunks, carrots, and savory Irish potato filling.',
    price: 1200,
    category: 'Snacks & Pastries',
    imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    preparationMinutes: 20
  },
  {
    id: 'food_07',
    restaurantId: 'rest_03',
    restaurantName: 'Storm Fast Grills & Pastries',
    name: 'Chilled Hibiscus Zobo Infusion with Ginger & Pineapple (1L)',
    description: 'Refreshing cold natural clove and pineapple steeped Nigerian zobo drink. 100% hygienic bottle.',
    price: 700,
    category: 'Drinks & Smoothies',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    preparationMinutes: 10
  }
];

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'AQ-2026-0801',
    customerId: 'usr_cust_01',
    customerName: 'Chinedu Eze',
    customerPhone: '08034567890',
    customerWhatsapp: '+2348034567890',
    customerEmail: 'chinedu.eze@esuth.edu.ng',
    hostelDomain: 'ESUTH Boys Hostel Block A (Faculty of Engineering)',
    roomIdentifier: 'Room 204',
    floorIndex: 2,
    fulfillmentTrack: 'water_room_delivery',
    targetDeliveryDate: '2026-08-17',
    targetDeliveryTimeSlot: '09:00 AM - 11:00 AM',
    specialInstructions: 'Please drop directly inside Room 204 next to water dispenser.',
    items: [
      {
        id: 'item_w_01',
        name: 'Pure Sachet Water Bag (20 sachets/bag)',
        category: 'water',
        unitPrice: 500,
        quantity: 4
      }
    ],
    itemsSubtotal: 2000,
    convenienceFee: 0,
    totalAmount: 2000,
    paymentMethod: 'bank_transfer',
    paymentReceiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    paymentVerifiedBy: 'Emeka Okonkwo',
    paymentVerifiedAt: '2026-08-16T15:45:00Z',
    state: 'STATE_07_OUT_FOR_DELIVERY',
    stateHistory: [
      { state: 'STATE_01_PENDING_PAYMENT', timestamp: '2026-08-16T15:30:00Z', note: 'Order placed by student' },
      { state: 'STATE_02_PAYMENT_VERIFIED', timestamp: '2026-08-16T15:45:00Z', note: 'OPay transfer verified (Ref: 240816992)', updatedBy: 'Emeka Okonkwo' },
      { state: 'STATE_03_APPROVED', timestamp: '2026-08-16T15:46:00Z', note: 'Committed to delivery queue' },
      { state: 'STATE_04_ASSIGNED_TO_VENDOR', timestamp: '2026-08-16T15:50:00Z', note: 'Allocated to Musa Ibrahim' },
      { state: 'STATE_05_VENDOR_ACCEPTED', timestamp: '2026-08-16T15:52:00Z', note: 'Rider acknowledged delivery ticket' },
      { state: 'STATE_06_PREPARING', timestamp: '2026-08-16T15:55:00Z', note: 'Bags inspected and loaded onto trolley' },
      { state: 'STATE_07_OUT_FOR_DELIVERY', timestamp: '2026-08-16T16:05:00Z', note: 'Rider on transit towards Block A' }
    ],
    assignedVendorId: 'usr_ven_01',
    assignedVendorName: 'Musa Ibrahim (Campus Rider 1)',
    vendorAcceptedAt: '2026-08-16T15:52:00Z',
    createdAt: '2026-08-16T15:30:00Z',
    updatedAt: '2026-08-16T16:05:00Z'
  },
  {
    id: 'AQ-2026-0802',
    customerId: 'usr_cust_01',
    customerName: 'Chinedu Eze',
    customerPhone: '08034567890',
    customerWhatsapp: '+2348034567890',
    hostelDomain: 'ESUTH Boys Hostel Block A (Faculty of Engineering)',
    roomIdentifier: 'Room 204',
    floorIndex: 2,
    fulfillmentTrack: 'food_delivery',
    targetDeliveryDate: '2026-08-17',
    targetDeliveryTimeSlot: '01:00 PM - 02:30 PM',
    specialInstructions: 'Add extra pepper sauce to the Jollof rice.',
    items: [
      {
        id: 'food_01',
        name: 'Smoky Jollof Rice + Crispy Chicken & Fried Plantain',
        category: 'food',
        unitPrice: 1800,
        quantity: 1,
        vendorName: 'Campus Delight Kitchen'
      },
      {
        id: 'food_07',
        name: 'Chilled Hibiscus Zobo Infusion (1L)',
        category: 'drink',
        unitPrice: 700,
        quantity: 1,
        vendorName: 'Storm Fast Grills & Pastries'
      }
    ],
    itemsSubtotal: 2500,
    convenienceFee: 300,
    totalAmount: 2800,
    paymentMethod: 'bank_transfer',
    paymentReceiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    state: 'STATE_01_PENDING_PAYMENT',
    stateHistory: [
      { state: 'STATE_01_PENDING_PAYMENT', timestamp: '2026-08-16T16:00:00Z', note: 'Receipt uploaded by client, awaiting verification' }
    ],
    createdAt: '2026-08-16T16:00:00Z',
    updatedAt: '2026-08-16T16:00:00Z'
  },
  {
    id: 'AQ-2026-0790',
    customerId: 'usr_cust_01',
    customerName: 'Chinedu Eze',
    customerPhone: '08034567890',
    customerWhatsapp: '+2348034567890',
    hostelDomain: 'ESUTH Boys Hostel Block A (Faculty of Engineering)',
    roomIdentifier: 'Room 204',
    floorIndex: 2,
    fulfillmentTrack: 'water_depot',
    targetDeliveryDate: '2026-08-14',
    targetDeliveryTimeSlot: '11:00 AM - 12:00 PM',
    items: [
      {
        id: 'item_w_02',
        name: 'Pure Sachet Water Bag (Depot Pickup)',
        category: 'water',
        unitPrice: 450,
        quantity: 5
      }
    ],
    itemsSubtotal: 2250,
    convenienceFee: 0,
    totalAmount: 2250,
    paymentMethod: 'bank_transfer',
    paymentVerifiedBy: 'Emeka Okonkwo',
    paymentVerifiedAt: '2026-08-14T09:10:00Z',
    state: 'STATE_09_COMPLETED',
    stateHistory: [
      { state: 'STATE_01_PENDING_PAYMENT', timestamp: '2026-08-14T08:50:00Z' },
      { state: 'STATE_02_PAYMENT_VERIFIED', timestamp: '2026-08-14T09:10:00Z' },
      { state: 'STATE_03_APPROVED', timestamp: '2026-08-14T09:12:00Z' },
      { state: 'STATE_08_DELIVERED', timestamp: '2026-08-14T11:20:00Z', note: 'Collected at Ground Floor Depot' },
      { state: 'STATE_09_COMPLETED', timestamp: '2026-08-14T12:00:00Z' }
    ],
    rating: 5,
    reviewComment: 'Fast service! Water was clean and chilled.',
    createdAt: '2026-08-14T08:50:00Z',
    updatedAt: '2026-08-14T12:00:00Z'
  }
];

export const INITIAL_COMPLAINTS: ComplaintTicket[] = [
  {
    id: 'CMP-2026-101',
    orderId: 'AQ-2026-0790',
    customerId: 'usr_cust_01',
    customerName: 'Chinedu Eze',
    classification: 'Inaccurate Bag Quantity Discrepancy',
    subject: 'Minor bag count clarification',
    description: 'Wanted to verify if depot discount coupon was applied correctly for 5 bags. All settled smoothly.',
    status: 'Resolved',
    adminResolutionNotes: 'Explained depot pricing matrix (N450/bag vs N500/bag). Customer satisfied.',
    createdAt: '2026-08-14T12:30:00Z',
    resolvedAt: '2026-08-14T13:00:00Z'
  }
];

export const INITIAL_REMINDERS: ReminderSetting[] = [
  {
    id: 'rem_01',
    customerId: 'usr_cust_01',
    cadence: 'Every 2 Days',
    preferredBagCount: 3,
    preferredFulfillmentTrack: 'water_room_delivery',
    preferredDeliveryTime: '09:00 AM - 11:00 AM',
    preferredHostelDomain: 'ESUTH Boys Hostel Block A (Faculty of Engineering)',
    preferredRoomIdentifier: 'Room 204',
    preferredFloorIndex: 2,
    channel: 'WhatsApp',
    isEnabled: true,
    lastTriggeredAt: '2026-08-15T08:00:00Z',
    nextScheduledAt: '2026-08-17T08:00:00Z'
  }
];
