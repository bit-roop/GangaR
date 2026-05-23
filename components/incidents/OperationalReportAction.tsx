"use client";

import { motion, useDragControls, useMotionValue } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useOperationalStore } from "@/lib/state/useOperationalStore";

type OperationalReportActionProps = {
  onOpen: () => void;
};

type WidgetPosition = {
  x: number;
  y: number;
};

type DragBounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

const POSITION_STORAGE_KEY = "ganga-rakshak-operational-widget-position";
const COLLAPSE_STORAGE_KEY = "ganga-rakshak-operational-widget-collapsed";
const VIEWPORT_MARGIN = 18;
const VIEWPORT_SAFETY_GAP = 2;
const EDGE_SNAP_THRESHOLD = 28;
const DEFAULT_WIDTH = 248;
const COLLAPSED_WIDTH = 74;
const DEFAULT_HEIGHT = 126;
const COLLAPSED_HEIGHT = 74;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getViewportSize() {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  const viewport = window.visualViewport;
  return {
    width: Math.floor(Math.min(window.innerWidth, document.documentElement.clientWidth, viewport?.width ?? window.innerWidth)),
    height: Math.floor(Math.min(window.innerHeight, document.documentElement.clientHeight, viewport?.height ?? window.innerHeight))
  };
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
  const [dragBounds, setDragBounds] = useState<DragBounds>({
    left: VIEWPORT_MARGIN,
    right: VIEWPORT_MARGIN,
    top: VIEWPORT_MARGIN,
    bottom: VIEWPORT_MARGIN
  });
  const dragMovedRef = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const getWidgetSize = () => {
    if (isCollapsed) {
      return {
        width: COLLAPSED_WIDTH,
        height: COLLAPSED_HEIGHT
      };
    }

    const rect = containerRef.current?.getBoundingClientRect();
    return {
      width: rect?.width ?? DEFAULT_WIDTH,
      height: rect?.height ?? (canReview ? DEFAULT_HEIGHT : 94)
    };
  };

  const getDragBounds = () => {
    if (typeof window === "undefined") {
      return {
        left: VIEWPORT_MARGIN,
        right: VIEWPORT_MARGIN,
        top: VIEWPORT_MARGIN,
        bottom: VIEWPORT_MARGIN
      };
    }

    const { width, height } = getWidgetSize();
    const viewport = getViewportSize();

    return {
      left: VIEWPORT_MARGIN,
      right: Math.max(VIEWPORT_MARGIN, viewport.width - width - VIEWPORT_MARGIN - VIEWPORT_SAFETY_GAP),
      top: VIEWPORT_MARGIN,
      bottom: Math.max(VIEWPORT_MARGIN, viewport.height - height - VIEWPORT_MARGIN - VIEWPORT_SAFETY_GAP)
    };
  };

  const getDefaultPosition = () => {
    if (typeof window === "undefined") {
      return { x: 0, y: 0 };
    }

    const bounds = getDragBounds();
    return {
      x: bounds.right,
      y: bounds.bottom
    };
  };

  const clampPosition = (nextPosition: WidgetPosition) => {
    if (typeof window === "undefined") {
      return nextPosition;
    }

    const bounds = getDragBounds();

    return {
      x: clamp(nextPosition.x, bounds.left, bounds.right),
      y: clamp(nextPosition.y, bounds.top, bounds.bottom)
    };
  };

  const updateBounds = () => {
    const nextBounds = getDragBounds();
    setDragBounds(nextBounds);
    return nextBounds;
  };

  const applyPosition = (nextPosition: WidgetPosition, persist = false) => {
    updateBounds();
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
          persistedPositionRef.current =
            parsed.x < 0 || parsed.y < 0
              ? getDefaultPosition()
              : parsed;
        }
      } catch {
        window.sessionStorage.removeItem(POSITION_STORAGE_KEY);
      }
    }

    setHasLoadedPosition(true);
  }, []);

  useLayoutEffect(() => {
    if (!hasLoadedPosition) return;
    const nextPosition = isCollapsed
      ? getDefaultPosition()
      : persistedPositionRef.current.x === 0 && persistedPositionRef.current.y === 0
        ? getDefaultPosition()
        : persistedPositionRef.current;
    applyPosition(nextPosition, true);
  }, [hasLoadedPosition, isCollapsed, canReview]);

  useEffect(() => {
    if (!hasLoadedPosition || typeof window === "undefined") return;

    const updatePositionWithinViewport = () => {
      applyPosition(isCollapsed ? getDefaultPosition() : persistedPositionRef.current, true);
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

  if (!hasLoadedPosition) {
    return null;
  }

  const handleCollapseToggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
    }
    if (next) {
      window.requestAnimationFrame(() => {
        applyPosition(getDefaultPosition(), true);
      });
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

  const dock = (
    <motion.div
      ref={containerRef}
      className={`report-action-stack ${isCollapsed ? "collapsed" : ""}`}
      drag
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={dragBounds}
      dragMomentum={false}
      dragElastic={0}
      initial={false}
      style={isCollapsed ? { x: 0, y: 0 } : { x, y }}
      whileHover={{ scale: isCollapsed ? 1.03 : 1.015 }}
      transition={{
        x: { type: "spring", stiffness: 520, damping: 42, mass: 0.7 },
        y: { type: "spring", stiffness: 520, damping: 42, mass: 0.7 },
        scale: { type: "spring", stiffness: 320, damping: 24 }
      }}
      onDragStart={() => {
        updateBounds();
        dragMovedRef.current = false;
        setIsDragging(true);
      }}
      onDrag={(_, info) => {
        if (Math.abs(info.offset.x) > 5 || Math.abs(info.offset.y) > 5) {
          dragMovedRef.current = true;
        }
        const clamped = clampPosition({
          x: persistedPositionRef.current.x + info.offset.x,
          y: persistedPositionRef.current.y + info.offset.y
        });
        x.set(clamped.x);
        y.set(clamped.y);
      }}
      onDragEnd={(_, info) => {
        const bounds = updateBounds();
        const draggedPosition = {
          x: persistedPositionRef.current.x + info.offset.x,
          y: persistedPositionRef.current.y + info.offset.y
        };
        const clamped = clampPosition(draggedPosition);
        const leftEdge = bounds.left;
        const rightEdge = bounds.right;
        const distanceToRight = Math.abs(clamped.x - rightEdge);
        const distanceToLeft = Math.abs(clamped.x - leftEdge);
        const snappedX =
          Math.min(distanceToLeft, distanceToRight) <= EDGE_SNAP_THRESHOLD
            ? distanceToLeft < distanceToRight
              ? leftEdge
              : rightEdge
            : clamped.x;

        applyPosition(isCollapsed ? getDefaultPosition() : { x: snappedX, y: clamped.y }, true);
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
            window.requestAnimationFrame(() => {
              applyPosition(persistedPositionRef.current, true);
            });
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

  return createPortal(dock, document.body);
}
