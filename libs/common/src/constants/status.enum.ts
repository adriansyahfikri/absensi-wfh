/**
 * Employee lifecycle status.
 * INACTIVE is used for soft delete — the row is never physically removed,
 * so attendance history and foreign keys stay intact.
 */
export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
