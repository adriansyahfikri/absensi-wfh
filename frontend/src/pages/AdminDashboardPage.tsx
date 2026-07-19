import { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import { EmployeeStatus, type Attendance, type Employee } from '../api/types';
import { AppShell } from '../components/AppShell';
import { DataTable, type DataTableColumn } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { EmployeeFormModal, type EmployeeFormValues } from './EmployeeFormModal';
import './AdminDashboardPage.css';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type Tab = 'employees' | 'attendance';

export function AdminDashboardPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState<Tab>('employees');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | ''>('');
  const [search, setSearch] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeDirectory, setEmployeeDirectory] = useState<Map<number, Employee>>(new Map());

  const loadEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const query = params.toString();
      const data = await api.get<Employee[]>(`/employees${query ? `?${query}` : ''}`, token);
      setEmployees(data);
    } finally {
      setEmployeesLoading(false);
    }
  }, [token, statusFilter, search]);

  // Unfiltered, independent of the Employees tab's search/status filters —
  // the attendance table needs to resolve every employeeId it sees, not
  // just whichever subset the admin last searched for.
  const loadEmployeeDirectory = useCallback(async () => {
    const data = await api.get<Employee[]>('/employees', token);
    setEmployeeDirectory(new Map(data.map((employee) => [employee.id, employee])));
  }, [token]);

  const loadAttendance = useCallback(async () => {
    setAttendanceLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter) params.set('date', dateFilter);
      const query = params.toString();
      const data = await api.get<Attendance[]>(`/attendance${query ? `?${query}` : ''}`, token);
      setAttendance(data);
    } finally {
      setAttendanceLoading(false);
    }
  }, [token, dateFilter]);

  // The attendance API only filters by date/employeeId (see
  // attendance.service.ts findAll) — there's no server-side text search, so
  // matching by employee code/name is done here against the already-loaded
  // page using the employee directory.
  const visibleAttendance = useMemo(() => {
    const query = employeeSearch.trim().toLowerCase();
    if (!query) return attendance;
    return attendance.filter((row) => {
      const employee = employeeDirectory.get(row.employeeId);
      if (!employee) return false;
      return (
        employee.employeeCode.toLowerCase().includes(query) ||
        employee.fullName.toLowerCase().includes(query)
      );
    });
  }, [attendance, employeeDirectory, employeeSearch]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    void loadEmployeeDirectory();
  }, [loadEmployeeDirectory]);

  useEffect(() => {
    if (tab === 'attendance') void loadAttendance();
  }, [tab, loadAttendance]);

  async function handleCreateOrUpdate(values: Partial<EmployeeFormValues>) {
    if (editingEmployee) {
      await api.patch(`/employees/${editingEmployee.id}`, values, token);
    } else {
      await api.post('/employees', values, token);
    }
    setShowForm(false);
    setEditingEmployee(null);
    await loadEmployees();
  }

  async function handleDeactivate(employee: Employee) {
    if (!window.confirm(`Deactivate ${employee.fullName}? This does not delete their history.`)) return;
    try {
      await api.delete(`/employees/${employee.id}`, token);
      await loadEmployees();
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Failed to deactivate employee.');
    }
  }

  const employeeColumns: DataTableColumn<Employee>[] = [
    { key: 'code', header: 'Code', render: (row) => row.employeeCode, mono: true },
    { key: 'name', header: 'Name', render: (row) => row.fullName },
    { key: 'email', header: 'Email', render: (row) => row.email },
    { key: 'position', header: 'Position', render: (row) => row.position },
    { key: 'department', header: 'Department', render: (row) => row.department },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.status === EmployeeStatus.ACTIVE ? 'success' : 'danger'}>{row.status}</Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div className="admin-page__row-actions">
          <Button
            variant="secondary"
            className="btn--icon"
            aria-label="Edit employee"
            title="Edit"
            onClick={() => {
              setEditingEmployee(row);
              setShowForm(true);
            }}
          >
            <FontAwesomeIcon icon={faPenToSquare} />
          </Button>
          {row.status === EmployeeStatus.ACTIVE ? (
            <Button
              variant="danger"
              className="btn--icon"
              aria-label="Deactivate employee"
              title="Deactivate"
              onClick={() => handleDeactivate(row)}
            >
              <FontAwesomeIcon icon={faCircleMinus} />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  const attendanceColumns: DataTableColumn<Attendance>[] = [
    {
      key: 'code',
      header: 'Employee code',
      render: (row) => employeeDirectory.get(row.employeeId)?.employeeCode ?? '—',
      mono: true,
    },
    {
      key: 'name',
      header: 'Name',
      render: (row) => employeeDirectory.get(row.employeeId)?.fullName ?? '—',
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => employeeDirectory.get(row.employeeId)?.department ?? '—',
    },
    {
      key: 'position',
      header: 'Position',
      render: (row) => employeeDirectory.get(row.employeeId)?.position ?? '—',
    },
    { key: 'in', header: 'Check-in', render: (row) => formatDateTime(row.checkInTime) },
    { key: 'out', header: 'Check-out', render: (row) => formatDateTime(row.checkOutTime) },
    {
      key: 'photo',
      header: 'Photo',
      render: (row) => (
        <a
          href={`${API_URL}/uploads/${row.checkInPhotoPath}`}
          target="_blank"
          rel="noreferrer"
          className="admin-page__photo-link"
        >
          View
        </a>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="admin-page">
        <div className="admin-page__tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'employees'}
            className={tab === 'employees' ? 'is-active' : ''}
            onClick={() => setTab('employees')}
          >
            Employees
          </button>
          <button
            role="tab"
            aria-selected={tab === 'attendance'}
            className={tab === 'attendance' ? 'is-active' : ''}
            onClick={() => setTab('attendance')}
          >
            Attendance
          </button>
        </div>

        {tab === 'employees' ? (
          <section className="admin-page__panel">
            <div className="admin-page__toolbar">
              <Field
                label="Search"
                placeholder="Name, code, or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="field">
                <label className="field__label" htmlFor="status-filter">
                  Status
                </label>
                <select
                  id="status-filter"
                  className="field__input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as EmployeeStatus | '')}
                >
                  <option value="">All</option>
                  <option value={EmployeeStatus.ACTIVE}>Active</option>
                  <option value={EmployeeStatus.INACTIVE}>Inactive</option>
                </select>
              </div>
              <Button
                onClick={() => {
                  setEditingEmployee(null);
                  setShowForm(true);
                }}
              >
                Add employee
              </Button>
            </div>

            <DataTable
              columns={employeeColumns}
              rows={employees}
              getRowKey={(row) => row.id}
              loading={employeesLoading}
              emptyMessage="No employees found."
            />
          </section>
        ) : (
          <section className="admin-page__panel">
            <div className="admin-page__toolbar">
              <Field
                label="Date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <Field
                label="Employee"
                placeholder="Code or name"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
              />
            </div>

            <DataTable
              columns={attendanceColumns}
              rows={visibleAttendance}
              getRowKey={(row) => row.id}
              loading={attendanceLoading}
              emptyMessage="No attendance records found."
            />
          </section>
        )}
      </div>

      {showForm ? (
        <EmployeeFormModal
          employee={editingEmployee}
          onClose={() => {
            setShowForm(false);
            setEditingEmployee(null);
          }}
          onSubmit={handleCreateOrUpdate}
        />
      ) : null}
    </AppShell>
  );
}
