import { useState } from 'react';
import { AuthView } from './components/AuthView';
import { Chat } from './components/Chat';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import type { View } from './types';

export default function App() {
  const [view, setView] = useState<View>(() => localStorage.getItem('campusbrain-local-profile') === '1' ? 'dashboard' : 'welcome');
  if (view === 'welcome' || view === 'login' || view === 'signup' || view === 'forgot') return <AuthView view={view} navigate={setView} />;
  if (view === 'chat') return <Chat navigate={setView} />;
  if (view === 'settings') return <Settings navigate={setView} />;
  return <Dashboard navigate={setView} />;
}
