export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string | null;
  parentId: string | null;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
}
