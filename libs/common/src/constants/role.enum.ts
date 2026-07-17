/**
 * User roles for access control.
 * Stored on the `user` table and embedded in the JWT payload.
 */
export enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}
