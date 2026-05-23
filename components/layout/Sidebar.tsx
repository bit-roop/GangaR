"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";
import type { SidebarItem } from "@/types/dashboard";

type SidebarProps = {
  items: SidebarItem[];
};

export function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href={routes.dashboard} className="brand" aria-label="Go to GangaRakshak AI dashboard">
        <div className="brand-mark">🌿</div>
        <div>
          <h1>GangaRakshak AI</h1>
          <p>Our River. Our Future.</p>
        </div>
      </Link>

      <nav className="menu">
        {items.map((item) => {
          const isActive = item.href
            ? pathname === item.href || (item.href === routes.dashboard && pathname === "/")
            : item.active;
          const content = (
            <>
              <span className="menu-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </>
          );

          return item.href ? (
            <Link key={item.label} href={item.href} className={cn("menu-item", isActive && "active")}>
              {content}
            </Link>
          ) : (
            <a key={item.label} className={cn("menu-item", isActive && "active")}>
              {content}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
