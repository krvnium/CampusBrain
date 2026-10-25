import { FormEvent, useState } from 'react';
import { Brand, Eyebrow } from './Brand';
import type { AuthView as AuthViewName, View } from '../types';

export function AuthView({ view, navigate }: { view: AuthViewName; navigate: (view: View) => void }) {
  const copy = {
    welcome: ['Your whole campus, one brain.', 'Files, deadlines, attendance, and answers — all in one place.'],
    login: ['Welcome back.', 'Your deadlines, files, and campus context are ready when you are.'],
    signup: ['Make campus feel lighter.', 'Bring your study life into one calm, searchable place.'],
    forgot: ['Find your way back.', 'Recovery is reserved for a future authenticated backend.'],
  }[view];
  const [message, setMessage] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      setMessage('Please complete the required fields with valid details.');
      return;
    }
    const data = new FormData(form);
    if (view === 'signup' && data.get('password') !== data.get('confirm')) {
      setMessage('Passwords must match.');
      return;
    }
    if (view === 'forgot') {
      setMessage('Account recovery will be available when authentication is connected.');
      return;
    }
    localStorage.setItem('campusbrain-local-profile', '1');
    navigate('dashboard');
  };

  return <main className="auth-view"><div className="auth-layout">
    <div className="auth-intro"><Brand /><h1>{copy[0]}</h1><p>{copy[1]}</p></div>
    <div className="auth-card">
      {view !== 'welcome' && <button className="auth-back" onClick={() => navigate(view === 'forgot' ? 'login' : 'welcome')}>← Back</button>}
      <Eyebrow>{view === 'welcome' ? 'student workspace' : view === 'forgot' ? 'account recovery' : view === 'signup' ? 'new workspace' : 'local profile'}</Eyebrow>
      <h2>{view === 'welcome' ? 'Start with clarity.' : view === 'forgot' ? 'Forgot password?' : view === 'signup' ? 'Create a profile' : 'Open your workspace'}</h2>
      <p>{view === 'welcome' ? 'Create a local profile to explore the workspace. No account is sent anywhere yet.' : 'This foundation keeps profile data local until secure authentication is implemented.'}</p>
      {view === 'welcome' ? <><button className="auth-submit" onClick={() => navigate('login')}>Open profile</button><button className="demo-entry" onClick={() => { localStorage.setItem('campusbrain-local-profile', '1'); navigate('dashboard'); }}>Explore empty workspace</button><div className="login">New here? <button onClick={() => navigate('signup')}>Create a profile</button></div></> :
        <form className="auth-form" onSubmit={submit} noValidate>
          {view === 'signup' && <Field label="Name" name="name" placeholder="Your name" />}
          <Field label="Email" name="email" type="email" placeholder="you@campus.edu" />
          {view !== 'forgot' && <Field label="Password" name="password" type="password" placeholder="At least 6 characters" minLength={6} />}
          {view === 'signup' && <Field label="Confirm password" name="confirm" type="password" placeholder="Repeat your password" minLength={6} />}
          {message && <div className="form-message">{message}</div>}
          <button className="auth-submit" type="submit">{view === 'forgot' ? 'Show setup state' : view === 'signup' ? 'Create local profile' : 'Open workspace'}</button>
        </form>}
      {view === 'login' && <div className="auth-links"><button onClick={() => navigate('forgot')}>Forgot password?</button><button onClick={() => navigate('signup')}>Create profile</button></div>}
      <div className="auth-note">Local foundation · secure authentication is planned</div>
    </div>
  </div></main>;
}

function Field({ label, name, type = 'text', placeholder, minLength }: { label: string; name: string; type?: string; placeholder: string; minLength?: number }) {
  return <label className="field">{label}<input className="input" name={name} type={type} placeholder={placeholder} required minLength={minLength} /></label>;
}

