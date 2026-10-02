import { Role } from "../../domain/enums/common.enum";

/**
 * Common dtos
 */

// common response
export interface CommonResponse {
  success?: boolean;
  message?: string;
};

//  type of table data
export interface TableData<T> {
  totalPages?: number;
  currentPage?: number;
  totalCount?: number;
  items?: T
};

// Used for the pagination
export interface ApiPaginationRequest {
  page: number;
  limit: number;
}

// Time zone interface
export interface TimeZone {
    value: string;
    label: string;
    offset: number;
    abbrev: string;
    altName: string;
}

// Decoded user from jwt token
export interface AuthUser {
  id: string;
  role: Role;
  email: string;
  name: string;
  timeZone: TimeZone;
};

// common date input filters
export interface CommonDateInput {
  startDate: string;
  endDate: string;
}

// statis metric type
export interface StatMetric {
  value: number;
  trend: string;
}

// Notification channels
export type NotificationChannel = 'email' | 'push' | 'in_app';

// Notification Type
export type NotificationType =
  | 'account_activity'
  | 'system_updates'
  | 'promotional_updates';