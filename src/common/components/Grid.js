import React from "react"
import { Table } from "react-bootstrap"

export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // 全てチェックされているかどうか
      checkedAll: false
    }
  }

  componentDidUpdate(prevProps) {
    // チェックボックス以外の契機で選択中の項目が変更された場合
    if (
      Object.entries(prevProps.selectedByItemId).length !==
      Object.entries(this.props.selectedByItemId).length
    ) {
      if (
        Object.entries(this.props.selectedByItemId).filter(entry => entry[1])
          .length === this.props.items.length
      ) {
        this.setState({ checkedAll: true })
      } else {
        this.setState({ checkedAll: false })
      }
    }
  }

  /**
   * 各項目のチェックボックスを変更した際の処理
   */
  onCheck(id) {
    const { selectedByItemId, onSelect } = this.props
    let _selectedByItemId
    if (id in selectedByItemId) {
      _selectedByItemId = { ...selectedByItemId }
      delete _selectedByItemId[id]
    } else {
      _selectedByItemId = { ...selectedByItemId, [id]: true }
    }
    onSelect(_selectedByItemId)
  }

  /**
   * 一番上のチェックボックスを変更した際の処理
   */
  onCheckAll() {
    const { items, onSelect } = this.props
    const { checkedAll } = this.state

    if (checkedAll) {
      // 全てチェックされている状態なら全てチェックを外す
      onSelect({})
      // this.setState({checkedAll: false})
    } else {
      // 1つ以上チェックされていない状態なら全てチェックする
      const selectedByItemId = {}
      for (let item of items) {
        selectedByItemId[item.id] = true
      }
      onSelect(selectedByItemId)
      // this.setState({checkedAll: true})
    }
  }

  render() {
    const { items, selectedByItemId, ...props } = this.props
    return (
      <Table {...props}>
        {this.renderHeaderRow()}
        <tbody>
          {items.map((item, itemIndex) => this.renderItemRow(item, itemIndex))}
        </tbody>
      </Table>
    )
  }

  renderHeaderRow() {
    const { columns, onSelect } = this.props
    const { checkedAll } = this.state
    return (
      <thead>
        <tr>
          {onSelect && (
            <th>
              <input
                type="checkbox"
                className="checkbox"
                checked={checkedAll}
                onChange={() => this.onCheckAll()}
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

  renderItemRow(item, itemIndex) {
    const { columns, onSelect, selectedByItemId } = this.props
    return (
      <tr key={itemIndex} className={item.editing ? "editing" : ""}>
        {// 選択したときの処理が設定されている場合のみ左端にチェックボックスを表示する
        onSelect && (
          <td className="column-checks">
            <input
              type="checkbox"
              className="checkbox"
              checked={item.id in selectedByItemId}
              onChange={() =>
                this.onCheck(item.id, { selectedByItemId, onSelect })
              }
            />
          </td>
        )}
        {columns.map((column, columnIndex) => {
          return (
            <td key={columnIndex} className={column.className}>
              {column.render(item)}
            </td>
          )
        })}
      </tr>
    )
  }
}
