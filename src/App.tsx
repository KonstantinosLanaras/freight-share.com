import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ScrollToTop } from "@/hooks/useScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ShipperDashboard from "./pages/ShipperDashboard";
import CarrierDashboard from "./pages/CarrierDashboard";
import PostLoad from "./pages/PostLoad";
import PostRoute from "./pages/PostRoute";
import MyRoutes from "./pages/MyRoutes";
import RouteDetails from "./pages/RouteDetails";
import BrowseRoutes from "./pages/BrowseRoutes";
import FindLoads from "./pages/FindLoads";
import ShipperLoads from "./pages/ShipperLoads";
import ShipperShipments from "./pages/ShipperShipments";
import CarrierShipments from "./pages/CarrierShipments";
import ShipmentDetails from "./pages/ShipmentDetails";
import HelpCenter from "./pages/HelpCenter";
import HowItWorksPage from "./pages/HowItWorks";
import Impact from "./pages/Impact";
import AdminPanel from "./pages/AdminPanel";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/routes" element={<BrowseRoutes />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            {/* Shipper Routes */}
            <Route path="/dashboard/shipper" element={
              <ProtectedRoute allowedRoles={['shipper']}>
                <ShipperDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/shipper/loads/new" element={
              <ProtectedRoute allowedRoles={['shipper']}>
                <PostLoad />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/shipper/loads" element={
              <ProtectedRoute allowedRoles={['shipper']}>
                <ShipperLoads />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/shipper/shipments" element={
              <ProtectedRoute allowedRoles={['shipper']}>
                <ShipperShipments />
              </ProtectedRoute>
            } />
            {/* Carrier Routes */}
            <Route path="/dashboard/carrier" element={
              <ProtectedRoute allowedRoles={['carrier']}>
                <CarrierDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/carrier/routes/new" element={
              <ProtectedRoute allowedRoles={['carrier']}>
                <PostRoute />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/carrier/routes" element={
              <ProtectedRoute allowedRoles={['carrier']}>
                <MyRoutes />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/carrier/routes/:id" element={
              <ProtectedRoute allowedRoles={['carrier']}>
                <RouteDetails />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/carrier/find-loads" element={
              <ProtectedRoute allowedRoles={['carrier']}>
                <FindLoads />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/carrier/shipments" element={
              <ProtectedRoute allowedRoles={['carrier']}>
                <CarrierShipments />
              </ProtectedRoute>
            } />
            {/* Shared Routes */}
            <Route path="/shipment/:id" element={
              <ProtectedRoute>
                <ShipmentDetails />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
