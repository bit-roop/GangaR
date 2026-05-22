import type { BottomNavItem } from "@/types/dashboard";

type DesktopFooterProps = {
  items: BottomNavItem[];
};

export function DesktopFooter({ items }: DesktopFooterProps) {
  return (
    <footer className="desktop-footer">
      {items.map((item) => (
        <a key={`${item.label}-${item.icon}`} className="footer-link">
          <span className={item.center ? "footer-plus" : "footer-icon"}>{item.icon}</span>
          {!item.center ? <span>{item.label}</span> : null}
        </a>
      ))}
    </footer>
  );
}
