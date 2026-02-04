import { api } from './api';
import { Quiz, PaginatedResponse } from '@grow-fitness/shared-types';
import { CreateQuizDto, UpdateQuizDto } from '@grow-fitness/shared-schemas';

export const quizzesService = {
  getQuizzes: (page: number = 1, limit: number = 10, targetAudience?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (targetAudience) {
      params.append('targetAudience', targetAudience);
    }
    return api.get<PaginatedResponse<Quiz>>(`/quizzes?${params.toString()}`);
  },
  getQuizById: (id: string) => api.get<Quiz>(`/quizzes/${id}`),
  createQuiz: (data: CreateQuizDto) => api.post<Quiz>('/quizzes', data),
  updateQuiz: (id: string, data: UpdateQuizDto) => api.patch<Quiz>(`/quizzes/${id}`, data),
  deleteQuiz: (id: string) => api.delete<void>(`/quizzes/${id}`),
};
