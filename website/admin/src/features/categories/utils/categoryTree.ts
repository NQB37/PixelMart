import type { Category, CategoryNode } from "../types/category";

export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>(
    categories.map((c) => [c.id, { ...c, children: [] }]),
  );
  const roots: CategoryNode[] = [];

  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function collectIds(node: CategoryNode): string[] {
  return [node.id, ...node.children.flatMap(collectIds)];
}

export function filterCategoryTree(
  nodes: CategoryNode[],
  query: string,
): CategoryNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  return nodes.reduce<CategoryNode[]>((acc, node) => {
    const children = filterCategoryTree(node.children, q);
    const matches = node.name.toLowerCase().includes(q);
    if (matches || children.length > 0) acc.push({ ...node, children });
    return acc;
  }, []);
}

// Excludes the given id AND its whole subtree, so a category can't become its own descendant's child.
export function flattenForParentSelect(
  nodes: CategoryNode[],
  excludeId?: string,
  depth = 0,
): { id: string; label: string }[] {
  return nodes.flatMap((node) => {
    if (node.id === excludeId) return [];
    return [
      { id: node.id, label: `${"— ".repeat(depth)}${node.name}` },
      ...flattenForParentSelect(node.children, excludeId, depth + 1),
    ];
  });
}
