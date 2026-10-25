import { useMemo, useState } from 'react';
import { Eyebrow } from './Brand';
import type { CalendarEvent } from '../api';

export function CalendarCard({ events = [], onCreate, onDelete }: { events?: CalendarEvent[]; onCreate?: (title: string, eventDate: string) => Promise<void>; onDelete?: (id: number) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date().toISOString().slice(0, 10));
  const days = useMemo(() => {
    const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const start = (new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay() + 6) % 7;
    return [...Array(start).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  }, [cursor]);
  const key = (day: number) => `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return <section className="calendar-card" aria-labelledby="calendar-title">
    <div className="calendar-head"><h2 id="calendar-title">Calendar</h2><div><button aria-label="Previous month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>‹</button><button aria-label="Next month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>›</button></div></div>
    <Eyebrow>{cursor.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</Eyebrow>
    <div className="month-grid">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <b key={`${day}-${i}`}>{day}</b>)}{days.map((day, i) => day ? <button className={`day ${events.some(event => event.event_date === key(day)) ? 'deadline' : ''} ${key(day) === selected ? 'selected' : ''}`} key={day} onClick={() => setSelected(key(day))}>{day}</button> : <span className="day muted" key={`empty-${i}`} />)}</div>
    <div className="calendar-note"><b>{new Date(`${selected}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</b>{events.filter(event => event.event_date === selected).map(event => <span key={event.id}>{event.title} {onDelete && <button className="tiny-action" onClick={() => void onDelete(event.id)} aria-label={`Delete ${event.title}`}>×</button>}</span>)}{!events.some(event => event.event_date === selected) && <span>No events yet. Add an event from the calendar.</span>}{onCreate && <form className="inline-form" onSubmit={async event => { event.preventDefault(); if (!title.trim()) return; await onCreate(title.trim(), selected); setTitle(''); }}><input value={title} onChange={event => setTitle(event.target.value)} placeholder="Add event" aria-label="Event title" /><button className="upload" type="submit" aria-label="Add event">+</button></form>}</div>
  </section>;
}
