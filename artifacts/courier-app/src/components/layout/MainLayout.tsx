import { Link, useLocation } from "wouter";
import { Package } from "lucide-react";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-20 items-center mx-auto px-4 max-w-6xl">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-primary">
            <Package className="h-8 w-8 text-primary" strokeWidth={2.5} />
            <span>Shipvora</span>
          </Link>
          <nav className="ml-auto flex items-center gap-8">
            <Link 
              href="/" 
              className={`text-sm font-semibold transition-colors hover:text-accent ${location === "/" ? "text-primary" : "text-muted-foreground"}`}
            >
              Track
            </Link>
            <Link 
              href="/contact" 
              className={`text-sm font-semibold transition-colors hover:text-accent ${location === "/contact" ? "text-primary" : "text-muted-foreground"}`}
            >
              Contact Us
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-white mb-6">
                <Package className="h-8 w-8 text-white" strokeWidth={2.5} />
                <span>Shipvora</span>
              </div>
              <p className="text-primary-foreground/70 max-w-xs">
                Global shipping and logistics solutions you can rely on. Fast, secure, and fully trackable.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Quick Links</h3>
              <nav className="flex flex-col gap-4 text-primary-foreground/80">
                <Link href="/" className="hover:text-accent transition-colors w-fit">Track a Shipment</Link>
                <Link href="/contact" className="hover:text-accent transition-colors w-fit">Get a Quote</Link>
                <Link href="/admin/login" className="hover:text-accent transition-colors w-fit">Staff Login</Link>
              </nav>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Contact Us</h3>
              <div className="flex flex-col gap-4 text-primary-foreground/80">
                <p>info@shipvora.org</p>
                <p>+27 (012) 300 0187</p>
                <p className="max-w-[200px]">3 Link Road, Parkland, Cape Town, South Africa 7441</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/60">
              &copy; {new Date().getFullYear()} Shipvora Logistics. All rights reserved.
            </p>
            <nav className="flex gap-6 text-sm text-primary-foreground/60">
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}