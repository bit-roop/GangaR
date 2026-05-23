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
const NODE_SIZE = 62;
const NODE_MARGIN = 18;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSafePosition(position: Position): Position {
  const width = document.documentElement.clientWidth || window.innerWidth;
  const height = document.documentElement.clientHeight || window.innerHeight;

  return {
    x: clamp(position.x, NODE_MARGIN, Math.max(NODE_MARGIN, width - NODE_SIZE - NODE_MARGIN)),
    y: clamp(position.y, NODE_MARGIN, Math.max(NODE_MARGIN, height - NODE_SIZE - NODE_MARGIN))
  };
}

export function IntelligenceNode({ label, hidden, onActivate }: IntelligenceNodeProps) {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const moved = useRef(false);

  useEffect(() => {
    const initialX = (document.documentElement.clientWidth || window.innerWidth) - NODE_SIZE - NODE_MARGIN;
    const initialY = 96;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as Position) : null;

    setPosition(getSafePosition(parsed ?? { x: initialX, y: initialY }));
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
      setPosition(getSafePosition({
        x: event.clientX - dragOffset.current.x,
        y: event.clientY - dragOffset.current.y
      }));
    };

    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setPosition((current) => getSafePosition(current));
    };

    const onResize = () => {
      setPosition((current) => getSafePosition(current));
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", onResize);
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
