import React from "react";
import { css } from "@emotion/react";
import Image from "next/image";
import Link from "next/link";
import { Badge, Button, ButtonGroup } from "react-bootstrap";
import Notification from "@/components/common/Notification";
import { Restrict } from "@/constants";
import { useDispatch, useSelector } from "@/hooks";
import { ArtState } from "@/types";
import { formatDateTimeFromUnixTimestamp } from "@/utils/dateUtil";
import { getItemsByPage } from "@/utils/pageUtil";
import { cancelEdit, selectItem, edit, movePage } from "./reducer";
import { deleteArts, fetchArts } from "./services";
import Grid from "../common/Grid";
import Pagination from "../common/Pagination";
import { withLoading } from "../common/services";

function GalleryGrid() {
  const { items, pagination, selectedItemIds, editingItemId } = useSelector((state) => ({
    items: state.gallery.items,
    pagination: state.gallery.pagination,
    selectedItemIds: state.gallery.selectedItemIds,
    editingItemId: state.gallery.editingItemId,
  }));
  const dispatch = useDispatch();

  const itemsByPage = getItemsByPage<ArtState>(items, pagination.page, pagination.perPage);

  return (
    <>
      <GridControl />
      <Grid
        columns={[
          {
            label: "タイトル",
            css: css`
              min-width: 200px;
            `,
            render: (item) => {
              return <>{item.title}</>;
            },
          },
          {
            label: "画像",
            css: css`
              min-width: 250px;
            `,
            render: (item) => {
              return (
                <>
                  {item.images.map(
                    (image, index) =>
                      image.url && (
                        <Link key={index} href={image.url}>
                          <Image
                            src={image.url}
                            width={100}
                            height={100}
                            alt=""
                            css={css`
                              margin: 2px;
                              border: 1px solid #dedede;
                              object-fit: contain;
                            `}
                          />
                        </Link>
                      )
                  )}
                </>
              );
            },
          },
          {
            label: "タグ",
            css: css`
              min-width: 250px;
              max-height: 152px;
              vertical-align: middle;
              white-space: pre-wrap;
              overflow-y: auto;
            `,
            render: (item) => <span>{item.tags.join(", ")}</span>,
          },
          {
            label: "説明",
            css: css`
              min-width: 250px;
              max-height: 152px;
              vertical-align: middle;
              white-space: pre-wrap;
              overflow-y: auto;
            `,
            render: (item) => <span>{item.description}</span>,
          },
          {
            css: css`
              width: 210px;
            `,
            render: (item) => (
              <>
                {item.createdAt && <DateRow label="投稿日時" unixTimestamp={item.createdAt} />}
                {item.updatedAt && <DateRow label="更新日時" unixTimestamp={item.updatedAt} />}
              </>
            ),
          },
          {
            css: css`
              width: 150px;
              text-align: center;
            `,
            render: (item) => <GridItemEditControl itemId={item.id} />,
          },
        ]}
        items={itemsByPage}
        itemIdField="id"
        itemRowStyle={(item) => css`
          background-color: ${item.id === editingItemId
            ? "cornsilk"
            : item.restrict === Restrict.ALL
            ? "aliceblue"
            : item.restrict === Restrict.PRIVATE
            ? "whitesmoke"
            : "transparent"};
        `}
        checkedItemIds={selectedItemIds}
        onCheck={(checkedItemIds) => dispatch(selectItem(checkedItemIds))}
      />
      <Pagination pagination={pagination} onMovePage={(pagination) => dispatch(movePage(pagination))} />
    </>
  );
}

function GridControl() {
  const { selectedItemIds } = useSelector((state) => ({
    items: state.gallery.items,
    selectedItemIds: state.gallery.selectedItemIds,
  }));
  const dispatch = useDispatch();

  const disabled = !selectedItemIds.length;

  const handleRemove = () => {
    if (!confirm("チェックした作品を削除します。本当によろしいですか？")) {
      return;
    }
    withLoading(async () => {
      await deleteArts(selectedItemIds)
        .then(async () => {
          Notification.success("作品を削除しました。");
          await fetchArts(dispatch).catch((error) => {
            console.error(error);
            Notification.error("読み込みに失敗しました。");
          });
        })
        .catch((error) => {
          console.error(error);
          Notification.error("作品の削除に失敗しました。");
        });
    }, dispatch);
  };

  return (
    <div
      css={css`
        padding: 0 12px 24px;
      `}
    >
      <span
        css={css`
          margin-right: 8px;
          vertical-align: middle;
          font-size: 1rem;
        `}
      >
        チェックした作品を
      </span>
      <ButtonGroup>
        {/* <Button variant="primary" type="button" disabled={disabled}>
          {"トップページに表示する"}
        </Button>
        <Button variant="outline-dark" type="button" disabled={disabled}>
          {"ギャラリーにのみ表示する"}
        </Button>
        <Button variant="outline-dark" type="button" disabled={disabled}>
          {"非公開"}
        </Button> */}
        <Button variant="danger" type="button" disabled={disabled} onClick={handleRemove}>
          {"削除"}
        </Button>
      </ButtonGroup>
    </div>
  );
}

function DateRow({ label, unixTimestamp }: { label: string; unixTimestamp?: number }) {
  return (
    <div
      css={css`
        padding-bottom: 8px;
      `}
    >
      <Badge bg="secondary">{label}</Badge>
      <span
        css={css`
          padding-left: 4px;
        `}
      >
        {unixTimestamp && formatDateTimeFromUnixTimestamp(unixTimestamp)}
      </span>
    </div>
  );
}

function GridItemEditControl({ itemId }: { itemId: string }) {
  const { editingItemId, isFormDirty } = useSelector((state) => ({
    editingItemId: state.gallery.editingItemId,
    isFormDirty: state.gallery.isFormDirty,
  }));
  const dispatch = useDispatch();

  const checkFormDirty = () => !isFormDirty || confirm("内容が変更されています。破棄してよろしいですか？");

  const handleEdit = () => {
    if (!checkFormDirty()) return;
    dispatch(edit(itemId));
  };

  const handleCancelEdit = () => {
    if (!checkFormDirty()) return;
    dispatch(cancelEdit());
  };

  if (itemId === editingItemId) {
    return (
      <>
        <Button variant="outline-danger" type="button" onClick={handleCancelEdit}>
          <i className="fas fa-window-close" /> キャンセル
        </Button>
      </>
    );
  }

  return (
    <>
      <Button variant="outline-warning" type="button" onClick={handleEdit}>
        <i className="fas fa-edit" /> 編集
      </Button>
    </>
  );
}

export default GalleryGrid;
