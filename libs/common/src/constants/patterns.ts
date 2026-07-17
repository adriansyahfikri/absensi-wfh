/**
 * Message patterns for inter-service communication (TCP transport).
 *
 * The Gateway sends these; the microservices listen for them via
 * @MessagePattern(...). Keeping them in one shared file guarantees the
 * sender and receiver always agree on the exact string — a typo here
 * would silently break the request instead of failing loudly.
 */

export const AUTH_PATTERNS = {
  VALIDATE_USER: { cmd: 'auth.validate_user' },
} as const;

export const EMPLOYEE_PATTERNS = {
  CREATE: { cmd: 'employee.create' },
  FIND_ALL: { cmd: 'employee.find_all' },
  FIND_ONE: { cmd: 'employee.find_one' },
  UPDATE: { cmd: 'employee.update' },
  REMOVE: { cmd: 'employee.remove' },
} as const;

export const ATTENDANCE_PATTERNS = {
  CHECK_IN: { cmd: 'attendance.check_in' },
  CHECK_OUT: { cmd: 'attendance.check_out' },
  FIND_BY_EMPLOYEE: { cmd: 'attendance.find_by_employee' },
  FIND_ALL: { cmd: 'attendance.find_all' },
} as const;

/**
 * Injection tokens used when registering ClientProxy in the Gateway.
 */
export const SERVICE_NAMES = {
  EMPLOYEE: 'EMPLOYEE_SERVICE',
  ATTENDANCE: 'ATTENDANCE_SERVICE',
} as const;
