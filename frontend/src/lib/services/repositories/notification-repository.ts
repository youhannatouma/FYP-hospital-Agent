/**
 * Notification Repository
 * Handles all notification-related API calls
 * Follows: Single Responsibility Principle (SRP)
 * Follows: Open/Closed Principle (OCP) — open for extension via interface
 * Follows: Dependency Inversion Principle (DIP) — depends on ApiRequestHelper abstraction
 */

import { ApiRequestHelper } from '../api-request-helper';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'appointment' | 'message' | 'system' | 'alert';
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface INotificationRepository {
  getNotifications(): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}

export class NotificationRepository implements INotificationRepository {
  constructor(private apiHelper: ApiRequestHelper) {}

  async getNotifications(): Promise<Notification[]> {
    return this.apiHelper.get<Notification[]>('/notifications/');
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.apiHelper.patch(`/notifications/${notificationId}/read`, {});
  }

  async markAllAsRead(): Promise<void> {
    await this.apiHelper.patch('/notifications/read-all', {});
  }
}

let notificationRepositoryInstance: INotificationRepository | null = null;

export function getNotificationRepository(apiHelper?: ApiRequestHelper): INotificationRepository {
  if (!notificationRepositoryInstance) {
    const { getApiRequestHelper } = require('../api-request-helper');
    notificationRepositoryInstance = new NotificationRepository(
      apiHelper || getApiRequestHelper()
    );
  }
  return notificationRepositoryInstance;
}

export function setNotificationRepository(repo: INotificationRepository): void {
  notificationRepositoryInstance = repo;
}
