import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { MainLayout } from "@/components/layout/MainLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

import Home from "@/pages/home";
import Contact from "@/pages/contact";
import AdminLogin from "@/pages/admin/login";
import Dashboard from "@/pages/admin/dashboard";
import Inbox from "@/pages/admin/inbox";
import ShipmentDetail from "@/pages/admin/shipment";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/admin/login">
        <AdminLogin />
      </Route>
      
      <Route path="/admin">
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </Route>
      
      <Route path="/admin/inbox">
        <AdminLayout>
          <Inbox />
        </AdminLayout>
      </Route>
      
      <Route path="/admin/shipments/:id">
        <AdminLayout>
          <ShipmentDetail />
        </AdminLayout>
      </Route>

      <Route path="/">
        <MainLayout>
          <Home />
        </MainLayout>
      </Route>

      <Route path="/contact">
        <MainLayout>
          <Contact />
        </MainLayout>
      </Route>

      <Route>
        <MainLayout>
          <NotFound />
        </MainLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
