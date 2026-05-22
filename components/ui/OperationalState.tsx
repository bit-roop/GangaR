import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  detail: string;
  compact?: boolean;
  action?: ReactNode;
};

export function OperationalEmptyState({ title, detail, compact = false, action }: EmptyStateProps) {
  return (
    <div className={`operational-empty-state ${compact ? "compact" : ""}`}>
      <strong>{title}</strong>
      <p>{detail}</p>
      {action ? <div className="operational-empty-action">{action}</div> : null}
    </div>
  );
}

export function OperationalSkeletonRows({ rows = 3, compact = false }: { rows?: number; compact?: boolean }) {
  return (
    <div className={`operational-skeleton-stack ${compact ? "compact" : ""}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="operational-skeleton-card">
          <div className="operational-skeleton-line line-lg" />
          <div className="operational-skeleton-line line-md" />
          <div className="operational-skeleton-line line-sm" />
        </div>
      ))}
    </div>
  );
}

export function OperationalDetailSkeleton() {
  return (
    <div className="operational-skeleton-stack compact">
      <div className="operational-skeleton-card">
        <div className="operational-skeleton-line line-lg" />
        <div className="operational-skeleton-badges" />
        <div className="operational-skeleton-media" />
        <div className="operational-skeleton-line line-md" />
        <div className="operational-skeleton-line line-md" />
      </div>
    </div>
  );
}
