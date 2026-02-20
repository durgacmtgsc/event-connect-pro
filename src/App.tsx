import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { AdminRoute } from "@/components/AdminRoute";

// Public Pages
import Index from "./pages/Index";
import BuySlots from "./pages/BuySlots";
import GetInTouch from "./pages/GetInTouch";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminCreateInvitation from "./pages/AdminCreateInvitation";
import AdminCampaigns from "./pages/AdminCampaigns";
import AdminReports from "./pages/AdminReports";
import AdminBookings from "./pages/AdminBookings";
import AdminTestimonials from "./pages/AdminTestimonials";
import AdminUsers from "./pages/AdminUsers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminAuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes - No Login Required */}
            <Route path="/" element={<Index />} />
            <Route path="/buy-slots" element={<BuySlots />} />
            <Route path="/contact" element={<GetInTouch />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Admin Routes - Login Required */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <AdminRoute>
                  <AdminBookings />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/create"
              element={
                <AdminRoute>
                  <AdminCreateInvitation />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/campaigns"
              element={
                <AdminRoute>
                  <AdminCampaigns />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/testimonials"
              element={
                <AdminRoute>
                  <AdminTestimonials />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
