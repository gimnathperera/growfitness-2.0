import { useEffect, useRef, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput, EventContentArg } from '@fullcalendar/core';

export interface SessionsCalendarProps {
  /** FullCalendar event objects. extendedProps should be Session. */
  events: EventInput[];
  onSessionClick: (session: any) => void;
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

// ── Breakpoints ───────────────────────────────────────────────────────────────
const MOBILE_BP = 640;

function useContainerWidth(ref: React.RefObject<HTMLDivElement>) {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    ro.observe(ref.current);
    setWidth(ref.current.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

function getContrastColor(hexColor: string): 'white' | 'black' {
  const color = hexColor.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? 'black' : 'white';
}

function EventContent({ arg }: { arg: EventContentArg }) {
  const session = arg.event.extendedProps as any;
  const isMonth = arg.view.type === 'dayGridMonth';
  const isTime = arg.view.type === 'timeGridWeek' || arg.view.type === 'timeGridDay';

  const coachColor = session?.coachColor || '#23B685';
  const computedContrastColor = getContrastColor(coachColor);
  const dotColor = coachColor;
  const textColor = computedContrastColor;

  const customStyle = {
    backgroundColor: coachColor,
    color: computedContrastColor,
    borderRadius: isMonth ? '3px' : '0 4px 4px 0',
    borderLeft: isTime ? `3px solid ${computedContrastColor === 'white' ? '#ffffff80' : '#00000080'}` : undefined,
    padding: isMonth ? '4px 6px' : '4px 6px',
  };

  return (
    <div 
      className={`fc-custom-event ${isMonth ? 'fc-custom-event--month' : 'fc-custom-event--time'}`}
      style={customStyle}
    >
      <span
        className="fc-custom-dot"
        style={{ 
          backgroundColor: dotColor, 
          flexShrink: 0,
        }}
      />

      <div className="fc-custom-body">
        {isTime && arg.timeText && (
          <span
            className="fc-custom-time"
            style={{ color: textColor }}
          >
            {arg.timeText}
          </span>
        )}

        <div className="fc-custom-title-row">
          <span
            className="fc-custom-title"
            style={{
              color: textColor,
            }}
          >
            {arg.event.title}
          </span>
        </div>
      </div>
    </div>
  );
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
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef as React.RefObject<HTMLDivElement>);

  const isMobile = containerWidth < MOBILE_BP;

  const scrollToNow = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    const hours = Math.max(6, Math.min(21, new Date().getHours()));
    api.scrollToTime(`${String(hours).padStart(2, '0')}:00:00`);
  }, []);

  useEffect(() => {
    const t = setTimeout(scrollToNow, 100);
    return () => clearTimeout(t);
  }, [scrollToNow, isMobile]);

  const handleEventClick = (info: { event: { extendedProps: unknown } }) =>
    onSessionClick(info.event.extendedProps);

  const handleEventDrop = (info: { event: { id: string; start: Date | null; end: Date | null } }) => {
    const { event } = info;
    if (!event.start || !event.end || !editable || !onEventDrop) return;
    onEventDrop(event.id, event.start, Math.round((event.end.getTime() - event.start.getTime()) / 60000));
  };

  const handleEventResize = (info: { event: { id: string; end: Date | null; start: Date | null } }) => {
    const { event } = info;
    if (!event.start || !event.end || !editable || !onEventResize) return;
    onEventResize(event.id, Math.round((event.end.getTime() - event.start.getTime()) / 60000));
  };

  const handleDatesSet = (dateInfo: { startStr: string; endStr: string }) => {
    onDatesSet?.(dateInfo.startStr, dateInfo.endStr);
    setTimeout(scrollToNow, 50);
  };

  const headerToolbar = isMobile
    ? { left: 'prev,next', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }
    : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' };

  const slotLabelFormat = isMobile
    ? { hour: 'numeric' as const, meridiem: 'narrow' as const }
    : { hour: 'numeric' as const, minute: '2-digit' as const, omitZeroMinute: true, meridiem: 'narrow' as const };

