import { useListQuoteRequests, getListQuoteRequestsQueryKey, useMarkQuoteRequestRead, useDeleteQuoteRequest } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Mail, Check, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function Inbox() {
  const { data: quotes, isLoading } = useListQuoteRequests({
    query: {
      queryKey: getListQuoteRequestsQueryKey()
    }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const markRead = useMarkQuoteRequestRead();
  const deleteQuote = useDeleteQuoteRequest();

  const handleToggleRead = (id: number, currentReadStatus: boolean) => {
    markRead.mutate({ id, data: { isRead: !currentReadStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListQuoteRequestsQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteQuote.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Quote request deleted" });
        queryClient.invalidateQueries({ queryKey: getListQuoteRequestsQueryKey() });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quote Requests</h1>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {quotes?.filter(q => !q.isRead).length || 0} Unread
        </Badge>
      </div>

      <div className="grid gap-4">
        {quotes?.length === 0 ? (
          <div className="bg-card border rounded-lg p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
            <Mail className="h-10 w-10 opacity-20" />
            <p>Inbox is empty.</p>
          </div>
        ) : (
          quotes?.map((quote) => (
            <div key={quote.id} className={`bg-card border rounded-lg p-6 shadow-sm transition-colors ${!quote.isRead ? 'border-primary/50 bg-primary/5' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {!quote.isRead && <div className="w-2 h-2 rounded-full bg-primary" />}
                  <div>
                    <h3 className="font-bold text-lg">{quote.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${quote.email}`} className="hover:underline">{quote.email}</a>
                      <span>•</span>
                      {format(new Date(quote.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={quote.isRead ? "outline" : "default"} 
                    size="sm"
                    onClick={() => handleToggleRead(quote.id, quote.isRead)}
                    disabled={markRead.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {quote.isRead ? "Mark Unread" : "Mark Read"}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quote Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this quote request from {quote.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(quote.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="bg-background rounded p-4 text-sm whitespace-pre-wrap border">
                {quote.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
