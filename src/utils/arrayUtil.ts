export function sortBy<T>(array: T[], field: keyof T, order: "asc" | "desc") {
  return array.sort((a, b) => (a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0) * (order === "desc" ? -1 : 1));
}