  const dayHeaderContent = isMobile
    ? (arg: { date: Date }) => (
      <div className="fc-col-header-cell-cushion fc-col-header-mobile">
        <span className="day-name-short">
          {arg.date.toLocaleDateString('en-US', { weekday: 'narrow' })}
        </span>
      </div>
    )
    : (arg: { date: Date }) => (
      <div className="fc-col-header-cell-cushion">
        <span className="day-name">{arg.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
      </div>
    );

  return (
    <div
      ref={containerRef}
      className="bg-white border rounded-xl p-4 shadow-sm calendar-container text-[#3c4043] relative"
    >
      {loading && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-xl"
          style={{ backdropFilter: 'blur(1px)' }}
        >
          <div
            style={{
              width: 32, height: 32,
              border: '2px solid #e8eaed',
              borderTopColor: '#23B685',
              borderRadius: '50%',
              animation: 'schedule-calendar-spin 0.8s linear infinite',
            }}
            aria-hidden
          />
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
/* ── Strip FC default event chrome ─────────────────────── */
.calendar-container .fc-event {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  cursor: pointer;
}

/* ── Style day names in header ─────────────────────────── */
.calendar-container .fc-col-header-cell-cushion {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
}

.calendar-container .day-name {
  font-size: 13px;
  font-weight: 600;
  color: #3c4043;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.calendar-container .fc-event-main {
  padding: 0 !important;
  height: 100%;
}
.calendar-container .fc-daygrid-event-dot {
  display: none !important;
}
.calendar-container .fc-event-time {
  display: none !important;
}

/* ── Shared event wrapper ────────────────────────────────── */
.fc-custom-event {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

/* Month: allow wrapping */
.fc-custom-event--month {
  padding: 4px 6px;
  align-items: flex-start;
  flex-wrap: wrap;
}

/* Week/Day: card with subtle bg */
.fc-custom-event--time {
  padding: 4px 6px;
  height: 100%;
  background-color: #f0fdf8;
  border-left: 3px solid #23B685;
  border-radius: 0 4px 4px 0;
}

/* ── Dot ─────────────────────────────────────────────────── */
.fc-custom-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-top: 3px;
  flex-shrink: 0;
}
.fc-custom-event--month .fc-custom-dot {
  margin-top: 2px;
}

/* ── Body ────────────────────────────────────────────────── */
.fc-custom-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

/* ── Time (week/day only) ────────────────────────────────── */
.fc-custom-time {
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  line-height: 1.3;
}

/* ── Title row ───────────────────────────────────────────── */
.fc-custom-title-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  flex-wrap: wrap;
  min-width: 0;
  width: 100%;
}
.fc-custom-title {
  font-size: 12px;
  font-weight: 500;
  white-space: normal;
  word-break: break-word;
  overflow: visible;
  line-height: 1.3;
  flex: 1;
}

/* ── Mobile overrides ───────────────────────────────────── */
@media (max-width: 639px) {
  .calendar-container {
    padding: 8px !important;
    border-radius: 12px !important;
  }
  .calendar-container .fc-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 4px;
    justify-content: space-between;
    align-items: center;
  }
  .calendar-container .fc-toolbar-title {
    font-size: 14px !important;
    font-weight: 600;
    white-space: nowrap;
  }
  .calendar-container .fc-toolbar-chunk:last-child {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 4px;
  }
  .calendar-container .fc-button {
    padding: 4px 10px !important;
    font-size: 12px !important;
    min-width: 0;
  }
  .calendar-container .fc-timegrid-slot-label {
    font-size: 10px !important;
    padding: 0 4px !important;
    white-space: nowrap;
  }
  .calendar-container .fc-timegrid-slot {
    height: 40px !important;
  }
  .fc-col-header-mobile {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.2;
    padding: 4px 2px;
  }
  .day-name-short {
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    color: #70757a;
  }
  .calendar-container .fc-scroller {
    overflow-x: hidden !important;
  }

  /* ── MOBILE MONTH VIEW - Allow wrapping and vertical display ── */
  .calendar-container .fc-daygrid-day-cell {
    height: auto !important;
    vertical-align: top;
    padding: 4px 2px !important;
  }
  .calendar-container .fc-daygrid-day-frame {
    min-height: 80px !important;
  }
  .calendar-container .fc-daygrid-day-events {
    flex-direction: column;
    gap: 4px;
  }
  .fc-custom-event--month {
    flex-direction: column;
    padding: 6px 4px;
    gap: 3px;
  }
  .fc-custom-event--month .fc-custom-title {
    font-size: 11px;
    white-space: normal;
    word-break: break-word;
    line-height: 1.2;
  }
  .fc-custom-event--month .fc-custom-dot {
    align-self: flex-start;
    margin-top: 2px;
  }

  /* ── MOBILE WEEKLY/DAY VIEW - Improve readability ── */
  .calendar-container .fc-timegrid-event {
    margin: 1px !important;
  }
  .fc-custom-event--time {
    flex-direction: column !important;
    align-items: flex-start !important;
    padding: 4px 6px !important;
    min-height: auto !important;
  }
  .fc-custom-event--time .fc-custom-dot {
    display: none !important;
  }
  .fc-custom-event--time .fc-custom-body {
    width: 100% !important;
  }
  .fc-custom-event--time .fc-custom-time {
    font-size: 10px !important;
    font-weight: 600 !important;
    margin-bottom: 2px !important;
    line-height: 1.2 !important;
  }
  .fc-custom-event--time .fc-custom-title {
    font-size: 11px !important;
    font-weight: 500 !important;
    line-height: 1.3 !important;
    white-space: normal !important;
    word-break: break-word !important;
    overflow: visible !important;
  }

  /* ── MOBILE WEEKLY/DAY VIEW - Improve readability ── */
  .calendar-container .fc-timegrid-event {
    margin: 1px !important;
    height: auto !important;
    min-height: 40px !important;
  }
  .fc-custom-event--time {
    flex-direction: column !important;
    align-items: flex-start !important;
    padding: 6px 8px !important;
    min-height: auto !important;
    height: auto !important;
  }
  .fc-custom-event--time .fc-custom-dot {
    display: none !important;
  }
  .fc-custom-event--time .fc-custom-body {
    width: 100% !important;
    min-width: 0 !important;
  }
  .fc-custom-event--time .fc-custom-time {
    font-size: 11px !important;
    font-weight: 600 !important;
    margin-bottom: 3px !important;
    line-height: 1.3 !important;
    white-space: nowrap !important;
  }
  .fc-custom-event--time .fc-custom-title {
    font-size: 12px !important;
    font-weight: 500 !important;
    line-height: 1.4 !important;
    white-space: normal !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
    overflow: visible !important;
    text-overflow: clip !important;
    max-width: 100% !important;
  }
  .calendar-container .fc-timegrid-slot {
    height: 50px !important;
  }
  .calendar-container .fc-timegrid-slots {
    min-height: 400px !important;
  }
  /* Ensure week view is also responsive */
  .calendar-container .fc-col-header {
    padding: 4px 0 !important;
  }
}

/* ── Tablet tweaks ───────────────────────────────────────── */
@media (min-width: 640px) and (max-width: 1023px) {
  .calendar-container .fc-toolbar-title { font-size: 16px !important; }
  .calendar-container .fc-timegrid-slot { height: 44px !important; }
}

/* ── Button styling ───────────────────────────────────────── */
.calendar-container .fc-button {
  background-color: #ffffff !important;
  border: 1px solid #e8eaed !important;
  color: #3c4043 !important;
  font-weight: 500 !important;
  border-radius: 6px !important;
  padding: 6px 12px !important;
  font-size: 13px !important;
  transition: all 0.2s ease !important;
  box-shadow: none !important;
  text-transform: none !important;
}

.calendar-container .fc-button:hover {
  background-color: #f8f9fa !important;
  border-color: #d0d2d6 !important;
  color: #23B685 !important;
}

.calendar-container .fc-button:focus {
  outline: 2px solid #23B685 !important;
  outline-offset: 2px !important;
}

.calendar-container .fc-button-active {
  background-color: #23B685 !important;
  border-color: #23B685 !important;
  color: #ffffff !important;
}

.calendar-container .fc-button-active:hover {
  background-color: #1da073 !important;
  border-color: #1da073 !important;
  color: #ffffff !important;
}

.calendar-container .fc-button:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

/* Button icons (prev/next) */
.calendar-container .fc-button .fc-icon {
  color: inherit !important;
}

/* Today button special styling */
.calendar-container .fc-today-button {
  font-weight: 600 !important;
  color: #23B685 !important;
  border-color: #23B685 !important;
}

.calendar-container .fc-today-button:hover {
  background-color: #23B685 !important;
  color: #ffffff !important;
}

/* Button group spacing */
.calendar-container .fc-button-group {
  display: flex;
  gap: 4px;
}

.calendar-container .fc-toolbar-chunk {
  display: flex;
  align-items: center;
  gap: 8px;
}
` }} />

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
        headerToolbar={headerToolbar}
        views={isMobile ? {
          dayGridMonth: { buttonText: 'Mo' },
          timeGridWeek: { buttonText: 'Wk' },
          timeGridDay: { buttonText: 'Day' },
        } : undefined}
        events={events}
        editable={editable}
        selectable={editable}
        selectMirror={editable}
        dayMaxEvents={isMobile ? false : true}
        weekends={true}
        height={isMobile ? 'auto' : height}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        datesSet={handleDatesSet}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        slotDuration="00:30:00"
        allDaySlot={false}
        nowIndicator={true}
        scrollTime={`${String(Math.max(6, Math.min(21, new Date().getHours()))).padStart(2, '0')}:00:00`}
        slotLabelFormat={slotLabelFormat}
        longPressDelay={isMobile ? 500 : 1000}
        eventLongPressDelay={isMobile ? 500 : 1000}
        selectLongPressDelay={isMobile ? 500 : 1000}
        dayHeaderContent={dayHeaderContent}
        eventContent={(arg: EventContentArg) => <EventContent arg={arg} />}
      />
    </div>
  );
}
