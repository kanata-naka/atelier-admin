import React, { useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Badge } from "react-bootstrap";
import { bindActionCreators } from "redux";
import { isDirty } from "redux-form";
import { formatDateTimeFromUnixTimestamp } from "../../../utils/dateUtil";
import { callFunction } from "../../../common/firebase";
import { useAdjustElementWidth } from "../../../common/hooks";
import { Globals } from "../../../common/models";
import { getItemsByPage } from "../../../common/selectors";
import Notification from "../../../common/components/Notification";
import Grid from "../../../common/components/Grid";
import Pagination from "../../../common/components/Pagination";
import { list, select, movePage, edit } from "../actions";
import { MODULE_NAME } from "../models";

export default () => {
  const items = useSelector(state => getItemsByPage(state[MODULE_NAME]));
  const pagination = useSelector(state => state[MODULE_NAME].pagination);
  const selectedByItemId = useSelector(
    state => state[MODULE_NAME].selectedByItemId
  );
  const dirty = useSelector(state => isDirty(MODULE_NAME)(state));
  const dispatch = useDispatch();

  const load = async () => {
    try {
      const response = await callFunction({
        name: "api-works-get",
        data: {},
        globals: Globals
      });
      dispatch(list(response.data.result));
    } catch (error) {
      console.error(error);
      Notification.error("読み込みに失敗しました。\n" + JSON.stringify(error));
    }
  };
  useEffect(() => {
    load();
  }, []);

  const { select: handleSelect, movePage: handleMovePage } = bindActionCreators(
    {
      select,
      movePage
    },
    dispatch
  );

  const handleEdit = useCallback(
    id => {
      // 値が変わっていればアラートを表示する
      if (
        dirty &&
        !confirm("内容が変更されています。破棄してよろしいですか？")
      ) {
        return;
      }
      dispatch(edit(id));
    },
    [dirty]
  );

  const handleCancelEdit = useCallback(() => {
    // 値が変わっていればアラートを表示する
    if (dirty && !confirm("内容が変更されています。破棄してよろしいですか？")) {
      return;
    }
    dispatch(edit(null));
  }, [dirty]);

  const handleDeleteSelected = useCallback(async () => {
    if (!confirm("チェックした作品を削除します。本当によろしいですか？")) {
      return;
    }
    const result = await Promise.allSettled(
      Object.entries(selectedByItemId)
        .filter(entry => entry[1])
        .map(entry =>
          callFunction({
            name: "api-works-deleteById",
            data: { id: entry[0] },
            globals: Globals
          }).catch(error => {
            console.error(error);
            Notification.error(
              `作品 [${entry[0]}] の削除に失敗しました。\n` +
                JSON.stringify(error)
            );
          })
        )
    );
    if (result.find(item => item.status === "fulfilled")) {
      Notification.success("作品を削除しました。");
      load();
    }
  }, [selectedByItemId]);

  return (
    <div>
      <WorkGridControl
        selectedByItemId={selectedByItemId}
        onDeleteSelected={handleDeleteSelected}
      />
      <Grid
        items={items}
        selectedByItemId={selectedByItemId}
        onSelect={handleSelect}
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
              ));
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
                  onClick={handleCancelEdit}>
                  {"キャンセル"}
                </Button>
              ) : (
                <Button
                  variant="outline-warning"
                  type="button"
                  onClick={() => handleEdit(item.id)}>
                  {"編集"}
                </Button>
              );
            }
          }
        ]}
      />
      <Pagination
        pagination={pagination}
        items={items}
        onMovePage={handleMovePage}
      />
    </div>
  );
};

const WorkGridControl = ({ selectedByItemId, onDeleteSelected }) => {
  return (
    <div className="controls">
      <Button
        variant="danger"
        type="button"
        disabled={!Object.keys(selectedByItemId).length}
        onClick={onDeleteSelected}>
        {"チェックした作品を削除"}
      </Button>
    </div>
  );
};

const WorkGridColumnImage = ({ image }) => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  useAdjustElementWidth(containerRef, imageRef, "inside", [image]);

  return (
    <a href={image.url} target="_blank">
      <div className="image-container" ref={containerRef}>
        <img className="image" src={image.thumbnailUrl.small} ref={imageRef} />
      </div>
    </a>
  );
};
