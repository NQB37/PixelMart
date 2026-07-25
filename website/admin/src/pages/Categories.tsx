import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@website/shared/ui";
import { CategoryTree } from "@/features/categories/components/CategoryTree";
import { CreateCategoryModal } from "@/features/categories/components/CreateCategoryModal";
import {
  buildCategoryTree,
  filterCategoryTree,
} from "@/features/categories/utils/categoryTree";
import { useGetAllCategories } from "@/features/categories/hooks/useCategories";

export default function Categories() {
  const { data: categories = [], isLoading, error } = useGetAllCategories();
  const [search, setSearch] = useState("");
  // ponytail: track collapsed instead of expanded so everything is expanded by default
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const filteredTree = useMemo(
    () => (search ? filterCategoryTree(tree, search) : tree),
    [tree, search],
  );

  const toggle = (id: string) =>
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='font-display text-xl font-semibold text-foreground'>
            Categories
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Organize the catalog into nested categories and subcategories.
          </p>
        </div>
        <CreateCategoryModal tree={tree} />
      </div>

      <div className='relative max-w-xs'>
        <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          className='pl-9'
          placeholder='Search categories'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className='rounded-xl border border-border bg-card p-2 shadow-sm'>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <CategoryTree
            nodes={filteredTree}
            tree={tree}
            collapsedIds={collapsedIds}
            forceExpand={!!search}
            onToggle={toggle}
          />
        )}
      </div>
    </div>
  );
}
