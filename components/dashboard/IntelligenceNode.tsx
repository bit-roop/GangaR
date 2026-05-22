"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type IntelligenceNodeProps = {
  label: string;
  hidden?: boolean;
  onActivate: () => void;
};

type Position = { x: number; y: number };

const STORAGE_KEY = "ganga-rakshak-intelligence-node";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function IntelligenceNode({ label, hidden, onActivate }: IntelligenceNodeProps) {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const moved = useRef(false);

  useEffect(() => {
    const initialX = window.innerWidth - 110;
    const initialY = 96;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as Position) : null;

    setPosition(
      parsed ?? {
        x: initialX,
        y: initialY
      }
    );
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  }, [mounted, position]);

  useEffect(() => {
    if (!mounted) return;

    const onMove = (event: PointerEvent) => {
      if (!dragging.current) return;
      moved.current = true;
      const nextX = clamp(event.clientX - dragOffset.current.x, 8, window.innerWidth - 72);
      const nextY = clamp(event.clientY - dragOffset.current.y, 8, window.innerHeight - 72);
      setPosition({ x: nextX, y: nextY });
    };

    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setPosition((current) => {
        const snapLeft = current.x < window.innerWidth / 2;
        return {
          x: snapLeft ? 12 : window.innerWidth - 76,
          y: clamp(current.y, 12, window.innerHeight - 76)
        };
      });
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("resize", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", onUp);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <motion.button
      type="button"
      className={`intelligence-node ${hidden ? "hidden" : ""}`}
      style={{ left: position.x, top: position.y }}
      animate={{
        opacity: hidden ? 0 : 1,
        scale: hidden ? 0.94 : 1
      }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onClick={() => {
        if (!dragging.current && !moved.current) onActivate();
        moved.current = false;
      }}
      onPointerDown={(event) => {
        dragging.current = true;
        moved.current = false;
        dragOffset.current = {
          x: event.clientX - position.x,
          y: event.clientY - position.y
        };
      }}
      aria-label={`${label} intelligence beacon`}
    >
      <span className="node-pulse" />
      <span className="node-core">
        <span className="node-glyph">◌</span>
      </span>
      <span className="node-label">{label}</span>
    </motion.button>
  );
}
