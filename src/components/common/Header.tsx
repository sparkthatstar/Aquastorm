import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from './Logo';
import { UserRole } from '../../types';
import {
  Phone,
  MessageCircle,
  ShoppingBag,
  Droplets,
  UtensilsCrossed,
  Search,
  LayoutDashboard,
  Shield,
  Truck,
  Users,
  Menu,
  X,
  ChevronDown,
  Info,
  CreditCard,
  HelpCircle
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { currentUser, switchRole, pricingConfig, orders, complaints } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Role badges & configs
  const roleBadges: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    customer: {
      label: 'Customer (Student)',
      icon: <Users className="w-3.5 h-3.5" />,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    manager: {
      label: 'Manager (Operations)',
      icon: <Shield className="w-3.5 h-3.5" />,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    vendor: {
      label: 'Vendor (Delivery Rider)',
      icon: <Truck className="w-3.5 h-3.5" />,
      color: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    admin: {
      label: 'Admin (Platform Owner)',
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  };

  // Compute pending metrics for role badges
  const pendingPayments = orders.filter(o => o.state === 'STATE_01_PENDING_PAYMENT').length;
  const assignedToVendor = orders.filter(o => o.assignedVendorId === currentUser.id && o.state !== 'STATE_08_DELIVERED' && o.state !== 'STATE_09_COMPLETED').length;
  const openComplaints = complaints.filter(c => c.status === 'Open').length;

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'book-water', label: 'Book Water', icon: <Droplets className="w-4 h-4 text-[#00AFD5]" /> },
    { id: 'book-food', label: 'Book Food', icon: <UtensilsCrossed className="w-4 h-4 text-amber-500" /> },
    { id: 'track', label: 'Track Order', icon: <Search className="w-4 h-4 text-slate-500" /> },
    { id: 'pricing', label: 'Pricing' },
    { id: 'about', label: 'About Us' },
    { id: 'faq', label: 'FAQs' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Corporate Strip with Slogan, Phone & WhatsApp */}
      <div className="bg-[#03098F] text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Primary Slogan */}
          <div className="flex items-center gap-2 text-slate-200 font-medium">
            <span className="bg-[#00AFD5] text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
              ESUTH Pilot
            </span>
            <span className="text-white font-semibold italic">"Book Today. Drink Tomorrow."</span>
            <span className="hidden md:inline text-blue-300">| Direct-to-Hostel Logistics</span>
          </div>

          {/* Quick Contact Actions */}
          <div className="flex items-center gap-4 text-xs">
            <a
              id="header-tap-to-call"
              href={`tel:${pricingConfig.supportHotline}`}
              className="flex items-center gap-1.5 hover:text-[#00AFD5] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#00AFD5]" />
              <span className="font-mono font-medium">{pricingConfig.supportHotline}</span>
            </a>
            <span className="text-blue-400">|</span>
            <a
              id="header-whatsapp-chat"
              href={`https://wa.me/${pricingConfig.supportWhatsapp.replace('+', '')}?text=${encodeURIComponent('Hello Aquastorm Enterprise! I would like to make an inquiry regarding hostel delivery.')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 transition-colors font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center text-left hover:opacity-90 transition-opacity focus:outline-hidden"
          >
            <Logo size="md" />
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => onNavigate(link.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#03098F]/10 text-[#03098F] font-semibold'
                      : 'text-slate-600 hover:text-[#03098F] hover:bg-slate-50'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Role Switcher & Dashboard Trigger */}
          <div className="hidden sm:flex items-center gap-3">
            {/* RBAC Role Switcher Dropdown (Allows effortless inspection of all 4 roles) */}
            <div className="relative">
              <button
                id="role-switcher-toggle"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-xs transition-all cursor-pointer ${roleBadges[currentUser.role].color}`}
              >
                {roleBadges[currentUser.role].icon}
                <span>{roleBadges[currentUser.role].label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 space-y-1"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Switch Test Profile (RBAC)
                  </div>
                  {(['customer', 'manager', 'vendor', 'admin'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      id={`switch-role-${r}`}
                      onClick={() => switchRole(r)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                        currentUser.role === r
                          ? 'bg-[#03098F] text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {roleBadges[r].icon}
                        <span>{roleBadges[r].label}</span>
                      </div>
                      {r === 'manager' && pendingPayments > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                          {pendingPayments}
                        </span>
                      )}
                      {r === 'vendor' && assignedToVendor > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-bold">
                          {assignedToVendor}
                        </span>
                      )}
                      {r === 'admin' && openComplaints > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                          {openComplaints}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dashboard Action Button */}
            <button
              id="header-dashboard-btn"
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-[#00AFD5] text-white'
                  : 'bg-[#03098F] hover:bg-[#03098F]/90 text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>
                {currentUser.role === 'customer'
                  ? 'My Portal'
                  : currentUser.role === 'manager'
                  ? 'Ops Command'
                  : currentUser.role === 'vendor'
                  ? 'Rider Panel'
                  : 'Admin Console'}
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              id="mobile-role-badge"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-semibold ${roleBadges[currentUser.role].color}`}
            >
              {roleBadges[currentUser.role].icon}
              <span className="capitalize">{currentUser.role}</span>
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#03098F] focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onNavigate('book-water'); setMobileMenuOpen(false); }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-blue-50 text-[#03098F] font-semibold text-xs border border-blue-100"
            >
              <Droplets className="w-4 h-4 text-[#00AFD5]" />
              <span>Book Water</span>
            </button>
            <button
              onClick={() => { onNavigate('book-food'); setMobileMenuOpen(false); }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-amber-50 text-amber-900 font-semibold text-xs border border-amber-100"
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              <span>Book Food</span>
            </button>
          </div>

          <div className="space-y-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => { onNavigate(link.id); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                  currentView === link.id ? 'bg-[#03098F] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  {link.icon}
                  <span>{link.label}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
              className="w-full py-2.5 bg-[#03098F] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-xs"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Open {currentUser.role.toUpperCase()} Workspace</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
