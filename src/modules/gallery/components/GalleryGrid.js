import React, { useRef, useEffect } from "react"
import { Button, Badge } from "react-bootstrap"
import { adjust } from "../../../utils/domUtils"
import Grid from "../../../common/components/Grid"
import Pagination from "../../../common/components/Pagination"

export default class extends React.Component {
  render() {
    const {
      items,
      selectedByItemId,
      pagination,
      movePage,
      select,
      onEdit,
      onCancelEdit,
      onDeleteSelected,
      dirty
    } = this.props
    return (
      <div>
        <div className="operation-area">
          <Button
            variant="danger"
            type="button"
            disabled={!Object.keys(selectedByItemId).length}
            onClick={() => onDeleteSelected(selectedByItemId)}>
            {"チェックした作品を削除"}
          </Button>
        </div>
        <Grid
          items={items}
          selectedByItemId={selectedByItemId}
          onSelect={select}
          className="gallery-grid"
          striped
          columns={[
            {
              title: "タイトル",
              className: "column-title",
              render: item => (
                <span className="title__fixed-label">{item.title}</span>
              )
            },
            {
              title: "画像",
              className: "column-images",
              render: item => {
                return item.images.map((image, imageIndex) => (
                  <ThumnailImage key={imageIndex} image={image} />
                ))
              }
            },
            {
              title: "説明",
              className: "column-description",
              render: item => (
                <span className="description__fixed-label">
                  {item.description}
                </span>
              )
            },
            {
              className: "column-date",
              render: item => (
                <div className="dates">
                  <div className="date-row">
                    <Badge variant="secondary">投稿日時</Badge>
                    <span className="date-value">{item.createdAt}</span>
                  </div>
                  <div className="date-row">
                    <Badge variant="secondary">更新日時</Badge>
                    <span className="date-value">{item.updatedAt}</span>
                  </div>
                </div>
              )
            },
            {
              className: "column-operation-area",
              render: item => {
                return item.editing ? (
                  <Button
                    variant="outline-danger"
                    type="button"
                    onClick={() => onCancelEdit(dirty)}>
                    {"キャンセル"}
                  </Button>
                ) : (
                  <Button
                    variant="outline-warning"
                    type="button"
                    onClick={() => onEdit(item.id, dirty)}>
                    {"編集"}
                  </Button>
                )
              }
            }
          ]}
        />
        <Pagination
          pagination={pagination}
          items={items}
          onMovePage={movePage}
        />
      </div>
    )
  }
}

/**
 * サムネイル画像
 */
const ThumnailImage = props => {
  const { image } = props
  const containerRef = useRef(null)

  useEffect(() => {
    // componentDidMount と同じタイミングで実行する
    const containerElement = containerRef.current
    const innerElement = containerElement.children[0]
    innerElement.onload = () => {
      adjust(containerElement, innerElement)
    }
  }, [])

  return (
    <a href={image.url} target="_blank">
      <div className="image-container" ref={containerRef}>
        <img className="image" src={image.url} />
      </div>
    </a>
  )
}
