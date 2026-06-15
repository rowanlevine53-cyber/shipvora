import { useGetShipment, getGetShipmentQueryKey, useUpdateShipment, useDeleteShipment, useAddTrackingEvent, useDeleteTrackingEvent, TrackingEventStatus } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, Package, MapPin, Clock, Plus, Trash2, Edit2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

const statusLabels: Record<string, string> = {
  packed: "Packed",
  shipped: "Shipped",
  dispatched: "Dispatched",
  out_for_delivery: "Out for Delivery",
  held_by_customs: "Held by Customs",
  delivered: "Delivered"
};

const statusColors: Record<string, string> = {
  packed: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  dispatched: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  held_by_customs: "bg-red-100 text-red-800",
  delivered: "bg-green-100 text-green-800"
};

export default function ShipmentDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shipment, isLoading } = useGetShipment(id, {
    query: {
      enabled: !!id,
      queryKey: getGetShipmentQueryKey(id)
    }
  });

  const updateShipment = useUpdateShipment();
  const deleteShipment = useDeleteShipment();
  const addEvent = useAddTrackingEvent();
  const deleteEvent = useDeleteTrackingEvent();

  // Edit Shipment State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    recipientName: "",
    origin: "",
    destination: "",
    description: ""
  });

  useEffect(() => {
    if (shipment) {
      setEditForm({
        recipientName: shipment.recipientName,
        origin: shipment.origin || "",
        destination: shipment.destination || "",
        description: shipment.description || ""
      });
    }
  }, [shipment]);

  const handleSaveShipment = () => {
    updateShipment.mutate({ id, data: editForm }, {
      onSuccess: (data) => {
        toast({ title: "Shipment updated" });
        setIsEditing(false);
        queryClient.setQueryData(getGetShipmentQueryKey(id), (old: any) => 
          old ? { ...old, ...data } : old
        );
      }
    });
  };

  const handleDeleteShipment = () => {
    deleteShipment.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Shipment deleted" });
        setLocation("/admin");
      }
    });
  };

  // Add Event State
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState<{
    status: TrackingEventStatus;
    location: string;
    note: string;
    timestamp: string;
  }>({
    status: "packed" as TrackingEventStatus,
    location: "",
    note: "",
    timestamp: new Date().toISOString().slice(0, 16) // YYYY-MM-DDThh:mm format
  });

  const handleAddEvent = () => {
    addEvent.mutate({ 
      id, 
      data: {
        status: eventForm.status,
        location: eventForm.location || undefined,
        note: eventForm.note || undefined,
        timestamp: new Date(eventForm.timestamp).toISOString()
      }
    }, {
      onSuccess: () => {
        toast({ title: "Event added" });
        setIsEventDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetShipmentQueryKey(id) });
        setEventForm({
          status: "packed" as TrackingEventStatus,
          location: "",
          note: "",
          timestamp: new Date().toISOString().slice(0, 16)
        });
      }
    });
  };

  const handleDeleteEvent = (eventId: number) => {
    deleteEvent.mutate({ id: eventId }, {
      onSuccess: () => {
        toast({ title: "Event deleted" });
        queryClient.invalidateQueries({ queryKey: getGetShipmentQueryKey(id) });
      }
    });
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!shipment) return <div>Shipment not found.</div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="mb-2 -ml-4" onClick={() => setLocation("/admin")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            {shipment.trackingNumber}
          </h1>
          <p className="text-muted-foreground mt-1">Created on {format(new Date(shipment.createdAt), "PPP")}</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" /> Edit Details
            </Button>
          ) : (
            <Button onClick={handleSaveShipment} disabled={updateShipment.isPending}>
              <Save className="mr-2 h-4 w-4" /> Save Details
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Shipment</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this shipment and all its tracking events. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteShipment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Recipient Name</label>
                {isEditing ? (
                  <Input value={editForm.recipientName} onChange={e => setEditForm({...editForm, recipientName: e.target.value})} className="mt-1" />
                ) : (
                  <p className="font-medium mt-1">{shipment.recipientName}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Origin</label>
                  {isEditing ? (
                    <Input value={editForm.origin} onChange={e => setEditForm({...editForm, origin: e.target.value})} className="mt-1" />
                  ) : (
                    <p className="font-medium mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {shipment.origin || "Not specified"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Destination</label>
                  {isEditing ? (
                    <Input value={editForm.destination} onChange={e => setEditForm({...editForm, destination: e.target.value})} className="mt-1" />
                  ) : (
                    <p className="font-medium mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {shipment.destination || "Not specified"}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                {isEditing ? (
                  <Textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="mt-1" />
                ) : (
                  <p className="mt-1">{shipment.description || <span className="italic text-muted-foreground">No description provided</span>}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tracking Timeline</CardTitle>
              <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Tracking Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select value={eventForm.status} onValueChange={(v: TrackingEventStatus) => setEventForm({...eventForm, status: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([val, label]) => (
                            <SelectItem key={val} value={val}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <Input value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} placeholder="e.g. Sort Facility, Chicago" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date & Time</label>
                      <Input type="datetime-local" value={eventForm.timestamp} onChange={e => setEventForm({...eventForm, timestamp: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Note (Optional)</label>
                      <Textarea value={eventForm.note} onChange={e => setEventForm({...eventForm, note: e.target.value})} placeholder="e.g. Delayed due to weather" />
                    </div>

                    <Button onClick={handleAddEvent} className="w-full" disabled={addEvent.isPending}>
                      {addEvent.isPending ? "Adding..." : "Add Event"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {!shipment.events || shipment.events.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                  <p>No tracking events recorded yet.</p>
                  <Button variant="link" onClick={() => setIsEventDialogOpen(true)}>Add the first event</Button>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {[...shipment.events].reverse().map((event, i) => (
                    <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-2 md:ml-0"></div>
                      
                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteEvent(event.id)}
                          title="Delete Event"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-2 mb-2 pr-6">
                          <Badge className={statusColors[event.status]} variant="outline">{statusLabels[event.status]}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                            <Clock className="h-3 w-3" />
                            {format(new Date(event.timestamp), "MMM d, yyyy HH:mm")}
                          </span>
                        </div>
                        {event.location && (
                          <p className="text-sm font-medium flex items-center gap-1 mt-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" /> {event.location}
                          </p>
                        )}
                        {event.note && (
                          <p className="text-sm mt-2 text-muted-foreground bg-muted/50 p-2 rounded">{event.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
