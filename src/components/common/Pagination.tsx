import React from "react";
import { css } from "@emotion/react";
import { Pagination as BootstrapPagination } from "react-bootstrap";
import { PaginationState } from "@/types";
import { getPageNumberRange } from "@/utils/pageUtil";

function Pagination({
  pagination,
  onMovePage,
}: {
  pagination: PaginationState;
  onMovePage: (pagination: PaginationState) => void;
}) {
  const currentPage = pagination.page;
  const lastPage = Math.ceil(pagination.total / pagination.perPage);

  const handlePageButtonClick = (page: number) => {
    onMovePage({
      ...pagination,
      page,
    });
  };

  return (
    <BootstrapPagination
      css={css`
        display: flex;
        justify-content: center;
        margin: 0 auto;
        padding: 0;
      `}
    >
      <BootstrapPagination.Prev onClick={() => handlePageButtonClick(currentPage - 1)} disabled={currentPage === 1} />
      {getPageNumberRange(currentPage, lastPage).map((page) => (
        <BootstrapPagination.Item key={page} onClick={() => handlePageButtonClick(page)} active={page === currentPage}>
          {page}
        </BootstrapPagination.Item>
      ))}
      <BootstrapPagination.Next
        onClick={() => handlePageButtonClick(currentPage + 1)}
        disabled={currentPage === lastPage}
      />
    </BootstrapPagination>
  );
}

export default Pagination;
