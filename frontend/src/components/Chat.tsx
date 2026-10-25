import { useState } from 'react';
import { Brand, Eyebrow, Spark } from './Brand';
import type { View } from '../types';

export function Chat({ navigate }: { navigate: (view: View) => void }) {
  const [messages, setMessages] = useState(['I can help connect your notes, notices, and calendar once the backend is configured.']);
  const [input, setInput] = useState('');
  const send = () => { const text = input.trim(); if (!text) return; setMessages(current => [...current, `You: ${text}`, 'AI is unavailable until a provider and backend are configured. Your message was not sent anywhere.']); setInput(''); };
  return <main className="chat-view"><aside className="chat-rail"><button className="profile" onClick={() => navigate('settings')}>You</button><button className="new-chat" onClick={() => setMessages([])}>+ New chat</button><Eyebrow>recent conversations</Eyebrow><div className="conversation active">New conversation</div></aside><div className="chat-main"><div className="chat-top"><button className="back" onClick={() => navigate('dashboard')}>←</button><div className="bot"><Spark /></div><div><h1>CampusBrain</h1><p>your campus, in context</p><small>AI unavailable · local interface</small></div></div><div className="chat-messages">{messages.length ? messages.map((message, i) => <div className={`message ${message.startsWith('You:') ? 'user' : ''}`} key={`${message}-${i}`}><div className="bubble">{message}</div></div>) : <div className="empty-state"><b>New conversation</b><p>Ask a question after an AI provider is configured.</p></div>}</div><div className="suggestions">{['summarise my notes', "what's due this week", 'help me plan revision'].map(suggestion => <button key={suggestion} onClick={() => setInput(suggestion)}>{suggestion}</button>)}</div><div className="chat-input"><input value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => event.key === 'Enter' && send()} placeholder="Chat — text" aria-label="Message CampusBrain" /><button onClick={send} aria-label="Send message">↗</button></div></div></main>;
}

