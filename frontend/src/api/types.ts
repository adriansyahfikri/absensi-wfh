export enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

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
