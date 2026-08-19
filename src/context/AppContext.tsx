import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  OrderRecord,
  OrderState,
  ComplaintTicket,
  ReminderSetting,
  PricingConfig,
  FoodRestaurant,
  FoodItem,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_ORDERS,
  INITIAL_PRICING_CONFIG,
  INITIAL_COMPLAINTS,
  INITIAL_REMINDERS,
  FOOD_RESTAURANTS,
  FOOD_ITEMS
} from '../data/mockData';

interface AppContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  orders: OrderRecord[];
  pricingConfig: PricingConfig;
  complaints: ComplaintTicket[];
  reminders: ReminderSetting[];
  restaurants: FoodRestaurant[];
  foodItems: FoodItem[];
  activeNotification: string | null;
  
  // Auth & Roles
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  toggleUserActiveStatus: (userId: string) => void;
  
  // Orders CRUD & Lifecycle
  createOrder: (order: Omit<OrderRecord, 'id' | 'createdAt' | 'updatedAt' | 'state' | 'stateHistory'>) => OrderRecord;
  updateOrderStatus: (orderId: string, nextState: OrderState, note?: string) => { success: boolean; message: string };
  assignVendor: (orderId: string, vendorId: string, vendorName: string) => { success: boolean; message: string };
  verifyPayment: (orderId: string) => { success: boolean; message: string };
  holdPayment: (orderId: string, reason: string) => { success: boolean; message: string };
  cancelOrderAdminOverride: (orderId: string, reason: string) => { success: boolean; message: string };
  rateOrder: (orderId: string, rating: number, reviewComment?: string) => void;
  reorderPrevious: (orderId: string) => OrderRecord | null;
  
  // Pricing & Configuration
  updatePricingConfig: (config: Partial<PricingConfig>) => void;
  
  // Support & Complaints
  submitComplaint: (complaint: Omit<ComplaintTicket, 'id' | 'createdAt' | 'status'>) => ComplaintTicket;
  resolveComplaint: (complaintId: string, notes: string) => void;
  
  // Reminder Protocol
  updateReminderSetting: (setting: Partial<ReminderSetting>) => void;
  triggerSimulatedReminder: (customerId: string) => void;
  
  // Notification helper
  showToast: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ORDERS: 'aquastorm_orders_v1',
  USERS: 'aquastorm_users_v1',
  PRICING: 'aquastorm_pricing_v1',
  COMPLAINTS: 'aquastorm_complaints_v1',
  REMINDERS: 'aquastorm_reminders_v1',
  CURRENT_USER: 'aquastorm_current_user_v1'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or defaults
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : DEMO_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return DEMO_USERS[0]; // Default to Customer (Chinedu Eze)
  });

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRICING);
    return saved ? JSON.parse(saved) : INITIAL_PRICING_CONFIG;
  });

  const [complaints, setComplaints] = useState<ComplaintTicket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [reminders, setReminders] = useState<ReminderSetting[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });

  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(pricingConfig));
  }, [pricingConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  const showToast = (message: string) => {
    setActiveNotification(message);
    setTimeout(() => {
      setActiveNotification(null);
    }, 4000);
  };

  const switchRole = (role: UserRole) => {
    const targetUser = allUsers.find(u => u.role === role) || DEMO_USERS.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      showToast(`Switched active profile to ${targetUser.fullName} (${role.toUpperCase()})`);
    }
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...profile };
      setAllUsers(users => users.map(u => u.id === prev.id ? updated : u));
      return updated;
    });
    showToast('Profile parameters updated successfully.');
  };

  const toggleUserActiveStatus = (userId: string) => {
    if (currentUser.role !== 'admin') {
      showToast('Error: Only Admin can modify user account access.');
      return;
    }
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
    showToast('User account status toggled.');
  };

  // Order Creation
  const createOrder = (
    orderData: Omit<OrderRecord, 'id' | 'createdAt' | 'updatedAt' | 'state' | 'stateHistory'>
  ): OrderRecord => {
    const orderId = `AQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    
    const newOrder: OrderRecord = {
      ...orderData,
      id: orderId,
      state: 'STATE_01_PENDING_PAYMENT',
      stateHistory: [
        {
          state: 'STATE_01_PENDING_PAYMENT',
          timestamp: now,
          note: 'Booking registered. Bank transfer payment token attached.'
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    setOrders(prev => [newOrder, ...prev]);
    showToast(`Order ${orderId} created! Status: Pending Payment Verification.`);
    return newOrder;
  };

  // Order State Progression with Strict RBAC Checks
  const updateOrderStatus = (
    orderId: string,
    nextState: OrderState,
    note?: string
  ): { success: boolean; message: string } => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) {
      return { success: false, message: 'Order not found.' };
    }

    // Role-based restrictions check
    if (nextState === 'STATE_CANCELLED') {
      if (currentUser.role !== 'admin') {
        return {
          success: false,
          message: 'Strict Rule: Only Admin can authorize order cancellations and financial refunds.'
        };
      }
    }

    if (currentUser.role === 'vendor') {
      // Vendors can only step through their assigned states
      const allowedVendorStates: OrderState[] = [
        'STATE_05_VENDOR_ACCEPTED',
        'STATE_06_PREPARING',
        'STATE_07_OUT_FOR_DELIVERY',
        'STATE_08_DELIVERED'
      ];
      if (!allowedVendorStates.includes(nextState)) {
        return {
          success: false,
          message: 'Vendors can only mark tickets as Accepted, Preparing, Out For Delivery, or Delivered.'
        };
      }
      if (targetOrder.assignedVendorId !== currentUser.id && currentUser.role === 'vendor') {
        return {
          success: false,
          message: 'You can only update orders specifically assigned to your dispatch roster.'
        };
      }
    }

    const now = new Date().toISOString();
    const updatedOrder: OrderRecord = {
      ...targetOrder,
      state: nextState,
      updatedAt: now,
      stateHistory: [
        ...targetOrder.stateHistory,
        {
          state: nextState,
          timestamp: now,
          note: note || `State transitioned to ${nextState}`,
          updatedBy: currentUser.fullName
        }
      ]
    };

    if (nextState === 'STATE_05_VENDOR_ACCEPTED' && !updatedOrder.vendorAcceptedAt) {
      updatedOrder.vendorAcceptedAt = now;
    }

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    showToast(`Order ${orderId} updated to: ${nextState.replace('STATE_', '').replace(/_/g, ' ')}`);
    return { success: true, message: 'Status transitioned successfully.' };
  };

  const assignVendor = (orderId: string, vendorId: string, vendorName: string) => {
    if (currentUser.role !== 'manager' && currentUser.role !== 'admin') {
      return { success: false, message: 'Only Managers and Admins can assign delivery staff.' };
    }

    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          assignedVendorId: vendorId,
          assignedVendorName: vendorName,
          state: 'STATE_04_ASSIGNED_TO_VENDOR',
          updatedAt: now,
          stateHistory: [
            ...o.stateHistory,
            {
              state: 'STATE_04_ASSIGNED_TO_VENDOR',
              timestamp: now,
              note: `Assigned to delivery vendor: ${vendorName}`,
              updatedBy: currentUser.fullName
            }
          ]
        };
      }
      return o;
    }));

    showToast(`Order ${orderId} assigned to ${vendorName}.`);
    return { success: true, message: 'Vendor assigned successfully.' };
  };

  const verifyPayment = (orderId: string) => {
    if (currentUser.role !== 'manager' && currentUser.role !== 'admin') {
      return { success: false, message: 'Only Managers and Admins can verify bank transfer receipts.' };
    }

    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paymentVerifiedBy: currentUser.fullName,
          paymentVerifiedAt: now,
          state: 'STATE_02_PAYMENT_VERIFIED',
          updatedAt: now,
          stateHistory: [
            ...o.stateHistory,
            {
              state: 'STATE_02_PAYMENT_VERIFIED',
              timestamp: now,
              note: `Bank payment token verified by ${currentUser.fullName}`,
              updatedBy: currentUser.fullName
            },
            {
              state: 'STATE_03_APPROVED',
              timestamp: now,
              note: 'Order approved and unlocked for vendor dispatch.',
              updatedBy: 'System Auto-Trigger'
            }
          ]
        };
      }
      return o;
    }));

    showToast(`Payment verified for order ${orderId}. Order Approved.`);
    return { success: true, message: 'Payment verified and order approved.' };
  };

  const holdPayment = (orderId: string, reason: string) => {
    if (currentUser.role !== 'manager' && currentUser.role !== 'admin') {
      return { success: false, message: 'Permission denied.' };
    }

    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          updatedAt: now,
          stateHistory: [
            ...o.stateHistory,
            {
              state: o.state,
              timestamp: now,
              note: `HOLD: ${reason}`,
              updatedBy: currentUser.fullName
            }
          ]
        };
      }
      return o;
    }));

    showToast(`Order ${orderId} placed on hold: ${reason}`);
    return { success: true, message: 'Order held for verification.' };
  };

  const cancelOrderAdminOverride = (orderId: string, reason: string) => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Strict Restriction: Only Admin can cancel orders or execute refunds.' };
    }

    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          state: 'STATE_CANCELLED',
          updatedAt: now,
          stateHistory: [
            ...o.stateHistory,
            {
              state: 'STATE_CANCELLED',
              timestamp: now,
              note: `ADMIN MASTER CANCELLATION: ${reason}`,
              updatedBy: currentUser.fullName
            }
          ]
        };
      }
      return o;
    }));

    showToast(`Order ${orderId} cancelled by Admin override. Refund ledger logged.`);
    return { success: true, message: 'Order cancelled by Admin override.' };
  };

  const rateOrder = (orderId: string, rating: number, reviewComment?: string) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          rating,
          reviewComment,
          state: 'STATE_09_COMPLETED',
          updatedAt: now,
          stateHistory: [
            ...o.stateHistory,
            {
              state: 'STATE_09_COMPLETED',
              timestamp: now,
              note: `Client rated experience: ${rating}/5 stars - "${reviewComment || 'Great service'}"`
            }
          ]
        };
      }
      return o;
    }));
    showToast(`Thank you! Your rating of ${rating} stars has been recorded.`);
  };

  const reorderPrevious = (orderId: string): OrderRecord | null => {
    const previous = orders.find(o => o.id === orderId);
    if (!previous) return null;

    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    const dateStr = nextDay.toISOString().split('T')[0];

    const duplicated = createOrder({
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      customerPhone: currentUser.mobileNumber,
      customerWhatsapp: currentUser.whatsappNumber,
      customerEmail: currentUser.email,
      hostelDomain: previous.hostelDomain,
      roomIdentifier: previous.roomIdentifier,
      floorIndex: previous.floorIndex,
      fulfillmentTrack: previous.fulfillmentTrack,
      targetDeliveryDate: dateStr,
      targetDeliveryTimeSlot: previous.targetDeliveryTimeSlot,
      specialInstructions: previous.specialInstructions,
      items: previous.items,
      itemsSubtotal: previous.itemsSubtotal,
      convenienceFee: previous.convenienceFee,
      totalAmount: previous.totalAmount,
      paymentMethod: 'bank_transfer',
      paymentReceiptUrl: previous.paymentReceiptUrl
    });

    return duplicated;
  };

  const updatePricingConfig = (config: Partial<PricingConfig>) => {
    if (currentUser.role !== 'admin') {
      showToast('Error: Only Admin can modify global system rates.');
      return;
    }
    setPricingConfig(prev => ({ ...prev, ...config }));
    showToast('Global price matrix updated successfully.');
  };

  const submitComplaint = (
    complaintData: Omit<ComplaintTicket, 'id' | 'createdAt' | 'status'>
  ): ComplaintTicket => {
    const id = `CMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();
    const newComplaint: ComplaintTicket = {
      ...complaintData,
      id,
      status: 'Open',
      createdAt: now
    };

    setComplaints(prev => [newComplaint, ...prev]);
    showToast(`Ticket ${id} registered under "${complaintData.classification}". Admin notified.`);
    return newComplaint;
  };

  const resolveComplaint = (complaintId: string, notes: string) => {
    if (currentUser.role !== 'admin') {
      showToast('Error: Only Admin can formally resolve complaints.');
      return;
    }
    const now = new Date().toISOString();
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        return {
          ...c,
          status: 'Resolved',
          adminResolutionNotes: notes,
          resolvedAt: now
        };
      }
      return c;
    }));
    showToast(`Complaint ${complaintId} resolved with corporate audit log.`);
  };

  const updateReminderSetting = (setting: Partial<ReminderSetting>) => {
    const existing = reminders.find(r => r.customerId === currentUser.id);
    if (existing) {
      setReminders(prev => prev.map(r => r.id === existing.id ? { ...r, ...setting } : r));
    } else {
      const newReminder: ReminderSetting = {
        id: `rem_${Date.now()}`,
        customerId: currentUser.id,
        cadence: 'Every 2 Days',
        preferredBagCount: 3,
        preferredFulfillmentTrack: 'water_room_delivery',
        preferredDeliveryTime: '09:00 AM - 11:00 AM',
        preferredHostelDomain: currentUser.hostelDomain || 'ESUTH Boys Hostel Block A (Faculty of Engineering)',
        preferredRoomIdentifier: currentUser.roomIdentifier || 'Room 204',
        preferredFloorIndex: currentUser.floorIndex || 1,
        channel: 'WhatsApp',
        isEnabled: true,
        ...setting
      };
      setReminders(prev => [...prev, newReminder]);
    }
    showToast('Automated Stock Reminder protocol updated.');
  };

  const triggerSimulatedReminder = (customerId: string) => {
    const user = allUsers.find(u => u.id === customerId) || currentUser;
    showToast(`Simulated WhatsApp reminder dispatched to ${user.whatsappNumber}!`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        orders,
        pricingConfig,
        complaints,
        reminders,
        restaurants: FOOD_RESTAURANTS,
        foodItems: FOOD_ITEMS,
        activeNotification,
        setCurrentUser,
        switchRole,
        updateUserProfile,
        toggleUserActiveStatus,
        createOrder,
        updateOrderStatus,
        assignVendor,
        verifyPayment,
        holdPayment,
        cancelOrderAdminOverride,
        rateOrder,
        reorderPrevious,
        updatePricingConfig,
        submitComplaint,
        resolveComplaint,
        updateReminderSetting,
        triggerSimulatedReminder,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
