import { useState, type FormEvent } from 'react';
import { Modal } from '../components/Modal';
import { Field } from '../components/Field';
import { Button } from '../components/Button';
import type { Employee } from '../api/types';
import './EmployeeFormModal.css';

export interface EmployeeFormValues {
  employeeCode: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  username: string;
  password: string;
}

interface EmployeeFormModalProps {
  employee: Employee | null;
  onClose: () => void;
  onSubmit: (values: Partial<EmployeeFormValues>) => Promise<void>;
}

export function EmployeeFormModal({ employee, onClose, onSubmit }: EmployeeFormModalProps) {
  const isEdit = Boolean(employee);
  const [values, setValues] = useState<EmployeeFormValues>({
    employeeCode: employee?.employeeCode ?? '',
    fullName: employee?.fullName ?? '',
    position: employee?.position ?? '',
    department: employee?.department ?? '',
    email: employee?.email ?? '',
    username: '',
    password: '',
  });
  const [state, setState] = useState<'idle' | 'loading'>('idle');
  const [error, setError] = useState('');

  function update<K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState('loading');
    setError('');
    try {
      if (isEdit) {
        const patch: Partial<EmployeeFormValues> = { ...values };
        if (!patch.username) delete patch.username;
        if (!patch.password) delete patch.password;
        await onSubmit(patch);
      } else {
        await onSubmit(values);
      }
    } catch (err) {
      setState('idle');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      return;
    }
  }

  return (
    <Modal title={isEdit ? 'Edit employee' : 'Add employee'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="employee-form">
        <Field
          label="Employee code"
          value={values.employeeCode}
          onChange={(e) => update('employeeCode', e.target.value)}
          required
        />
        <Field
          label="Full name"
          value={values.fullName}
          onChange={(e) => update('fullName', e.target.value)}
          required
        />
        <Field
          label="Position"
          value={values.position}
          onChange={(e) => update('position', e.target.value)}
          required
        />
        <Field
          label="Department"
          value={values.department}
          onChange={(e) => update('department', e.target.value)}
          required
        />
        <Field
          label="Email"
          type="email"
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
          required
        />
        <Field
          label={isEdit ? 'Username (leave blank to keep)' : 'Username'}
          value={values.username}
          onChange={(e) => update('username', e.target.value)}
          required={!isEdit}
        />
        <Field
          label={isEdit ? 'Password (leave blank to keep)' : 'Password'}
          type="password"
          value={values.password}
          onChange={(e) => update('password', e.target.value)}
          required={!isEdit}
          minLength={isEdit ? undefined : 6}
        />

        {error ? <p className="employee-form__error">{error}</p> : null}

        <Button type="submit" state={state === 'loading' ? 'loading' : 'idle'}>
          {isEdit ? 'Save changes' : 'Create employee'}
        </Button>
      </form>
    </Modal>
  );
}
