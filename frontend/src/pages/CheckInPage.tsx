import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import type { Attendance } from '../api/types';
import { AppShell } from '../components/AppShell';
import { CameraCapture, type CameraCaptureState } from '../components/CameraCapture';
import { Button } from '../components/Button';
import { DataTable, type DataTableColumn } from '../components/DataTable';
import { Badge } from '../components/Badge';
import './CheckInPage.css';

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function CheckInPage() {
  const { token } = useAuth();
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [uploaderState, setUploaderState] = useState<CameraCaptureState>('idle');
  const [uploaderMessage, setUploaderMessage] = useState('');
  const [checkOutState, setCheckOutState] = useState<'idle' | 'loading'>('idle');
  const [banner, setBanner] = useState('');

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await api.get<Attendance[]>('/attendance/me', token);
      setHistory(data);
    } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const todayRecord = history.find((row) => isToday(row.checkInTime));

  async function handleCheckIn() {
    if (!photo) return;
    setUploaderState('loading');
    setUploaderMessage('');
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      await api.postForm('/attendance/check-in', formData, token);
      setUploaderState('success');
      setUploaderMessage('Checked in successfully.');
      setPhoto(null);
      await loadHistory();
    } catch (err) {
      setUploaderState('error');
      setUploaderMessage(err instanceof ApiError ? err.message : 'Check-in failed. Try again.');
    }
  }

  async function handleCheckOut() {
    setCheckOutState('loading');
    setBanner('');
    try {
      await api.patch('/attendance/check-out', undefined, token);
      setBanner('Checked out successfully.');
      await loadHistory();
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : 'Check-out failed. Try again.');
    } finally {
      setCheckOutState('idle');
    }
  }

  const columns: DataTableColumn<Attendance>[] = [
    { key: 'date', header: 'Date', render: (row) => formatDate(row.checkInTime) },
    { key: 'in', header: 'Check-in', render: (row) => formatTime(row.checkInTime), mono: true },
    { key: 'out', header: 'Check-out', render: (row) => formatTime(row.checkOutTime), mono: true },
    {
      key: 'status',
      header: 'Status',
      render: (row) =>
        row.checkOutTime ? (
          <Badge tone="neutral">Done</Badge>
        ) : (
          <Badge tone="accent">In progress</Badge>
        ),
    },
  ];

  return (
    <AppShell>
      <div className="checkin-page">
        <section className="checkin-card">
          <h1>Today</h1>

          {todayRecord ? (
            <div className="checkin-status">
              <p>
                Checked in at <strong>{formatTime(todayRecord.checkInTime)}</strong>
              </p>
              {todayRecord.checkOutTime ? (
                <p>
                  Checked out at <strong>{formatTime(todayRecord.checkOutTime)}</strong>
                </p>
              ) : (
                <Button onClick={handleCheckOut} state={checkOutState === 'loading' ? 'loading' : 'idle'}>
                  Check out
                </Button>
              )}
              {banner ? <p className="checkin-banner">{banner}</p> : null}
            </div>
          ) : (
            <div className="checkin-form">
              <CameraCapture
                value={photo}
                onChange={(file) => {
                  setPhoto(file);
                  setUploaderState('idle');
                  setUploaderMessage('');
                }}
                state={uploaderState}
                message={uploaderMessage}
              />
              <Button
                onClick={handleCheckIn}
                disabled={!photo}
                state={uploaderState === 'loading' ? 'loading' : 'idle'}
              >
                Check in
              </Button>
            </div>
          )}
        </section>

        <section className="checkin-history">
          <h2>My history</h2>
          <DataTable
            columns={columns}
            rows={history}
            getRowKey={(row) => row.id}
            loading={loadingHistory}
            emptyMessage="No attendance records yet."
          />
        </section>
      </div>
    </AppShell>
  );
}
