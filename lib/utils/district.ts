export function groupByDistrict<T extends { district: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    acc[item.district] ??= [];
    acc[item.district].push(item);
    return acc;
  }, {});
}
