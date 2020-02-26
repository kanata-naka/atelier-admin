import React from "react"
import { Pagination } from "react-bootstrap"

/**
 * ページネーション
 */
export default class extends React.Component {
  /**
   * 現在のページ番号
   */
  get currentPageNumber() {
    const { pagination } = this.props
    return pagination.offset / pagination.perPage + 1
  }

  /**
   * 最後のページ番号
   */
  get lastPageNumber() {
    const { pagination } = this.props
    return Math.ceil(pagination.size / pagination.perPage)
  }

  /**
   * 指定したページに切り替える
   * @param pageNumber ページ番号
   */
  movePage(pageNumber) {
    const { pagination, onMovePage } = this.props
    onMovePage({
      ...pagination,
      offset: pagination.perPage * (pageNumber - 1)
    })
  }

  /**
   * 各ページのボタンを描画する
   */
  renderPageNumberButtons() {
    const pages = []
    for (let pageNumber = 1; pageNumber <= this.lastPageNumber; pageNumber++) {
      pages.push(
        <Pagination.Item
          key={pageNumber}
          onClick={() => this.movePage(pageNumber)}
          active={pageNumber === this.currentPageNumber}>
          {pageNumber}
        </Pagination.Item>
      )
    }
    return pages
  }

  render() {
    return (
      <div>
        <Pagination>
          <Pagination.Prev
            onClick={() => this.movePage(this.currentPageNumber - 1)}
            disabled={this.currentPageNumber === 1}
          />
          {this.renderPageNumberButtons()}
          <Pagination.Next
            onClick={() => this.movePage(this.currentPageNumber + 1)}
            disabled={this.currentPageNumber === this.lastPageNumber}
          />
        </Pagination>
      </div>
    )
  }
}
