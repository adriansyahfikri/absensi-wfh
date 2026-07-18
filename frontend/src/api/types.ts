export const Role = {
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const EmployeeStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type EmployeeStatus = (typeof EmployeeStatus)[keyof typeof EmployeeStatus];

export interface JwtPayload {
  sub: number;
  username: string;
  role: Role;
  employeeId: number | null;
  exp: number;
}

export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: number;
  employeeId: number;
  checkInTime: string;
  checkInPhotoPath: string;
  checkOutTime: string | null;
  createdAt: string;
}
