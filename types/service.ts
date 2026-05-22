export type ServiceResult<T> = {
  data: T;
  lastUpdated: string;
  source: "mock" | "api";
};
