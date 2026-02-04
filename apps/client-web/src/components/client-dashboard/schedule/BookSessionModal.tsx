// import { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogTitle,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';
// import { Calendar } from '@/components/ui/calendar';
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from '@/components/ui/select';
// import { Button } from '@/components/ui/button';


// import { kidsService } from '@/services/kids.service';
// import { sessionsService } from '@/services/sessions.service';

// import type {
//   BookSessionData,
//   AvailabilityData,
//   TimeSlot,
// } from '@/types/session-booking';
// import { useApiQuery } from '@/hooks/useApiQuery';
// import { useApiMutation } from '@/hooks/useApiMutation';

// interface BookSessionModalProps {
//   open: boolean;
//   onClose: () => void;
//   onConfirm: (data: BookSessionData) => void;
//   kidId: string;
//   clientId: string;
// }

// export default function BookSessionModal({
//   open,
//   onClose,
//   onConfirm,
//   kidId,
//   clientId,
// }: BookSessionModalProps) {
//   /* ------------------------------------------------------------------
//    * Local state
//    * ------------------------------------------------------------------ */
//   const [date, setDate] = useState<Date | undefined>();
//   const [time, setTime] = useState('');
//   const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
//   const [location, setLocation] = useState<string>();

//   const type = 'personal_training';

//   /* ------------------------------------------------------------------
//    * Kid → Coach
//    * ------------------------------------------------------------------ */
//   const { data: kidData } = useApiQuery(['kid', kidId], () =>
//     kidsService.getKidById(kidId)
//   );

//   const coachId =
//     (kidData?.data as any)?.coach?.id ||
//     (kidData?.data as any)?.coachId;

//   const coachName =
//     (kidData?.data as any)?.coach?.name ||
//     (kidData?.data as any)?.coachName;

//   /* ------------------------------------------------------------------
//    * Availability
//    * ------------------------------------------------------------------ */
//   const { data: availabilityResp, isLoading: fetchingAvailability } =
//     useApiQuery(
//       ['availability', coachId, location],
//       () =>
//         sessionsService.checkAvailability({
//           coachId,
//           location,
//         }),
//       {
//         enabled: !!coachId && !!location,
//       }
//     );

//   const availability: AvailabilityData | null =
//     (availabilityResp?.data as AvailabilityData) ?? null;

//   /* ------------------------------------------------------------------
//    * Create session
//    * ------------------------------------------------------------------ */
//   const createSessionMutation = useApiMutation(
//     (payload: any) => sessionsService.createSession(payload)
//   );

//   /* ------------------------------------------------------------------
//    * Effects
//    * ------------------------------------------------------------------ */
//   useEffect(() => {
//     setDate(undefined);
//     setTime('');
//     setTimeSlots([]);
//   }, [coachId, location]);

//   useEffect(() => {
//     if (!date || !availability) return;

//     const selected = availability.available_dates.find(
//       d => new Date(d.date).toDateString() === date.toDateString()
//     );

//     setTimeSlots(selected?.time_slots.filter(t => t.available) || []);
//     setTime('');
//   }, [date, availability]);

//   /* ------------------------------------------------------------------
//    * Helpers
//    * ------------------------------------------------------------------ */
//   const isDateAvailable = (d: Date) =>
//     !!availability?.available_dates.find(
//       a => new Date(a.date).toDateString() === d.toDateString()
//     );

//   /* ------------------------------------------------------------------
//    * Confirm
//    * ------------------------------------------------------------------ */
//   const handleConfirm = async () => {
//     if (!coachId || !kidId || !clientId || !date || !time || !location) return;

//     const [hh, mm] = time.split(':').map(Number);
//     const startsAt = new Date(date);
//     startsAt.setHours(hh, mm ?? 0, 0, 0);
//     const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

//     // optimistic remove
//     const prevSlots = timeSlots;
//     setTimeSlots(slots => slots.filter(s => s.time !== time));

//     try {
//       await createSessionMutation.mutateAsync({
//         coachId,
//         clientId,
//         kidId,
//         location,
//         sessionType: 'Personal Training',
//         startsAt: startsAt.toISOString(),
//         endsAt: endsAt.toISOString(),
//       });

//       onConfirm({ coach: coachId, type, date, time });
//       setTime('');
//       onClose();
//     } catch (e) {
//       console.error(e);
//       setTimeSlots(prevSlots);
//     }
//   };

//   /* ------------------------------------------------------------------
//    * Render
//    * ------------------------------------------------------------------ */
//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-xl p-0 flex flex-col">
//         {/* Header */}
//         <div className="border-b px-6 py-4 flex justify-between">
//           <div>
//             <DialogTitle className="text-xl font-semibold">
//               Book a Session
//             </DialogTitle>
//             <DialogDescription>
//               Choose your preferences to reserve a spot
//             </DialogDescription>
//           </div>
//           <Button variant="ghost" size="sm" onClick={onClose}>
//             ✕
//           </Button>
//         </div>

//         {/* Body */}
//         <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
//           {/* Coach */}
//           <div>
//             <Label>Coach</Label>
//             <div className="h-11 border rounded-md flex items-center px-3 bg-muted">
//               {coachName || 'No coach assigned'}
//             </div>
//           </div>

//           {/* Session Type */}
//           <div>
//             <Label>Session Type</Label>
//             <div className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary">
//               Personal Training
//             </div>
//           </div>

//           {/* Location */}
//           <div>
//             <Label>Location</Label>
//             <Select value={location} onValueChange={setLocation}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select location" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="Kirulapana">Kirulapana</SelectItem>
//                 <SelectItem value="Kollupitiya">Kollupitiya</SelectItem>
//               </SelectContent>
//             </Select>
//             {fetchingAvailability && (
//               <p className="text-xs text-muted-foreground mt-1">
//                 Loading availability…
//               </p>
//             )}
//           </div>

//           {/* Date */}
//           <div>
//             <Label>Date</Label>
//             <Calendar
//               mode="single"
//               selected={date}
//               onSelect={d => d && location && isDateAvailable(d) && setDate(d)}
//               disabled={d => !location || !isDateAvailable(d)}
//             />
//           </div>

//           {/* Time */}
//           <div>
//             <Label>Time Slot</Label>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//               {timeSlots.map(slot => (
//                 <Button
//                   key={slot.id}
//                   variant={time === slot.time ? 'default' : 'outline'}
//                   onClick={() => setTime(slot.time)}
//                 >
//                   {slot.time}
//                 </Button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <DialogFooter className="border-t px-6 py-4">
//           <Button variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button
//             disabled={
//               !coachId ||
//               !date ||
//               !time ||
//               !location ||
//               createSessionMutation.isLoading
//             }
//             onClick={handleConfirm}
//           >
//             Confirm Booking
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

export default function BookSessionModal() {
  return <div>BookSessionModal</div>;
}