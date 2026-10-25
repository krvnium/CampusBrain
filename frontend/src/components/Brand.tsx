import type { ReactNode } from 'react';

export function Spark() {
  return <span className="spark" aria-hidden="true" />;
}

export function Brand() {
  return <div className="brand"><Spark />campusbrain</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

