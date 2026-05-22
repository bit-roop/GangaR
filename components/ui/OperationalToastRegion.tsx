"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useUiFeedbackStore } from "@/lib/state/useUiFeedbackStore";

export function OperationalToastRegion() {
  const { toasts, dismissToast } = useUiFeedbackStore();

  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast-card toast-${toast.tone}`}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div>
              <strong>{toast.title}</strong>
              {toast.detail ? <p>{toast.detail}</p> : null}
            </div>
            <button type="button" onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification">
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
