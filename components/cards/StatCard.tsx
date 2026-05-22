import { cn } from "@/lib/utils/cn";
import type { Stat } from "@/types/dashboard";

type StatCardProps = {
  stat: Stat;
};

export function StatCard({ stat }: StatCardProps) {
  return (
    <article className="stat-card">
      <p className="stat-title">{stat.title}</p>
      <div className={cn("stat-value", stat.tone)}>
        {stat.value}
        {stat.suffix ? <span>{stat.suffix}</span> : null}
      </div>
      <p className={cn("stat-detail", stat.tone)}>
        {stat.detail.split("\n").map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
      {stat.trendLabel ? <span className="stat-trend">{stat.trendLabel}</span> : null}
      <p className="stat-time">{stat.updatedAt}</p>
    </article>
  );
}
