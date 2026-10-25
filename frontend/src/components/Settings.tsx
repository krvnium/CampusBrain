import { useState } from 'react';
import type { View } from '../types';
import { Eyebrow } from './Brand';

export function Settings({ navigate }: { navigate: (view: View) => void }) {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || 'dark');
  const toggleTheme = () => { const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); document.documentElement.dataset.theme = next; localStorage.setItem('campusbrain-theme', next); };
  return <main className="settings-view"><button className="back" onClick={() => navigate('dashboard')}>←</button><div className="sheet-head"><Eyebrow>preferences</Eyebrow><h1>Settings</h1></div><div className="settings-list">{['Profile|local workspace information','Notifications|permission-aware reminders','Calendar & Deadlines|academic events and tasks','Appearance|theme and text size','Data|export or delete local data','Help & Support|setup and troubleshooting'].map(row => { const [title, detail] = row.split('|'); return <div className="settings-row" key={title}><div><b>{title}</b><small>{detail}</small></div><span>›</span></div>; })}</div><button className="theme-toggle" onClick={toggleTheme}>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</button><button className="logout" onClick={() => { localStorage.removeItem('campusbrain-local-profile'); navigate('welcome'); }}>Close local profile</button></main>;
}
