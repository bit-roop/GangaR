"use client";

import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  title: string;
  detail?: string;
  tone: ToastTone;
};

type UiFeedbackState = {
  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, "id">) => void;
  dismissToast: (id: string) => void;
};

export const useUiFeedbackStore = create<UiFeedbackState>((set) => ({
  toasts: [],
  pushToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }));

    window.setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((item) => item.id !== id)
      }));
    }, 3600);
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((item) => item.id !== id)
    }))
}));
