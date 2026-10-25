import { FormEvent, useEffect, useState } from 'react';
import { api, AttendanceSummary, CalendarEvent, Subject, Task } from '../api';
import { Brand, Eyebrow, Spark } from './Brand';
import { CalendarCard } from './CalendarCard';
import type { View } from '../types';

function EmptyPanel({ title, message }: { title: string; message: string }) {
  return <div className="empty-state"><b>{title}</b><p>{message}</p></div>;
}

function Attendance({ subjects, summary, refresh }: { subjects: Subject[]; summary: AttendanceSummary | null; refresh: () => void }) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [status, setStatus] = useState('attended');
  const [error, setError] = useState('');
  useEffect(() => { if (!subjectId && subjects[0]) setSubjectId(subjects[0].id); }, [subjects, subjectId]);
  const record = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    try { await api(`/api/subjects/${subjectId}/attendance`, { method: 'POST', body: JSON.stringify({ session_date: new Date().toISOString().slice(0, 10), status }) }); refresh(); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to record attendance'); }
  };
  return <section className="panel attendance-panel"><div className="panel-title"><div><Eyebrow>academic overview</Eyebrow><h2>Attendance</h2><p>{summary ? `${summary.held} eligible classes recorded` : 'Track classes once your subjects are set up.'}</p></div><span className="pill">{summary?.percentage == null ? 'Setup needed' : `${summary.percentage}%`}</span></div><div className="attendance-score"><strong>{summary?.percentage == null ? '—' : `${summary.percentage}%`}</strong><span>overall attendance<br />Target: {summary?.target ?? '—'}%</span></div><div className="bar"><i style={{ width: `${summary?.percentage || 0}%` }} /></div>{subjects.length ? <form className="inline-form" onSubmit={record}><select value={subjectId} onChange={event => setSubjectId(Number(event.target.value))}>{subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select><select value={status} onChange={event => setStatus(event.target.value)}><option value="attended">Attended</option><option value="missed">Missed</option><option value="cancelled">Cancelled</option></select><button className="upload" type="submit" aria-label="Record class">+</button></form> : <EmptyPanel title="No subjects yet" message="Add a subject below to begin recording attendance." />}{error && <div className="form-message">{error}</div>}</section>;
}

export function Dashboard({ navigate }: { navigate: (view: View) => void }) {
  const [theme, setTheme] = useState(localStorage.getItem('campusbrain-theme') || 'dark');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [name, setName] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [error, setError] = useState('');
  const today = new Date();
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('campusbrain-theme', theme); }, [theme]);
  const load = async () => {
    try {
      const [nextSubjects, nextTasks, nextEvents] = await Promise.all([api<Subject[]>('/api/subjects'), api<Task[]>('/api/tasks?filter=upcoming'), api<CalendarEvent[]>('/api/events')]);
      setSubjects(nextSubjects); setTasks(nextTasks); setEvents(nextEvents);
      if (nextSubjects[0]) setSummary(await api<AttendanceSummary>(`/api/subjects/${nextSubjects[0].id}/attendance/summary`)); else setSummary(null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Backend unavailable. Start FastAPI to load your data.'); }
  };
  useEffect(() => { void load(); }, []);
  const addSubject = async (event: FormEvent) => { event.preventDefault(); if (!name.trim()) return; try { await api('/api/subjects', { method: 'POST', body: JSON.stringify({ name: name.trim(), attendance_target: 75 }) }); setName(''); void load(); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to add subject'); } };
  const addTask = async (event: FormEvent) => { event.preventDefault(); if (!taskTitle.trim()) return; try { await api('/api/tasks', { method: 'POST', body: JSON.stringify({ title: taskTitle.trim(), due_date: new Date().toISOString().slice(0, 10), priority: 'medium' }) }); setTaskTitle(''); void load(); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to add task'); } };
  const deleteTask = async (id: number) => { try { await api(`/api/tasks/${id}`, { method: 'DELETE' }); void load(); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to delete task'); } };
  const createEvent = async (title: string, eventDate: string) => { await api('/api/events', { method: 'POST', body: JSON.stringify({ title, event_date: eventDate }) }); void load(); };
  const deleteEvent = async (id: number) => { await api(`/api/events/${id}`, { method: 'DELETE' }); void load(); };
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return <main className="dashboard"><header className="topbar"><Brand /><div className="date-meta"><span>{dateLabel}</span><small>personal workspace</small></div><div className="desktop-jump"><button onClick={() => document.getElementById('attendance')?.scrollIntoView({ behavior: 'smooth' })}>Attendance</button><button onClick={() => document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth' })}>Calendar</button></div><button className="profile" onClick={() => navigate('settings')} aria-label="Open settings">You</button></header>{error && <div className="form-message">{error}</div>}<div className="dashboard-grid"><div id="attendance"><Attendance subjects={subjects} summary={summary} refresh={() => void load()} /></div><div className="dashboard-column"><section className="reminders"><div className="reminders-head"><div><h2>REMINDERS!</h2><span>your upcoming work</span></div><span className="unread-deadline-badge">{tasks.length}</span></div>{tasks.length ? tasks.slice(0, 4).map(task => <div className="reminder" key={task.id}><button className="check" onClick={() => void api(`/api/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ completed: true }) }).then(() => void load())} aria-label={`Complete ${task.title}`} /><div><strong>{task.title}</strong><small>{task.due_date}</small></div><time>{task.priority} <button className="tiny-action" onClick={() => void deleteTask(task.id)} aria-label={`Delete ${task.title}`}>×</button></time></div>) : <EmptyPanel title="Nothing due yet" message="Tasks and deadlines you add will show up here." />}<form className="inline-form" onSubmit={addTask}><input value={taskTitle} onChange={event => setTaskTitle(event.target.value)} placeholder="Add task" aria-label="Task title" /><button className="upload" type="submit" aria-label="Add task">+</button></form></section><section className="files-card"><div className="panel-title"><div><Eyebrow>subjects</Eyebrow><h2>My subjects</h2></div><span className="pill">{subjects.length}</span></div>{subjects.map(subject => <div className="file-row" key={subject.id}><div><b>{subject.name}</b><small>{subject.course_code || `Target ${subject.attendance_target}%`}</small></div></div>)}{!subjects.length && <EmptyPanel title="No subjects yet" message="Create your first subject to enable attendance tracking." />}<form className="inline-form" onSubmit={addSubject}><input value={name} onChange={event => setName(event.target.value)} placeholder="Add subject" aria-label="Subject name" /><button className="upload" type="submit" aria-label="Add subject">+</button></form></section><button className="mascot-card" onClick={() => navigate('chat')}><Eyebrow>your study sidekick</Eyebrow><div className="bot happy"><Spark /></div><h2>Ask CampusBrain</h2><p>notes, deadlines, campus life</p></button></div><div id="calendar"><CalendarCard events={events} onCreate={createEvent} onDelete={deleteEvent} /></div></div><nav className="bottom-nav"><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>⌂<span>Home</span></button><button onClick={() => navigate('chat')}>⌕<span>Chat</span></button><button onClick={() => document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth' })}>▦<span>Calendar</span></button><button onClick={() => navigate('settings')}>☰<span>More</span></button></nav></main>;
}
