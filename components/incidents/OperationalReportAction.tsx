"use client";

import { motion, useDragControls, useMotionValue } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useOperationalStore } from "@/lib/state/useOperationalStore";

type OperationalReportActionProps = {
  onOpen: () => void;
};

type WidgetPosition = {
  x: number;
  y: number;
};

const POSITION_STORAGE_KEY = "ganga-rakshak-operational-widget-position";
const COLLAPSE_STORAGE_KEY = "ganga-rakshak-operational-widget-collapsed";
const VIEWPORT_MARGIN = 18;
const EDGE_SNAP_THRESHOLD = 28;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function OperationalReportAction({ onOpen }: OperationalReportActionProps) {
  const activeRole = useOperationalStore((state) => state.activeRole);
  const openIncidentReviewPanel = useOperationalStore((state) => state.openIncidentReviewPanel);
  const canReview = activeRole !== "Citizen";
  const dragControls = useDragControls();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const persistedPositionRef = useRef<WidgetPosition>({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasLoadedPosition, setHasLoadedPosition] = useState(false);
  const dragMovedRef = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const clampPosition = (nextPosition: WidgetPosition) => {
    if (typeof window === "undefined") {
      return nextPosition;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    const widgetWidth = rect?.width ?? (isCollapsed ? 74 : 248);
    const widgetHeight = rect?.height ?? (isCollapsed ? 74 : canReview ? 126 : 94);
    const minX = -(window.innerWidth - widgetWidth - VIEWPORT_MARGIN);
    const maxX = -VIEWPORT_MARGIN;
    const minY = -(window.innerHeight - widgetHeight - VIEWPORT_MARGIN);
    const maxY = -VIEWPORT_MARGIN;

    return {
      x: clamp(nextPosition.x, minX, maxX),
      y: clamp(nextPosition.y, minY, maxY)
    };
  };

  const applyPosition = (nextPosition: WidgetPosition, persist = false) => {
    const clamped = clampPosition(nextPosition);
    persistedPositionRef.current = clamped;
    x.set(clamped.x);
    y.set(clamped.y);

    if (persist && typeof window !== "undefined") {
      window.sessionStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(clamped));
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPosition = window.sessionStorage.getItem(POSITION_STORAGE_KEY);
    const savedCollapse = window.sessionStorage.getItem(COLLAPSE_STORAGE_KEY);

    if (savedCollapse === "true") {
      setIsCollapsed(true);
    }

    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition) as WidgetPosition;
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          persistedPositionRef.current = parsed;
        }
      } catch {
        window.sessionStorage.removeItem(POSITION_STORAGE_KEY);
      }
    }

    setHasLoadedPosition(true);
  }, []);

  useLayoutEffect(() => {
    if (!hasLoadedPosition) return;
    applyPosition(persistedPositionRef.current);
  }, [hasLoadedPosition, isCollapsed, canReview]);

  useEffect(() => {
    if (!hasLoadedPosition || typeof window === "undefined") return;

    const updatePositionWithinViewport = () => {
      applyPosition(persistedPositionRef.current, true);
    };

    updatePositionWithinViewport();
    window.addEventListener("resize", updatePositionWithinViewport);
    return () => window.removeEventListener("resize", updatePositionWithinViewport);
  }, [hasLoadedPosition, isCollapsed, canReview]);

  const subtitle = useMemo(
    () => (activeRole === "Citizen" ? "River Issue Intake" : "Operational Incident Tools"),
    [activeRole]
  );
  const dockLabel = canReview ? "Operational Tools" : "Report Incident";
  const dockHint = canReview ? "Command dock" : "Rapid intake";

  const handleCollapseToggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
    }
  };

  const handlePrimaryAction = () => {
    if (dragMovedRef.current || isDragging) return;
    onOpen();
  };

  const handleReviewAction = () => {
    if (dragMovedRef.current || isDragging) return;
    openIncidentReviewPanel();
  };

  return (
    <motion.div
      ref={containerRef}
      className={`report-action-stack ${isCollapsed ? "collapsed" : ""}`}
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.02}
      initial={false}
      style={{ x, y }}
      whileHover={{ scale: isCollapsed ? 1.03 : 1.015, y: isCollapsed ? -2 : 0 }}
      transition={{
        x: { type: "spring", stiffness: 520, damping: 42, mass: 0.7 },
        y: { type: "spring", stiffness: 520, damping: 42, mass: 0.7 },
        scale: { type: "spring", stiffness: 320, damping: 24 }
      }}
      onDragStart={() => {
        dragMovedRef.current = false;
        setIsDragging(true);
      }}
      onDrag={(_, info) => {
        if (Math.abs(info.offset.x) > 5 || Math.abs(info.offset.y) > 5) {
          dragMovedRef.current = true;
        }
      }}
      onDragEnd={(_, info) => {
        const draggedPosition = {
          x: persistedPositionRef.current.x + info.offset.x,
          y: persistedPositionRef.current.y + info.offset.y
        };
        const clamped = clampPosition(draggedPosition);
        const distanceToRight = Math.abs(clamped.x - -VIEWPORT_MARGIN);
        const minLeft = -(window.innerWidth - (containerRef.current?.getBoundingClientRect().width ?? 248) - VIEWPORT_MARGIN);
        const distanceToLeft = Math.abs(clamped.x - minLeft);
        const snappedX =
          Math.min(distanceToLeft, distanceToRight) <= EDGE_SNAP_THRESHOLD
            ? distanceToLeft < distanceToRight
              ? minLeft
              : -VIEWPORT_MARGIN
            : clamped.x;

        applyPosition({ x: snappedX, y: clamped.y }, true);
        setTimeout(() => {
          setIsDragging(false);
          dragMovedRef.current = false;
        }, 120);
      }}
    >
      {isCollapsed ? (
        <motion.button
          type="button"
          className="report-action report-action-compact"
          onClick={() => {
            setIsCollapsed(false);
            if (typeof window !== "undefined") {
              window.sessionStorage.setItem(COLLAPSE_STORAGE_KEY, "false");
            }
          }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="report-action-core">+</span>
        </motion.button>
      ) : (
        <>
          <div className="report-action-dock">
            <button
              type="button"
              className="report-action-grabber"
              onPointerDown={(event) => dragControls.start(event)}
              aria-label="Drag operational command dock"
            >
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </button>

            <button
              type="button"
              className="report-action-launcher"
              onClick={handlePrimaryAction}
            >
              <span className="report-action-core">+</span>
              <span className="report-action-copy">
                <strong>{dockLabel}</strong>
                <span>{dockHint}</span>
              </span>
            </button>

            <button
              type="button"
              className="report-action-close"
              onClick={handleCollapseToggle}
              aria-label="Minimize operational command widget"
            >
              <span />
            </button>
          </div>

          <motion.div
            className="report-action-body"
            initial={false}
            animate={{
              opacity: 1,
              height: "auto"
            }}
            transition={{ opacity: { duration: 0.18 }, height: { duration: 0.22, ease: "easeOut" } }}
          >
            {canReview ? (
              <button type="button" className="report-secondary-action" onClick={handleReviewAction}>
                Review workspace
              </button>
            ) : null}
            <span className="report-action-meta">{subtitle}</span>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
