import mongoose from 'mongoose';

// Normalize optional string filters: treat empty string as undefined
export const normalizeOptional = (value?: string): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

// Build sort object for Mongo based on sortBy/sortOrder
export const buildMongoSort = (sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc'): Record<string, 1 | -1> => {
  return { [sortBy]: sortOrder === 'asc' ? 1 : -1 } as Record<string, 1 | -1>;
};

// Convert ObjectId fields to string on plain objects (shallow + common nested refs)
export const convertObjectIdToString = (obj: any): any => {
  if (obj && typeof obj === 'object') {
    if (obj._id && obj._id.toString) {
      obj._id = obj._id.toString();
    }
    if (obj.assignedTo && obj.assignedTo._id && obj.assignedTo._id.toString) {
      obj.assignedTo._id = obj.assignedTo._id.toString();
    }
    if (obj.createdBy && obj.createdBy._id && obj.createdBy._id.toString) {
      obj.createdBy._id = obj.createdBy._id.toString();
    }
  }
  return obj;
};

// Apply common task filters to an array of tasks (file DB)
export const filterTasksArray = <T extends {
  status?: string;
  priority?: string;
  assignedTo?: any;
  title: string;
  description: string;
}>(tasks: T[], options: { status?: string; priority?: string; assignedTo?: string; search?: string }) => {
  const status = normalizeOptional(options.status);
  const priority = normalizeOptional(options.priority);
  const assignedTo = normalizeOptional(options.assignedTo);
  const search = normalizeOptional(options.search)?.toLowerCase();

  let filtered = tasks;

  if (status) filtered = filtered.filter(t => t.status === status);
  if (priority) filtered = filtered.filter(t => t.priority === priority);
  if (assignedTo) {
    filtered = filtered.filter(t =>
      typeof t.assignedTo === 'object' ? t.assignedTo._id === assignedTo : t.assignedTo === assignedTo
    );
  }
  if (search) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(search) ||
      t.description.toLowerCase().includes(search) ||
      (typeof t.assignedTo === 'object' && t.assignedTo.name?.toLowerCase().includes(search))
    );
  }

  return filtered;
};

// Sort array by given key and order (file DB)
export const sortArrayBy = <T extends Record<string, any>>(items: T[], sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc'): T[] => {
  const sorted = [...items];
  sorted.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
  });
  return sorted;
};

// Paginate array data
export const paginateArray = <T>(items: T[], page: number = 1, limit: number = 10): { data: T[]; total: number; pages: number } => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = items.slice(startIndex, endIndex);
  const total = items.length;
  const pages = Math.ceil(total / limit);
  return { data, total, pages };
};

// Helpers to construct ObjectId safely
export const toObjectId = (id: string): mongoose.Types.ObjectId => new mongoose.Types.ObjectId(id);


