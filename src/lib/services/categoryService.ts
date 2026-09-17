import { fetchClient } from './fetchClient';

export type SubCategory = {
  id: number;
  name: string;
};

export type Category = {
  id: number;
  name: string;
  children: SubCategory[];
};

const CATEGORIES_PATH = '/categories';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toPositiveInt(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function toName(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const name = value.trim();
  return name === '' ? null : name;
}

function toSubCategory(value: unknown): SubCategory | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = toPositiveInt(value.id);
  const name = toName(value.name);

  if (id == null || name == null) {
    return null;
  }

  return { id, name };
}

function hasChildrenField(value: Record<string, unknown>): boolean {
  return Array.isArray(value.children);
}

export function normalizeCategories(data: unknown): Category[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const records = data.filter(isRecord);

  if (records.some(hasChildrenField)) {
    return records.flatMap((item) => {
      const id = toPositiveInt(item.id);
      const name = toName(item.name);

      if (id == null || name == null) {
        return [];
      }

      const children = Array.isArray(item.children)
        ? item.children.flatMap((child) => {
            const subCategory = toSubCategory(child);
            return subCategory ? [subCategory] : [];
          })
        : [];

      return [{ id, name, children }];
    });
  }

  const nodes = records.flatMap((item) => {
    const id = toPositiveInt(item.id);
    const name = toName(item.name);

    if (id == null || name == null) {
      return [];
    }

    const parentId =
      item.parentId == null ? null : toPositiveInt(item.parentId);

    return [{ id, name, parentId }];
  });

  const childrenByParentId = new Map<number, SubCategory[]>();

  nodes.forEach((node) => {
    if (node.parentId == null) {
      return;
    }

    const siblings = childrenByParentId.get(node.parentId) ?? [];
    siblings.push({ id: node.id, name: node.name });
    childrenByParentId.set(node.parentId, siblings);
  });

  return nodes
    .filter((node) => node.parentId == null)
    .map((node) => ({
      id: node.id,
      name: node.name,
      children: childrenByParentId.get(node.id) ?? [],
    }));
}

export async function getCategories(): Promise<Category[]> {
  const data = await fetchClient<unknown>(CATEGORIES_PATH);
  return normalizeCategories(data);
}
