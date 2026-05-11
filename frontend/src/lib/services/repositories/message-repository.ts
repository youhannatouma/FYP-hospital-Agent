/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Message Repository
 * Handles all messaging-related API calls
 * Follows: Single Responsibility Principle (SRP)
 * Follows: Open/Closed Principle (OCP)
 * Follows: Dependency Inversion Principle (DIP)
 */

import { ApiRequestHelper } from '../api-request-helper';

export interface Message {
  message_id: string;
  sender_id: string;
  sender_name?: string;
  receiver_id: string;
  receiver_name?: string;
  subject?: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface SendMessageDto {
  receiver_id: string;
  subject: string;
  body: string;
}

export interface IMessageRepository {
  getMessages(): Promise<Message[]>;
  sendMessage(data: SendMessageDto): Promise<Message>;
  markAsRead(messageId: string): Promise<void>;
}

export class MessageRepository implements IMessageRepository {
  constructor(private apiHelper: ApiRequestHelper) {}

  async getMessages(): Promise<Message[]> {
    return this.apiHelper.get<Message[]>('/messages/my');
  }

  async sendMessage(data: SendMessageDto): Promise<Message> {
    return this.apiHelper.post<Message>('/messages/', data);
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.apiHelper.patch(`/messages/${messageId}/read`, {});
  }
}

let messageRepositoryInstance: IMessageRepository | null = null;

export function getMessageRepository(apiHelper?: ApiRequestHelper): IMessageRepository {
  if (!messageRepositoryInstance) {
    const { getApiRequestHelper } = require('../api-request-helper');
    messageRepositoryInstance = new MessageRepository(
      apiHelper || getApiRequestHelper()
    );
  }
  return messageRepositoryInstance;
}

export function setMessageRepository(repo: IMessageRepository): void {
  messageRepositoryInstance = repo;
}
