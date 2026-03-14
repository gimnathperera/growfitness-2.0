export const CALENDAR_STYLES = `
@keyframes schedule-calendar-spin {
  to { transform: rotate(360deg); }
}
.fc {
  --fc-button-bg-color: #fff;
  --fc-button-border-color: #dadce0;
  --fc-button-hover-bg-color: #f1f3f4;
  --fc-button-hover-border-color: #dadce0;
  --fc-button-active-bg-color: #e6f7f2;
  --fc-button-active-border-color: #dadce0;
  --fc-button-text-color: #3c4043;
  --fc-border-color: #e8eaed;
  --fc-today-bg-color: transparent;
  --fc-now-indicator-color: #23B685;
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
  color: #23B685;
  background-color: #e6f7f2;
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
.fc .fc-day-today .fc-col-header-cell-cushion,
.fc th.fc-day-today .fc-col-header-cell-cushion,
.fc .fc-day-today a.fc-col-header-cell-cushion {
  color: #23B685 !important;
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
.fc .fc-day-today .day-number,
.fc-day-today .day-number {
  background-color: #23B685 !important;
  color: white !important;
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
`;
