import { useState, useCallback } from 'react';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/lib/constants';

export function usePagination(initialPage = DEFAULT_PAGE, initialPageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const reset = useCallback(() => {
    setPage(DEFAULT_PAGE);
    setPageSize(DEFAULT_PAGE_SIZE);
  }, []);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    reset,
  };
}
