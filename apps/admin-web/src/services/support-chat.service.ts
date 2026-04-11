import { api } from './api';
import { PaginatedResponse } from '@grow-fitness/shared-types';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export const supportChatService = {
  getMessages: (page = 1, limit = 50) =>
    api.get<PaginatedResponse<ChatMessage>>(`/support-chat?page=${page}&limit=${limit}`),
  
  sendMessage: (content: string, receiverId?: string) =>
    api.post<ChatMessage>('/support-chat', { content, receiverId }),
  
  markAsRead: (messageId: string) =>
    api.patch(`/support-chat/${messageId}/read`, {}),
};
