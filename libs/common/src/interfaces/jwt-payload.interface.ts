import { Role } from '../constants/role.enum';

/**
 * Shape of the decoded JWT.
 * `sub` (subject) is the user id — the standard JWT claim for identity.
 * `employeeId` is null for admin accounts that have no HR record.
 * The roles guard reads `role`; attendance endpoints read `employeeId`.
 */
export interface JwtPayload {
  sub: number;
  username: string;
  role: Role;
  employeeId: number | null;
}
