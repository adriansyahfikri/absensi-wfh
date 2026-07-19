import { Button } from './Button';
import './Pagination.css';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <span className="pagination__summary">
        {total === 0 ? 'No records' : `${rangeStart}–${rangeEnd} of ${total}`}
      </span>
      <div className="pagination__controls">
        <Button
          variant="secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
        >
          Previous
        </Button>
        <span className="pagination__page">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
