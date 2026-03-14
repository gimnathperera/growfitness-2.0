import { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Session } from '@grow-fitness/shared-types';
import type { EventInput } from '@fullcalendar/core';
import { CALENDAR_STYLES } from './calendarStyles';

export interface SessionsCalendarProps {
  /** FullCalendar event objects. extendedProps should be Session. */
  events: EventInput[];
  onSessionClick: (session: Session) => void;
  /** Called when the calendar view or date range changes (e.g. for refetching). */
  onDatesSet?: (start: string, end: string) => void;
  loading?: boolean;
  /** Allow drag-and-drop and resize. When true, onEventDrop and onEventResize are required. */
  editable?: boolean;
  onEventDrop?: (sessionId: string, newStart: Date, durationMinutes: number) => void;
  onEventResize?: (sessionId: string, durationMinutes: number) => void;
  /** Calendar height. Default "700px". */
  height?: string;
}

export function SessionsCalendar({
  events,
  onSessionClick,
  onDatesSet,
  loading = false,
  editable = false,
  onEventDrop,
  onEventResize,
  height = '700px',
}: SessionsCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);

  const handleEventClick = (info: { event: { extendedProps: unknown } }) => {
    onSessionClick(info.event.extendedProps as Session);
  };

  const handleEventDrop = (info: {
    event: { id: string; start: Date | null; end: Date | null };
  }) => {
    const { event } = info;
    if (!event.start || !event.end || !editable || !onEventDrop) return;
    const durationMinutes = (event.end.getTime() - event.start.getTime()) / 60000;
    onEventDrop(event.id, event.start, Math.round(durationMinutes));
  };

  const handleEventResize = (info: {
    event: { id: string; end: Date | null; start: Date | null };
  }) => {
    const { event } = info;
    if (!event.start || !event.end || !editable || !onEventResize) return;
    const durationMinutes = (event.end.getTime() - event.start.getTime()) / 60000;
    onEventResize(event.id, Math.round(durationMinutes));
  };

  const handleDatesSet = (dateInfo: { startStr: string; endStr: string }) => {
    onDatesSet?.(dateInfo.startStr, dateInfo.endStr);
  };

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm calendar-container text-[#3c4043] relative">
      {loading && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-xl"
          style={{ backdropFilter: 'blur(1px)' }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: '2px solid #e8eaed',
              borderTopColor: '#1a73e8',
              borderRadius: '50%',
              animation: 'schedule-calendar-spin 0.8s linear infinite',
            }}
            aria-hidden
          />
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: CALENDAR_STYLES }} />
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
        editable={editable}
        selectable={editable}
        selectMirror={editable}
        dayMaxEvents={true}
        weekends={true}
        height={height}
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
          meridiem: 'narrow',
        }}
        dayHeaderContent={(arg) => (
          <div className="fc-col-header-cell-cushion">
            <span className="day-name">
              {arg.date.toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
            <span className="day-number">{arg.date.getDate()}</span>
          </div>
        )}
      />
    </div>
  );
}
