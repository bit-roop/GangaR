import { cn } from "@/lib/utils/cn";
import type { BottomNavItem } from "@/types/dashboard";

type MobileBottomNavProps = {
  items: BottomNavItem[];
};

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  return (
    <nav className="mobile-nav">
      {items.map((item) => (
        <a key={`${item.label}-${item.icon}`} className={cn("nav-pill", item.center && "nav-pill-center", item.active && "active")}>
          <span className={item.center ? "nav-plus" : "nav-icon"}>{item.icon}</span>
          {!item.center ? <span>{item.label}</span> : null}
        </a>
      ))}
    </nav>
  );
}
