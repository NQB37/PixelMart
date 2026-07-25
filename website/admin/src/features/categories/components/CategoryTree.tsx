import { ChevronDown, ChevronRight, Layers } from "lucide-react";
import { Badge, cn } from "@website/shared/ui";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { UpdateCategoryModal } from "./UpdateCategoryModal";
import { DeleteCategoryModal } from "./DeleteCategoryModal";
import type { CategoryNode } from "../types/category";

interface CategoryTreeProps {
  nodes: CategoryNode[];
  tree: CategoryNode[];
  depth?: number;
  collapsedIds: Set<string>;
  forceExpand?: boolean;
  onToggle: (id: string) => void;
}

export function CategoryTree({
  nodes,
  tree,
  depth = 0,
  collapsedIds,
  forceExpand = false,
  onToggle,
}: CategoryTreeProps) {
  if (nodes.length === 0) {
    return depth === 0 ? (
      <p className='px-4 py-10 text-center text-sm text-muted-foreground'>
        No categories found.
      </p>
    ) : null;
  }

  return (
    <ul className={depth > 0 ? "ml-4 border-l border-border pl-4" : undefined}>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isExpanded = forceExpand || !collapsedIds.has(node.id);

        return (
          <li key={node.id}>
            <div className='group flex items-center gap-2 rounded-md px-2 py-2 hover:bg-accent/40'>
              <button
                type='button'
                onClick={() => hasChildren && onToggle(node.id)}
                disabled={!hasChildren}
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded text-muted-foreground",
                  hasChildren && "hover:bg-accent hover:text-foreground",
                )}
              >
                {hasChildren &&
                  (isExpanded ? (
                    <ChevronDown className='h-4 w-4' />
                  ) : (
                    <ChevronRight className='h-4 w-4' />
                  ))}
              </button>

              <span className='grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-md bg-secondary text-secondary-foreground'>
                {node.imageUrl ? (
                  <img
                    src={node.imageUrl}
                    alt={node.name}
                    className='h-full w-full object-contain'
                  />
                ) : (
                  <Layers className='h-4 w-4' strokeWidth={1.75} />
                )}
              </span>

              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium text-foreground'>
                  {node.name}
                </p>
                <p className='truncate text-xs text-muted-foreground'>
                  /{node.slug}
                </p>
              </div>

              {hasChildren && (
                <Badge variant='secondary' className='shrink-0'>
                  {node.children.length} sub
                </Badge>
              )}

              <div className='flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                <CreateCategoryModal tree={tree} parent={node} />
                <UpdateCategoryModal category={node} tree={tree} />
                <DeleteCategoryModal node={node} />
              </div>
            </div>

            {hasChildren && isExpanded && (
              <CategoryTree
                nodes={node.children}
                tree={tree}
                depth={depth + 1}
                collapsedIds={collapsedIds}
                forceExpand={forceExpand}
                onToggle={onToggle}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
