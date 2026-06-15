import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubmitQuoteRequest } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function Contact() {
  const { toast } = useToast();
  const submitQuote = useSubmitQuoteRequest();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
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

  return (
    <div className="flex flex-col flex-1">
      <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/4"></div>
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Contact <span className="text-accent">Us</span></h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
            Need a custom quote for freight or business logistics? Get in touch with our commercial team.
          </p>
        </div>
      </section>

      <section className="py-16 bg-muted/30 flex-1">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            <div className="space-y-10">
              <div className="flex items-start gap-6 bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-accent/10 p-4 rounded-full">
                  <MapPin className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-primary mb-2">Headquarters</h3>
                  <p className="text-muted-foreground text-lg">3 Link Road<br />Parkland<br />Cape Town, South Africa 7441</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-accent/10 p-4 rounded-full">
                  <Mail className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-primary mb-2">Email Us</h3>
                  <p className="text-muted-foreground text-lg">info@shipvora.org<br />sales@shipvora.org</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-accent/10 p-4 rounded-full">
                  <Phone className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-primary mb-2">Call Us</h3>
                  <p className="text-muted-foreground text-lg">+27 (012) 300 0187<br />Mon-Fri 8am-6pm SAST</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border rounded-xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-primary mb-8">Request a Quote</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-primary">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" className="bg-muted/50 h-12" {...field} />
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
                        <FormLabel className="font-bold text-primary">Work Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@company.com" className="bg-muted/50 h-12" {...field} />
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
                        <FormLabel className="font-bold text-primary">Shipment Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about what you're shipping, origins, and destinations..." 
                            className="min-h-[160px] bg-muted/50 resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-primary transition-colors mt-4" disabled={submitQuote.isPending}>
                    {submitQuote.isPending ? "Submitting..." : "Send Request"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}