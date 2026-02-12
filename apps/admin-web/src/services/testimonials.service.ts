import { api } from './api';
import { Testimonial, PaginatedResponse } from '@grow-fitness/shared-types';
import { CreateTestimonialDto, UpdateTestimonialDto } from '@grow-fitness/shared-schemas';

export const testimonialsService = {
  getTestimonials: (page: number = 1, limit: number = 10, activeOnly = false) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (!activeOnly) params.append('activeOnly', 'false');
    return api.get<PaginatedResponse<Testimonial>>(`/testimonials?${params.toString()}`);
  },
  getTestimonialById: (id: string) => api.get<Testimonial>(`/testimonials/${id}`),
  createTestimonial: (data: CreateTestimonialDto) =>
    api.post<Testimonial>('/testimonials', data),
  updateTestimonial: (id: string, data: UpdateTestimonialDto) =>
    api.patch<Testimonial>(`/testimonials/${id}`, data),
};
