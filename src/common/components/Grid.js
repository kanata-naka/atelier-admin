import React, { useState, useEffect, useCallback } from "react"
import { Table } from "react-bootstrap"

export default props => {
  const { className, rowClassName, items, selectedByItemId, onSelect } = props
  const [checkedAll, setCheckedAll] = useState(false)

  useEffect(() => {
    // チェックボックス以外の契機で選択中の項目が変更された場合
    if (
      Object.entries(selectedByItemId).filter(entry => entry[1]).length ===
      items.length
    ) {
      setCheckedAll(true)
    } else {
      setCheckedAll(false)
    }
  }, [selectedByItemId])

  // 各項目のチェックボックスを押下した際の処理
  const handleCheck = useCallback(
    id => {
      let nextSelectedByItemId
      if (id in selectedByItemId) {
        nextSelectedByItemId = { ...selectedByItemId }
        delete nextSelectedByItemId[id]
      } else {
        nextSelectedByItemId = { ...selectedByItemId, [id]: true }
      }
      onSelect(nextSelectedByItemId)
    },
    [selectedByItemId]
  )

  // 一番上のチェックボックスを押下した際の処理
  const handleCheckAll = useCallback(() => {
    if (checkedAll) {
      // 全てチェックされている状態なら全てチェックを外す
      onSelect({})
    } else {
      // 1つ以上チェックされていない状態なら全てチェックする
      const nextSelectedByItemId = {}
      items.forEach(item => {
        nextSelectedByItemId[item.id] = true
      })
      onSelect(nextSelectedByItemId)
    }
  }, [checkedAll])

  return (
    <Table className={`grid ${className}`}>
      <HeaderRow
        checkedAll={checkedAll}
        handleCheckAll={handleCheckAll}
        {...props}
      />
      <tbody>
        {items.map((item, itemIndex) => (
          <ItemRow
            {...props}
            key={itemIndex}
            item={item}
            index={itemIndex}
            className={rowClassName && rowClassName(item)}
            handleCheck={handleCheck}
          />
        ))}
      </tbody>
    </Table>
  )
}

// ヘッダー行
const HeaderRow = ({ columns, checkedAll, onSelect, handleCheckAll }) => {
  return (
    <thead>
      <tr className="grid-row">
        {onSelect && (
          <th>
            <input
              type="checkbox"
              className="checkbox"
              checked={checkedAll}
              onChange={handleCheckAll}
            />
          </th>
        )}
        {columns.map((column, columnIndex) => {
          return <th key={columnIndex}>{column.title}</th>
        })}
      </tr>
    </thead>
  )
}

// 各項目の行
const ItemRow = ({
  item,
  index,
  columns,
  selectedByItemId,
  onSelect,
  handleCheck,
  className
}) => {
  return (
    <tr className={`grid-row ${className}`}>
      {// 選択した際の処理が設定されている場合のみ左端にチェックボックスを表示する
      onSelect && (
        <td className="grid-cell column-checks">
          <input
            type="checkbox"
            className="checkbox"
            checked={item.id in selectedByItemId}
            onChange={() => handleCheck(item.id)}
          />
        </td>
      )}
      {columns.map((column, columnIndex) => {
        return (
          <td key={columnIndex} className={`grid-cell ${column.className}`}>
            {column.render(item, index)}
          </td>
        )
      })}
    </tr>
  )
}
