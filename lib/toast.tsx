"use client";

import { toast as sonnerToast } from "sonner";

type SonnerToastOptions = Parameters<typeof sonnerToast.success>[1];

type ToastOptions = {
  description?: string;
  id?: string | number;
  action?: {
    label: string;
    onClick: () => void;
  };
} & Omit<SonnerToastOptions, "description">;

/**
 * Reusable toast utility functions
 * Usage:
 * - toast.success("Message")
 * - toast.success("Title", { description: "Description" })
 * - toast.error("Error message", { id: toastId })
 */
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, options);
  },

  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, options);
  },

  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, options);
  },

  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, options);
  },

  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, options);
  },
};

