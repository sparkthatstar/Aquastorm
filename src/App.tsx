import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './components/home/HomePage';
import { WaterBookingPage } from './components/booking/WaterBookingPage';
import { FoodBookingPage } from './components/booking/FoodBookingPage';
import { OrderTrackingPage } from './components/tracking/OrderTrackingPage';
import { CustomerDashboard } from './components/dashboards/CustomerDashboard';
import { ManagerDashboard } from './components/dashboards/ManagerDashboard';
import { VendorDashboard } from './components/dashboards/VendorDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { PricingPage } from './components/pages/PricingPage';
import { AboutPage } from './components/pages/AboutPage';
import { FAQPage } from './components/pages/FAQPage';
import { ContactPage } from './components/pages/ContactPage';
import { LegalModals } from './components/pages/LegalModals';
import { ReminderEngineModal } from './components/reminders/ReminderEngineModal';
import { ComplaintModal } from './components/complaints/ComplaintModal';
import { Bell, CheckCircle2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, toastMessage } = useApp();
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);

  // Scroll to top upon route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const handleNavigate = (view: string, orderId?: string) => {
    if (orderId) {
      setSelectedOrderId(orderId);
    }
    setCurrentView(view);
  };

  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'manager':
        return <ManagerDashboard onNavigate={handleNavigate} />;
      case 'vendor':
        return <VendorDashboard onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'customer':
      default:
        return <CustomerDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#00AFD5] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#00AFD5]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Global Header with Role Switcher */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenReminderModal={() => setReminderModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentView === 'book-water' && <WaterBookingPage onNavigate={handleNavigate} />}
        {currentView === 'book-food' && <FoodBookingPage onNavigate={handleNavigate} />}
        {currentView === 'track' && (
          <OrderTrackingPage
            initialOrderId={selectedOrderId}
            onNavigate={handleNavigate}
            onOpenComplaintModal={() => setComplaintModalOpen(true)}
          />
        )}
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'pricing' && <PricingPage onNavigate={handleNavigate} />}
        {currentView === 'about' && <AboutPage />}
        {currentView === 'faq' && <FAQPage />}
        {currentView === 'contact' && <ContactPage />}
      </main>

      {/* Global Modals */}
      <LegalModals
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      <ReminderEngineModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        onInstantReorder={() => {
          setReminderModalOpen(false);
          handleNavigate('book-water');
        }}
      />

      <ComplaintModal
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        targetOrderId={selectedOrderId}
      />

      {/* Corporate Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenLegal={(type) => setLegalModalType(type)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
