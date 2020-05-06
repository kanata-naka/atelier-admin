import { createSelector } from "reselect"

export const getItemsByPage = createSelector(
  [state => state.items, state => state.pagination],
  (items, pagination) => {
    const itemsByPage = items.slice(
      pagination.offset,
      pagination.offset + pagination.perPage
    )
    return [...itemsByPage]
  }
)

export const getItemById = createSelector(
  [state => state.items, state => state.editingItemId],
  (items, editingItemId) => {
    return items.find(_item => _item.id === editingItemId)
  }
)
