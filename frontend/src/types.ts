export type View = 'welcome' | 'login' | 'signup' | 'forgot' | 'dashboard' | 'chat' | 'settings';
export type AuthView = Extract<View, 'welcome' | 'login' | 'signup' | 'forgot'>;

