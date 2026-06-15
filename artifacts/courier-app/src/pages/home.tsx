import { useState } from "react";
import { useGetTracking, getGetTrackingQueryKey, useSubmitQuoteRequest } from "@workspace/api-client-react";
import { Search, Package, MapPin, Calendar, Clock, AlertCircle, Plane, CheckCircle2, ShieldCheck, Globe, Headphones, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const statusLabels: Record<string, string> = {
  packed: "Packed",
  shipped: "Shipped",
  dispatched: "Dispatched",
  out_for_delivery: "Out for Delivery",
  held_by_customs: "Held by Customs",
  delivered: "Delivered"
};

const statusColors: Record<string, string> = {
  packed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  dispatched: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  out_for_delivery: "bg-accent/20 text-accent-foreground dark:bg-accent/20 dark:text-accent-foreground",
  held_by_customs: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
};

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const { toast } = useToast();
  const submitQuote = useSubmitQuoteRequest();

  const { data: shipment, isLoading, isError, error } = useGetTracking(trackingNumber, {
    query: {
      enabled: !!trackingNumber,
      queryKey: getGetTrackingQueryKey(trackingNumber),
      retry: false
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  function onSubmitContact(values: z.infer<typeof formSchema>) {
    submitQuote.mutate({ data: values }, {
      onSuccess: () => {
        toast({
          title: "Request Submitted",
          description: "We've received your inquiry and will contact you soon.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to submit request. Please try again later.",
        });
      }
    });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setTrackingNumber(searchValue.trim());
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground pt-12 pb-24 md:pt-20 md:pb-32 relative overflow-hidden flex flex-col justify-center transition-all duration-500">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          
          <div className={`grid grid-cols-1 ${trackingNumber ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-12 items-center transition-all duration-500`}>
            
            <div className={`space-y-8 ${trackingNumber ? 'max-w-3xl mx-auto text-center' : ''}`}>
              {!trackingNumber && (
                <div className="inline-flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full border border-primary-foreground/20">
                  <Plane className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Worldwide Shipping Available</span>
                </div>
              )}
              
              <h1 className={`font-bold tracking-tight leading-tight ${trackingNumber ? 'text-4xl md:text-5xl' : 'text-5xl md:text-7xl'}`}>
                Ship Anywhere.<br />
                <span className="text-accent">Track Everything.</span>
              </h1>
              
              {!trackingNumber && (
                <p className="text-lg md:text-xl text-primary-foreground/80 max-w-lg leading-relaxed">
                  Fast, reliable, and secure logistics solutions for businesses and individuals. Experience real-time visibility from pickup to delivery.
                </p>
              )}
              
              <form onSubmit={handleSearch} className={`flex shadow-2xl rounded-lg overflow-hidden ${trackingNumber ? 'max-w-xl mx-auto' : 'max-w-lg'}`}>
                <div className="relative flex-1 bg-white">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input 
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Enter your tracking number" 
                    className="h-16 pl-12 rounded-none rounded-l-lg border-0 focus-visible:ring-0 text-lg bg-transparent text-foreground placeholder:text-muted-foreground shadow-none"
                  />
                </div>
                <Button type="submit" size="lg" className="h-16 rounded-none rounded-r-lg px-8 text-lg bg-accent hover:bg-accent/90 text-primary font-bold transition-colors">
                  Track
                </Button>
              </form>
            </div>
            
            {!trackingNumber && (
              <div className="hidden md:block relative h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl opacity-50 translate-x-10 translate-y-10"></div>
                <img 
                  src="/courier-hero.png" 
                  alt="Professional courier delivery" 
                  className="absolute inset-0 w-full h-full object-contain object-bottom drop-shadow-2xl z-10"
                />
              </div>
            )}
            
          </div>
        </div>
      </section>

      {/* Tracking Results Inline */}
      {trackingNumber && (
        <section className="py-12 bg-muted/50 border-t border-border -mt-8 relative z-20 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="container mx-auto max-w-4xl px-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                <p className="text-muted-foreground font-medium text-lg">Locating your shipment...</p>
              </div>
            )}

            {isError && (
              <div className="bg-white border-l-4 border-destructive p-8 rounded-lg shadow-sm flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Shipment Not Found</h3>
                  <p className="text-muted-foreground text-lg">We couldn't find a shipment with tracking number "<span className="font-semibold text-foreground">{trackingNumber}</span>". Please check the number and try again.</p>
                </div>
              </div>
            )}

            {shipment && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="bg-white pb-6 border-b">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-accent/10 p-2 rounded-md text-accent">
                            <Package className="h-6 w-6" />
                          </div>
                          <CardTitle className="text-3xl font-bold text-primary">
                            {shipment.trackingNumber}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-base text-muted-foreground font-medium">
                          Recipient: <span className="text-foreground">{shipment.recipientName}</span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Status</span>
                        <Badge className={`text-sm px-4 py-1.5 rounded-full font-bold shadow-sm ${shipment.events?.[0] ? statusColors[shipment.events[0].status] : 'bg-gray-100 text-gray-800'}`}>
                          {shipment.events?.[0] ? statusLabels[shipment.events[0].status] : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="bg-muted/30 p-6 md:p-8 border-b">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-border/50">
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Origin</p>
                          <p className="text-lg font-bold text-primary flex items-start gap-2">
                            <MapPin className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                            {shipment.origin || "Unknown"}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-border/50">
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Destination</p>
                          <p className="text-lg font-bold text-primary flex items-start gap-2">
                            <MapPin className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                            {shipment.destination || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 md:p-8 bg-white">
                      <h3 className="font-bold text-xl mb-8 text-primary">Tracking History</h3>
                      
                      {!shipment.events || shipment.events.length === 0 ? (
                        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                          <p className="text-muted-foreground italic text-lg">No tracking events recorded yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.125rem] md:before:ml-[1.125rem] before:h-full before:w-0.5 before:bg-border">
                          {[...shipment.events].reverse().map((event, i) => {
                            const isLatest = i === 0;
                            return (
                              <div key={event.id} className="relative flex items-start gap-6 group">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${isLatest ? 'bg-accent text-primary' : 'bg-primary text-white'} shadow-md shrink-0 z-10`}>
                                  {isLatest ? <Check className="h-5 w-5" strokeWidth={3} /> : <div className="h-2 w-2 rounded-full bg-white" />}
                                </div>
                                
                                <div className={`flex-1 pt-1 ${isLatest ? '' : 'opacity-70 group-hover:opacity-100 transition-opacity'}`}>
                                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                                    <span className={`text-lg font-bold ${isLatest ? 'text-primary' : 'text-foreground'}`}>
                                      {statusLabels[event.status]}
                                    </span>
                                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full w-fit">
                                      <Clock className="h-4 w-4" />
                                      {format(new Date(event.timestamp), "MMM d, yyyy • HH:mm")}
                                    </span>
                                  </div>
                                  
                                  {event.location && (
                                    <p className="text-base font-medium flex items-center gap-1.5 text-muted-foreground mb-2">
                                      <MapPin className="h-4 w-4 text-primary/60" /> {event.location}
                                    </p>
                                  )}
                                  
                                  {event.note && (
                                    <div className="mt-3 p-3 bg-muted/40 border rounded-md text-sm text-foreground/80">
                                      {event.note}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Info Sections - only show when not tracking */}
      {!trackingNumber && (
        <>
          {/* Stats Bar */}
          <section className="py-12 bg-white border-b border-border shadow-sm relative z-20">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50 text-center">
                <div className="space-y-2">
                  <h4 className="text-4xl md:text-5xl font-extrabold text-accent">200+</h4>
                  <p className="text-sm md:text-base font-semibold text-primary uppercase tracking-wider">Countries Served</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-4xl md:text-5xl font-extrabold text-accent">10M+</h4>
                  <p className="text-sm md:text-base font-semibold text-primary uppercase tracking-wider">Packages Delivered</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-4xl md:text-5xl font-extrabold text-accent">99.9%</h4>
                  <p className="text-sm md:text-base font-semibold text-primary uppercase tracking-wider">On-Time Rate</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-4xl md:text-5xl font-extrabold text-accent">24/7</h4>
                  <p className="text-sm md:text-base font-semibold text-primary uppercase tracking-wider">Live Support</p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Shipvora? */}
          <section className="py-24 bg-muted">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Why Shipvora?</h2>
                <p className="text-lg text-muted-foreground">
                  We combine global reach with local expertise to deliver your packages safely, securely, and on time.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { icon: Globe, title: "Global Coverage", desc: "Shipping to over 200 countries with seamless customs clearance." },
                  { icon: MapPin, title: "Real-Time Tracking", desc: "Pinpoint accuracy and live updates from origin to destination." },
                  { icon: ShieldCheck, title: "Fully Insured", desc: "Comprehensive protection for your valuable shipments." },
                  { icon: Headphones, title: "24/7 Support", desc: "Round-the-clock customer service ready to assist you." }
                ].map((feature, i) => (
                  <Card key={i} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="h-12 w-12 bg-primary/5 rounded-xl flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl text-primary">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">How It Works</h2>
                <p className="text-lg text-muted-foreground">
                  Four simple steps to get your package from A to B with complete peace of mind.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
                <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-muted-foreground/20 z-0"></div>
                
                {[
                  { step: "01", title: "Book a Shipment", desc: "Enter your details and get an instant quote." },
                  { step: "02", title: "We Pick It Up", desc: "Our courier collects from your doorstep." },
                  { step: "03", title: "Track in Real Time", desc: "Follow your package every step of the way." },
                  { step: "04", title: "Delivered!", desc: "Safe arrival with proof of delivery." }
                ].map((item, i) => (
                  <div key={i} className="relative z-10 text-center flex flex-col items-center group">
                    <div className="bg-white px-4 mb-4">
                      <span className="text-6xl font-black text-accent/20 group-hover:text-accent transition-colors duration-500">{item.step}</span>
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonial */}
          <section className="py-24 bg-muted border-y border-border">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <div className="text-accent mb-8 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-2xl md:text-4xl font-medium text-primary leading-tight mb-8">
                "Shipvora completely transformed our international logistics. A vital package from Dubai to Sydney arrived two days early, and we tracked it the entire way."
              </blockquote>
              <div className="font-bold text-lg text-primary">Emma J.</div>
              <div className="text-muted-foreground">Operations Director, GlobalTech</div>
            </div>
          </section>

          {/* Contact / CTA */}
          <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="container mx-auto px-4 max-w-6xl relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                    Ready to Ship? <br />
                    <span className="text-accent">Let's Talk.</span>
                  </h2>
                  <p className="text-lg text-primary-foreground/80 leading-relaxed">
                    Get a custom quote for your business or personal shipping needs. Our logistics experts are standing by to help.
                  </p>
                  <ul className="space-y-4 pt-4">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-accent" />
                      <span className="text-lg">Competitive global rates</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-accent" />
                      <span className="text-lg">Dedicated account managers</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-accent" />
                      <span className="text-lg">Flexible enterprise API</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-2xl text-foreground">
                  <h3 className="text-2xl font-bold text-primary mb-6">Request a Quote</h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitContact)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-primary font-bold">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" className="bg-muted/50 border-border h-12" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-primary font-bold">Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="john@company.com" className="bg-muted/50 border-border h-12" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-primary font-bold">Shipment Details</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about what you're shipping..." 
                                className="min-h-[120px] bg-muted/50 border-border resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-primary transition-colors" disabled={submitQuote.isPending}>
                        {submitQuote.isPending ? "Submitting..." : "Get Quote"}
                      </Button>
                    </form>
                  </Form>
                </div>

              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}