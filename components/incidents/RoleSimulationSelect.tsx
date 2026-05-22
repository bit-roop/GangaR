"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { useOperationalStore } from "@/lib/state/useOperationalStore";
import type { SimulationRole } from "@/types/dashboard";

const roleOptions: SimulationRole[] = [
  "Citizen",
  "Environmental Monitor / Volunteer",
  "Analyst",
  "Admin"
];

type RoleSimulationSelectProps = {
  compact?: boolean;
};

export function RoleSimulationSelect({ compact = false }: RoleSimulationSelectProps) {
  const fallbackRole: SimulationRole = "Citizen";
  const activeRole = useOperationalStore((state) => state.activeRole ?? fallbackRole);
  const setActiveRole = useOperationalStore((state) => state.setActiveRole);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const safeRole = roleOptions.includes(activeRole) ? activeRole : fallbackRole;
  const compactLabel = useMemo(() => {
    if (safeRole === "Environmental Monitor / Volunteer") return "Volunteer";
    return safeRole;
  }, [safeRole]);

  useEffect(() => {
    if (!compact || !isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [compact, isOpen]);

  if (compact) {
    return (
      <div ref={containerRef} className="role-simulation-popover">
        <button
          type="button"
          className={`role-simulation-trigger ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen((current) => !current)}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <span className="role-simulation-trigger-copy">
            <span>Simulation Mode</span>
            <strong>{compactLabel}</strong>
          </span>
          <span className="role-simulation-trigger-caret" aria-hidden="true">
            ▾
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              className="role-simulation-menu"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              <p className="role-simulation-menu-label">Simulation Mode</p>
              <div className="role-simulation-menu-list" role="menu" aria-label="Role simulation">
                {roleOptions.map((role) => (
                  <button
                    key={role}
                    type="button"
                    role="menuitemradio"
                    aria-checked={safeRole === role}
                    className={`role-simulation-option ${safeRole === role ? "active" : ""}`}
                    onClick={() => {
                      setActiveRole?.(role);
                      setIsOpen(false);
                    }}
                  >
                    <span>{role}</span>
                    {safeRole === role ? <strong>Active</strong> : null}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`role-simulation-select ${compact ? "compact" : ""}`}>
      <span>Role simulation</span>
      <select
        value={safeRole}
        onChange={(event) => setActiveRole?.(event.target.value as SimulationRole)}
      >
        {roleOptions.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>
  );
}
