import { create } from 'zustand';
import { api } from './authStore';
import type { Course, Section, UserProgress } from '../types';

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  currentSection: Section | null;
  progress: UserProgress[];
  isLoading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchCourse: (slug: string) => Promise<void>;
  fetchSection: (sectionId: number) => Promise<void>;
  fetchProgress: () => Promise<void>;
  markSectionComplete: (sectionId: number) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  currentCourse: null,
  currentSection: null,
  progress: [],
  isLoading: false,
  error: null,

  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Course[]>('/courses');
      set({ courses: data, isLoading: false });
    } catch {
      set({ error: 'Erro ao carregar cursos.', isLoading: false });
    }
  },

  fetchCourse: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Course>(`/courses/${slug}`);
      set({ currentCourse: data, isLoading: false });
    } catch {
      set({ error: 'Erro ao carregar o curso.', isLoading: false });
    }
  },

  fetchSection: async (sectionId: number) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Section>(`/sections/${sectionId}`);
      set({ currentSection: data, isLoading: false });
    } catch {
      set({ error: 'Erro ao carregar a seção.', isLoading: false });
    }
  },

  fetchProgress: async () => {
    try {
      const { data } = await api.get<UserProgress[]>('/progress');
      set({ progress: data });
    } catch {
      set({ progress: [] });
    }
  },

  markSectionComplete: async (sectionId: number) => {
    try {
      await api.post(`/progress/${sectionId}/complete`);
      const { data } = await api.get<UserProgress[]>('/progress');
      set({ progress: data });
    } catch {
      // Silently fail — progress sync is non-critical
    }
  },
}));
