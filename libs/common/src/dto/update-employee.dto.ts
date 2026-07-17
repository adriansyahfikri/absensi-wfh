import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';

/**
 * Payload for PATCH /employees/:id (admin only).
 *
 * PartialType makes every field from CreateEmployeeDto optional, so the
 * admin can update only the fields they send. Validation rules (e.g. email
 * format, password min length) still apply to any field that IS provided.
 *
 * Note: deactivation is handled by DELETE /employees/:id (soft delete),
 * not through this DTO — status is intentionally not editable here.
 */
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
