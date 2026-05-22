"use client";

import { createContext, useContext } from "react";

import type { DashboardData } from "@/types/dashboard";

const DashboardDataContext = createContext<DashboardData | null>(null);

type DashboardDataProviderProps = {
  data: DashboardData;
  children: React.ReactNode;
};

export function DashboardDataProvider({ data, children }: DashboardDataProviderProps) {
  return <DashboardDataContext.Provider value={data}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData() {
  const value = useContext(DashboardDataContext);

  if (!value) {
    throw new Error("useDashboardData must be used within DashboardDataProvider");
  }

  return value;
}
