import { Button } from "@website/shared/ui";
import type { ListUsersMeta } from "../types/user";

interface UsersPaginationProps {
  meta: ListUsersMeta;
  page: number;
  isFetching: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function UsersPagination({
  meta,
  page,
  isFetching,
  onPrevious,
  onNext,
}: UsersPaginationProps) {
  if (meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Page {meta.page} of {meta.totalPages} · {meta.total} users
      </span>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          className="px-3 py-1.5 text-xs"
          disabled={page <= 1 || isFetching}
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button
          variant="ghost"
          className="px-3 py-1.5 text-xs"
          disabled={page >= meta.totalPages || isFetching}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
