type PageItem = '...' | number;
export type PageOption = {
  key: number
  value: PageItem
};

export function getPageNumbers(currentPage: number, totalPages: number): Array<PageOption> {
  const pages: Array<PageOption> = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push({ key: i, value: i });
    }
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pages.push({ key: i, value: i });
      }
      pages.push({ key: totalPages + 1, value: '...' });
      pages.push({ key: totalPages, value: totalPages });
    } else if (currentPage >= totalPages - 2) {
      pages.push({ key: 1, value: 1 });
      pages.push({ key: totalPages + 1, value: '...' });
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pages.push({ key: i, value: i });
      }
    } else {
      pages.push({ key: 1, value: 1 });
      pages.push({ key: totalPages + 1, value: '...' });
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push({ key: i, value: i });
      }
      pages.push({ key: totalPages + 2, value: '...' });
      pages.push({ key: totalPages, value: totalPages });
    }
  }
  return pages;
}
