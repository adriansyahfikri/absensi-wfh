import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Badge } from './Badge';
import { Button } from './Button';
import './AppShell.css';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-shell__bar">
        <span className="app-shell__wordmark">WFH Attendance</span>
        {user ? (
          <div className="app-shell__account">
            <span className="app-shell__username">{user.username}</span>
            <Badge tone="accent">{user.role}</Badge>
            <Button variant="secondary" onClick={logout}>
              Log out
            </Button>
          </div>
        ) : null}
      </header>
      <main className="app-shell__content">{children}</main>
    </div>
  );
}
