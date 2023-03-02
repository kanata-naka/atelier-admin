import { ReactNode } from "react";
import { css, SerializedStyles } from "@emotion/react";
import { Table } from "react-bootstrap";
import { GridColumn, GridItem, GridItemIdField } from "@/types";

function Grid<Item extends GridItem, Field extends GridItemIdField<Item>>({
  columns,
  items,
  itemIdField,
  itemRowStyle,
}: {
  columns: GridColumn<Item>[];
  items: Item[];
  itemIdField: Field;
  itemRowStyle: (item: Item, index: number) => SerializedStyles;
}) {
  return (
    <Table>
      <HeaderRow>
        {columns.map((column, columnIndex) => {
          return <HeaderColumn key={columnIndex} column={column} />;
        })}
      </HeaderRow>
      <tbody>
        {items.map((item, itemIndex) => (
          <ItemRow key={itemIndex} style={itemRowStyle(item, itemIndex)}>
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

function HeaderRow({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr>{children}</tr>
    </thead>
  );
}

function HeaderColumn<Item extends GridItem>({ column }: { column: GridColumn<Item> }) {
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

function ItemRow({ style, children }: { style: SerializedStyles; children: ReactNode }) {
  return (
    <tr
      css={css`
        ${style}
      `}
    >
      {children}
    </tr>
  );
}

function ItemColumn<Item extends GridItem, Field extends GridItemIdField<Item>>({
  column,
  item,
  itemId,
  itemIndex,
}: {
  column: GridColumn<Item>;
  item: Item;
  itemId: Item[Field];
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
