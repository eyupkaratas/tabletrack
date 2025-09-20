// src/tables/dto/update-status.dto.ts
import { IsEnum } from 'class-validator';
export enum TableStatus {
  available = 'available',
  active = 'active',
}
export class UpdateStatusDto {
  @IsEnum(TableStatus) status: TableStatus;
}
