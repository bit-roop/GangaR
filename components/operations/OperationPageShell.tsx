type OperationPageShellProps = {
  title: string;
  subtitle: string;
};

export function OperationPageShell({ title, subtitle }: OperationPageShellProps) {
  return (
    <div className="error-state">
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <span>Prepared for a dedicated operational page in a later phase.</span>
    </div>
  );
}
