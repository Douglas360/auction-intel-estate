import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PropertyDetail from "./pages/PropertyDetail";
import SimulatorPage from "./pages/SimulatorPage";
import Admin from "./pages/Admin";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import PricingPage from "./pages/PricingPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import SubscriptionCheckout from "./pages/SubscriptionCheckout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLayout from "./components/layouts/AdminLayout";
import Login from "./pages/Login";
import AllUsers from "./pages/admin/AllUsers";
import Properties from "./pages/Properties";
import ImportProperties from "./pages/admin/ImportProperties";
import Footer from '@/components/Footer';
import { SystemSettingsProvider } from '@/context/SystemSettingsContext';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SystemSettingsProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            {/* <Route path="/search" element={<PropertySearch />} /> */}
            <Route path="/imovel" element={<Properties />} />
            <Route path="/imovel/:state" element={<Properties />} />
            <Route path="/imovel/:state/:city/:id" element={<PropertyDetail />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/subscribe/:planId" element={<SubscriptionCheckout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-canceled" element={<PaymentCanceled />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Admin routes - all protected by AdminLayout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Admin />} />
              <Route path="plans" element={<Admin />} />
              <Route path="admins" element={<AdminUsers />} />
              <Route path="users" element={<AllUsers />} />
              <Route path="import" element={<ImportProperties />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Footer />
      </SystemSettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
