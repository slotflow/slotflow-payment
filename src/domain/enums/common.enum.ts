export enum Role {
    ADMIN = "ADMIN",
    USER = "USER",
    PROVIDER = "PROVIDER",
};

export enum EventStatus {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    PENDING = "PENDING",
    RETRY = "RETRY",
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
  SMS = 'SMS',
}

export enum NotificationType {
  ACCOUNT_ACTIVITY = 'ACCOUNT_ACTIVITY',
  SYSTEM_UPDATES = 'SYSTEM_UPDATES',
  PROMOTIONAL_UPDATES = 'PROMOTIONAL_UPDATES',
}