import { Link, useLocation } from "wouter";
import { useAdminMe, useAdminLogout, getAdminMeQueryKey } from "@workspace/api-client-react";
import { Package, LayoutDashboard, Inbox, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: session, isLoading, isError } = useAdminMe({
    query: {
      queryKey: getAdminMeQueryKey(),
      retry: false
    }
  });

  const logout = useAdminLogout();

  useEffect(() => {
    if (!isLoading && (isError || !session?.loggedIn)) {
      setLocation("/admin/login");
    }
  }, [isLoading, isError, session, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.loggedIn) {
    return null;
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(getAdminMeQueryKey(), null);
        setLocation("/admin/login");
      }
    });
  };

  return (
    <div className="min-h-[100dvh] flex bg-muted/40">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <Package className="h-6 w-6" />
            <span>Shipvora Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === "/admin" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link 
            href="/admin/inbox" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === "/admin/inbox" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"}`}
          >
            <Inbox className="h-4 w-4" />
            Quote Requests
          </Link>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-medium truncate">{session.username}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background flex items-center px-6 md:hidden">
          <Link href="/admin" className="font-bold text-lg text-primary flex items-center gap-2">
            <Package className="h-5 w-5" />
            Shipvora Admin
          </Link>
        </header>
        <div className="flex-1 p-6 overflow-auto">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
