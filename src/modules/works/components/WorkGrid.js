import React, { useRef } from "react"
import { Button, Badge } from "react-bootstrap"
import { formatDateTimeFromUnixTimestamp } from "../../../utils/dateUtil"
import { useAdjustElementWidth } from "../../../common/hooks"
import Grid from "../../../common/components/Grid"
import Pagination from "../../../common/components/Pagination"

export default ({
  items,
  pagination,
  selectedByItemId,
  onEdit,
  onCancelEdit,
  onDeleteSelected,
  // -- actions --
  select,
  movePage,
  // -- Redux Form --
  dirty
}) => {
  return (
    <div>
      <WorkGridControl
        selectedByItemId={selectedByItemId}
        onDeleteSelected={onDeleteSelected}
      />
      <Grid
        items={items}
        selectedByItemId={selectedByItemId}
        onSelect={select}
        className="work-grid"
        striped
        rowClassName={item =>
          `${!item.editing && item.pickupFlag ? "pickup" : ""} ${
            item.editing ? "editing" : ""
          }`
        }
        columns={[
          {
            title: "タイトル",
            className: "column-title",
            render: item => (
              <span className="title__fixed-label">{item.title}</span>
            )
          },
          {
            title: "出版日",
            className: "column-published-date",
            render: item => (
              <span className="published-date__fixed-label">
                {formatDateTimeFromUnixTimestamp(
                  item.publishedDate,
                  "YYYY/MM/DD"
                )}
              </span>
            )
          },
          {
            title: "画像",
            className: "column-images",
            render: item => {
              return item.images.map((image, imageIndex) => (
                <WorkGridColumnImage key={imageIndex} image={image} />
              ))
            }
          },
          {
            title: "説明",
            className: "column-description",
            render: item => (
              <div className="description__fixed-label">{item.description}</div>
            )
          },
          {
            className: "column-date",
            render: item => (
              <div className="dates">
                <div className="date-row">
                  <Badge variant="secondary">投稿日時</Badge>
                  <span className="date-value">
                    {formatDateTimeFromUnixTimestamp(item.createdAt)}
                  </span>
                </div>
                <div className="date-row">
                  <Badge variant="secondary">更新日時</Badge>
                  <span className="date-value">
                    {formatDateTimeFromUnixTimestamp(item.updatedAt)}
                  </span>
                </div>
              </div>
            )
          },
          {
            className: "column-controls",
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
      <Pagination pagination={pagination} items={items} onMovePage={movePage} />
    </div>
  )
}

const WorkGridControl = ({ selectedByItemId, onDeleteSelected }) => {
  return (
    <div className="controls">
      <Button
        variant="danger"
        type="button"
        disabled={!Object.keys(selectedByItemId).length}
        onClick={() => onDeleteSelected(selectedByItemId)}>
        {"チェックした作品を削除"}
      </Button>
    </div>
  )
}

const WorkGridColumnImage = ({ image }) => {
  const containerRef = useRef(null)
  const imageRef = useRef(null)
  useAdjustElementWidth(containerRef, imageRef, [image])

  return (
    <a href={image.url} target="_blank">
      <div className="image-container" ref={containerRef}>
        <img className="image" src={image.url} ref={imageRef} />
      </div>
    </a>
  )
}
