type AlertCardProps = {
  title: string;
  count: number;
  items: string[];
};

export function AlertCard({ title, count, items }: AlertCardProps) {
  return (
    <article className="stat-card">
      <p className="stat-title">{title}</p>
      <div className="stat-value red">{count}</div>
      <p className="stat-detail red">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </p>
      <p className="stat-time">Last updated: 1 hr ago</p>
    </article>
  );
}
