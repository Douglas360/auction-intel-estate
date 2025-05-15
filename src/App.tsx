import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PropertySearch from "./pages/PropertySearch";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          {/* <Route path="/search" element={<PropertySearch />} /> */}
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
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
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
