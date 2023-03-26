import { ReactNode, useEffect, useState } from "react";
import { css, SerializedStyles } from "@emotion/react";
import { Table } from "react-bootstrap";
import { GridColumn, GridItem, GridItemIdField } from "@/types";

function Grid<TGridItem extends GridItem, TFieldName extends GridItemIdField<TGridItem>>({
  columns,
  items,
  itemIdField,
  itemRowStyle,
  checkedItemIds = [],
  onCheck,
}: {
  columns: GridColumn<TGridItem>[];
  items: TGridItem[];
  itemIdField: TFieldName;
  itemRowStyle: (item: TGridItem, index: number) => SerializedStyles;
  checkedItemIds?: TGridItem[TFieldName][];
  onCheck?: (nextCheckedItemIds: TGridItem[TFieldName][]) => void;
}) {
  const enableCheck = !!onCheck;
  const [checkedAll, setCheckedAll] = useState(false);

  useEffect(() => {
    setCheckedAll(!!items.length && items.every((item) => checkedItemIds?.includes(item[itemIdField])));
  }, [items, checkedItemIds]);

  const handleCheck = (id: TGridItem[TFieldName]) => {
    let nextCheckedItemIds: TGridItem[TFieldName][];
    if (checkedItemIds.some((itemId) => itemId === id)) {
      nextCheckedItemIds = checkedItemIds.filter((itemId) => itemId !== id);
    } else {
      nextCheckedItemIds = [...checkedItemIds, id];
    }
    enableCheck && onCheck(nextCheckedItemIds);
  };

  const handleCheckAll = () => {
    let nextCheckedItemIds: TGridItem[TFieldName][];
    if (checkedAll) {
      nextCheckedItemIds = checkedItemIds.filter((itemId) => !items.find((item) => item[itemIdField] === itemId));
    } else {
      nextCheckedItemIds = Array.from(new Set([...checkedItemIds, ...items.map((item) => item[itemIdField])]));
    }
    enableCheck && onCheck(nextCheckedItemIds);
  };

  return (
    <Table>
      <HeaderRow enableCheck={enableCheck} checked={checkedAll} onChange={handleCheckAll}>
        {columns.map((column, columnIndex) => {
          return <HeaderColumn key={columnIndex} column={column} />;
        })}
      </HeaderRow>
      <tbody>
        {items.map((item, itemIndex) => (
          <ItemRow
            key={itemIndex}
            enableCheck={enableCheck}
            checked={checkedItemIds.some((itemId) => itemId === item[itemIdField])}
            onChange={() => handleCheck(item[itemIdField])}
            style={itemRowStyle(item, itemIndex)}
          >
            {columns.map((column, columnIndex) => (
              <ItemColumn
                key={columnIndex}
                column={column}
                item={item}
                itemId={item[itemIdField]}
                itemIndex={itemIndex}
              />
            ))}
          </ItemRow>
        ))}
      </tbody>
    </Table>
  );
}

function HeaderRow({
  enableCheck,
  checked,
  onChange,
  children,
}: {
  enableCheck: boolean;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <thead>
      <tr>
        {enableCheck && (
          <th
            css={css`
              vertical-align: middle;
            `}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={onChange}
              css={css`
                margin: auto;
              `}
            />
          </th>
        )}
        {children}
      </tr>
    </thead>
  );
}

function HeaderColumn<TGridItem extends GridItem>({ column }: { column: GridColumn<TGridItem> }) {
  return (
    <th
      css={css`
        vertical-align: top;
      `}
    >
      {column.label}
    </th>
  );
}

function ItemRow<TGridItem extends GridItem, TFieldName extends GridItemIdField<TGridItem>>({
  enableCheck,
  checked,
  onChange,
  style,
  children,
}: {
  enableCheck: boolean;
  checked: boolean;
  onChange: (id: TGridItem[TFieldName]) => void;
  style: SerializedStyles;
  children: ReactNode;
}) {
  return (
    <tr
      css={css`
        ${style}
      `}
    >
      {enableCheck && (
        <td
          css={css`
            width: 32px;
            vertical-align: middle;
          `}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            css={css`
              margin: auto;
            `}
          />
        </td>
      )}
      {children}
    </tr>
  );
}

function ItemColumn<TGridItem extends GridItem, TFieldName extends GridItemIdField<TGridItem>>({
  column,
  item,
  itemId,
  itemIndex,
}: {
  column: GridColumn<TGridItem>;
  item: TGridItem;
  itemId: TGridItem[TFieldName];
  itemIndex: number;
}) {
  return (
    <td
      width={column.width}
      css={css`
        overflow: hidden;
        vertical-align: middle;
        ${column.css}
      `}
    >
      <div key={itemId}>{column.render(item, itemIndex)}</div>
    </td>
  );
}

export default Grid;
