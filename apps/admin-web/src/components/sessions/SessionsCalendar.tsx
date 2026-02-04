import { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Session, SessionStatus } from '@grow-fitness/shared-types';
import { useApiQuery, useApiMutation } from '@/hooks';
import { sessionsService } from '@/services/sessions.service';
import { formatSessionType } from '@/lib/formatters';
import { useToast } from '@/hooks/useToast';
import { Loader2 } from 'lucide-react';

interface SessionsCalendarProps {
  onSessionClick: (session: Session) => void;
  coachId?: string;
  locationId?: string;
  status?: SessionStatus | '';
}

export function SessionsCalendar({
  onSessionClick,
  coachId,
  locationId,
  status,
}: SessionsCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  const { data, isLoading, refetch } = useApiQuery(
    ['sessions', 'calendar', coachId || 'all', locationId || 'all', status || 'all', dateRange?.start || 'all', dateRange?.end || 'all'],
    () =>
      sessionsService.getSessions(1, 100, {
        coachId: coachId || undefined,
        locationId: locationId || undefined,
        status: (status as SessionStatus) || undefined,
        startDate: dateRange?.start,
        endDate: dateRange?.end,
      }),
    {
      enabled: !!dateRange,
      refetchOnWindowFocus: false,
    }
  );

  const updateSessionMutation = useApiMutation(
    ({ id, data }: { id: string; data: any }) => sessionsService.updateSession(id, data),
    {
      onSuccess: () => {
        toast.success('Session updated successfully');
        refetch();
      },
      onError: (error) => {
        toast.error('Failed to update session', error.message);
        refetch();
      },
    }
  );

  const events = (data?.data || []).map((session) => {
    const start = new Date(session.dateTime);
    const end = new Date(start.getTime() + session.duration * 60000);
    
    // Determine coach name
    let coachName = 'Session';
    if (session.coachId && typeof session.coachId === 'object') {
      coachName = (session.coachId as any).coachProfile?.name || (session.coachId as any).email || (session.coachId as any).firstName || 'Coach';
    }

    return {
      id: session.id,
      title: `${formatSessionType(session.type)} - ${coachName}`,
      start: start.toISOString(),
      end: end.toISOString(),
      extendedProps: session,
      backgroundColor: getStatusColor(session.status),
      borderColor: getStatusColor(session.status),
      className: 'cursor-pointer hover:opacity-80 transition-opacity',
    };
  });

  function getStatusColor(status: SessionStatus) {
    switch (status) {
      case SessionStatus.SCHEDULED:
        return '#1a73e8'; // Google Blue
      case SessionStatus.CONFIRMED:
        return '#10b981'; // green-500
      case SessionStatus.CANCELLED:
        return '#ef4444'; // red-500
      case SessionStatus.COMPLETED:
        return '#70757a'; // gray
      default:
        return '#1a73e8';
    }
  }

  const handleEventClick = (info: any) => {
    onSessionClick(info.event.extendedProps);
  };

  const handleEventDrop = (info: any) => {
    const { event } = info;
    const sessionId = event.id;
    const newStart = event.start;
    const duration = (event.end.getTime() - event.start.getTime()) / 60000;

    updateSessionMutation.mutate({
      id: sessionId,
      data: {
        dateTime: newStart.toISOString(),
        duration: Math.round(duration),
      },
    });
  };

  const handleEventResize = (info: any) => {
    const { event } = info;
    const sessionId = event.id;
    const duration = (event.end.getTime() - event.start.getTime()) / 60000;

    updateSessionMutation.mutate({
      id: sessionId,
      data: {
        duration: Math.round(duration),
      },
    });
  };

  const handleDatesSet = (dateInfo: any) => {
    setDateRange({
      start: dateInfo.startStr,
      end: dateInfo.endStr,
    });
  };

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm calendar-container text-[#3c4043] relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a73e8]" />
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .fc {
          --fc-button-bg-color: #fff;
          --fc-button-border-color: #dadce0;
          --fc-button-hover-bg-color: #f1f3f4;
          --fc-button-hover-border-color: #dadce0;
          --fc-button-active-bg-color: #e8f0fe;
          --fc-button-active-border-color: #dadce0;
          --fc-button-text-color: #3c4043;
          --fc-border-color: #e8eaed;
          --fc-today-bg-color: transparent;
          --fc-now-indicator-color: #ea4335;
          font-family: 'Google Sans', Roboto, Arial, sans-serif;
        }
        .fc .fc-toolbar-title {
          font-size: 1.375rem;
          font-weight: 400;
          color: #3c4043;
        }
        .fc .fc-button {
          height: 36px;
          padding: 0 12px;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 4px;
          box-shadow: none;
          text-transform: capitalize;
        }
        .fc .fc-button-primary:not(:disabled):active, 
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          color: #1a73e8;
          background-color: #e8f0fe;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #e8eaed;
        }
        .fc-col-header-cell {
          padding: 12px 0 !important;
        }
        .fc-col-header-cell-cushion {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: #70757a;
          font-size: 0.7rem;
          font-weight: 500;
          text-decoration: none !important;
        }
        .fc-day-today .fc-col-header-cell-cushion {
          color: #1a73e8;
        }
        .day-name {
          text-transform: uppercase;
        }
        .day-number {
          font-size: 1.5rem;
          font-weight: 400;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .fc-day-today .day-number {
          background-color: #1a73e8;
          color: white;
        }
        .fc-timegrid-slot {
          height: 48px !important;
        }
        .fc-timegrid-slot-label-cushion {
          font-size: 0.625rem;
          color: #70757a;
          text-transform: uppercase;
        }
        .fc-event {
          border-radius: 4px !important;
          border: none !important;
          padding: 2px 4px !important;
          box-shadow: 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);
        }
        .fc-v-event .fc-event-main-frame {
          padding: 2px 0;
        }
        .fc-event-title {
          font-weight: 500 !important;
          font-size: 0.75rem !important;
        }
        .fc-event-time {
          font-size: 0.7rem !important;
          font-weight: 400 !important;
          opacity: 0.9;
        }
        .fc-now-indicator-arrow {
          border-width: 5px 0 5px 6px;
          border-top-color: transparent;
          border-bottom-color: transparent;
          left: -1px;
        }
      `}} />
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        height="700px"
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        datesSet={handleDatesSet}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        nowIndicator={true}
        scrollTime={new Date().getHours() + ':00:00'}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          omitZeroMinute: true,
          meridiem: 'narrow'
        }}
        dayHeaderContent={(arg) => {
          return (
            <div className="fc-col-header-cell-cushion">
              <span className="day-name">{arg.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className="day-number">{arg.date.getDate()}</span>
            </div>
          );
        }}
      />
    </div>
  );
}
