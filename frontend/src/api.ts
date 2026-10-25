const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export type Subject = { id: number; name: string; course_code: string | null; attendance_target: number };
export type AttendanceSummary = { held: number; attended: number; missed: number; cancelled: number; percentage: number | null; target: number; classes_to_target: number | null; can_miss: number | null };
export type Task = { id: number; title: string; description: string | null; subject_id: number | null; due_date: string; due_time: string | null; priority: string; completed: boolean };
export type CalendarEvent = { id: number; title: string; description: string | null; event_date: string; event_time: string | null; subject_id: number | null };

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.detail || `Request failed (${response.status})`);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

