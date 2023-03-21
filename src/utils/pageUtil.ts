export function createPagination(perPage: number, total: number) {
  return { page: 1, perPage, total };
}

export function getPageNumberRange(currentPage: number, lastPage: number) {
  const result: number[] = [];
  for (let page = 1; page <= lastPage; page++) {
    result.push(page);
  }
  return result;
}

export function getItemsByPage<T>(items: T[], page: number, perPage: number) {
  const offset = perPage * (page - 1);
  const itemsByPage = items.slice(offset, offset + perPage);
  return [...itemsByPage];
}
