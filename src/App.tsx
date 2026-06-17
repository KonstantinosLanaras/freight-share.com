import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ScrollToTop } from "@/hooks/useScrollToTop";
import { DemoModeProvider } from "@/hooks/useDemoMode";
import { DemoModeBadge } from "@/components/DemoModeBadge";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CookieConsent } from "@/components/CookieConsent";
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
import ForShippers from "./pages/ForShippers";
import ForCarriers from "./pages/ForCarriers";
import AdminPanel from "./pages/AdminPanel";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Research from "./pages/Research";
import NotFound from "./pages/NotFound";
import Messages from "./pages/Messages";
import HowPaymentsWork from "./pages/HowPaymentsWork";
import LoadDetails from "./pages/LoadDetails";
import ShipperVerification from "./pages/ShipperVerification";
import SelectRole from "./pages/SelectRole";
import RouteRequestForm from "./pages/RouteRequestForm";
import RouteRequestStatus from "./pages/RouteRequestStatus";
import ShipperRequests from "./pages/ShipperRequests";
import CarrierRequests from "./pages/CarrierRequests";
import CarrierRequestDetails from "./pages/CarrierRequestDetails";
import CarrierInsuranceSetup from "./pages/CarrierInsuranceSetup";
import SavedLoads from "./pages/SavedLoads";
import RouteOfferPage from "./pages/RouteOfferPage";
import Resolution from "./pages/Resolution";
import ResolutionCase from "./pages/ResolutionCase";
import ShipperProfile from "./pages/ShipperProfile";
import CarrierProfile from "./pages/CarrierProfile";
import AdminUsers from "./pages/AdminUsers";
import OffersShipper from "./pages/OffersShipper";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DemoModeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <DemoModeBadge />
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/for-shippers" element={<ForShippers />} />
            <Route path="/for-carriers" element={<ForCarriers />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/routes" element={<BrowseRoutes />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/payments" element={<HowPaymentsWork />} />
            <Route path="/research" element={<Research />} />
            {/* Public route details */}
            <Route path="/routes/:id" element={<RouteDetails />} />
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
            <Route path="/dashboard/shipper/verify" element={
              <ProtectedRoute allowedRoles={['shipper']}>
                <ShipperVerification />
              </ProtectedRoute>
            } />
            <Route path="/load/:id" element={
              <ProtectedRoute>
                <LoadDetails />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/shipper/shipments" element={
              <ProtectedRoute allowedRoles={['shipper']}>
                <ShipperShipments />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/shipper/messages" element={
              <ProtectedRoute allowedRoles={['shipper']}>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/shipper/messages/:shipmentId" element={
              <ProtectedRoute allowedRoles={['shipper']}>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/shipper/requests" element={
              <ProtectedRoute allowedRoles={['shipper']}>
                <ShipperRequests />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/shipper/requests/:requestId" element={
              <ProtectedRoute allowedRoles={['shipper']}>
                <RouteRequestStatus />
              </ProtectedRoute>
            } />
            <Route path="/routes/:routeId/request" element={
              <ProtectedRoute allowedRoles={['shipper']}>
                <RouteRequestForm />
              </ProtectedRoute>
            } />
            <Route path="/routes/:routeId/offer" element={
              <ProtectedRoute allowedRoles={['shipper']}>
                <RouteOfferPage />
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
            <Route path="/dashboard/carrier/messages" element={
              <ProtectedRoute allowedRoles={['carrier']}>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/carrier/messages/:shipmentId" element={
              <ProtectedRoute allowedRoles={['carrier']}>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/carrier/requests" element={
              <ProtectedRoute allowedRoles={['carrier']}>
                <CarrierRequests />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/carrier/requests/:requestId" element={
              <ProtectedRoute allowedRoles={['carrier']}>
                <CarrierRequestDetails />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/carrier/insurance" element={
              <ProtectedRoute allowedRoles={['carrier']}>
                <CarrierInsuranceSetup />
              </ProtectedRoute>
            } />
            {/* Shared Routes */}
            <Route path="/saved-loads" element={
              <ProtectedRoute>
                <SavedLoads />
              </ProtectedRoute>
            } />
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
            <Route path="/resolution" element={
              <ProtectedRoute>
                <Resolution />
              </ProtectedRoute>
            } />
            <Route path="/resolution/:caseId" element={
              <ProtectedRoute>
                <ResolutionCase />
              </ProtectedRoute>
            } />
            <Route path="/profile/shipper/:userId" element={
              <ProtectedRoute>
                <ShipperProfile />
              </ProtectedRoute>
            } />
            <Route path="/profile/carrier/:userId" element={
              <ProtectedRoute>
                <CarrierProfile />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
            <CookieConsent />
          </AuthProvider>
        </BrowserRouter>
      </DemoModeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
