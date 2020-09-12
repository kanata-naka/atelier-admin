import React, { useCallback } from "react";
import { Pagination } from "react-bootstrap";

/**
 * ページネーション
 */
export default ({ pagination, onMovePage }) => {
  // 現在のページ
  const currentPage = pagination.offset / pagination.perPage + 1;
  // 最後のページ
  const lastPage = Math.ceil(pagination.total / pagination.perPage);

  const handlePageNumberButtonClick = useCallback(
    page => {
      onMovePage({
        ...pagination,
        offset: pagination.perPage * (page - 1)
      });
    },
    [pagination]
  );

  const renderPageNumberButtons = () => {
    const pageNumberButtons = [];
    for (let page = 1; page <= lastPage; page++) {
      pageNumberButtons.push(
        <Pagination.Item
          key={page}
          onClick={() => handlePageNumberButtonClick(page)}
          active={page === currentPage}>
          {page}
        </Pagination.Item>
      );
    }
    return pageNumberButtons;
  };

  return (
    <div>
      <Pagination>
        <Pagination.Prev
          onClick={() => handlePageNumberButtonClick(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {renderPageNumberButtons()}
        <Pagination.Next
          onClick={() => handlePageNumberButtonClick(currentPage + 1)}
          disabled={currentPage === lastPage}
        />
      </Pagination>
    </div>
  );
};
