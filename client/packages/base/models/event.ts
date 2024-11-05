import type { DataTableFilterMeta } from 'primevue/datatable';

interface PageEvent {
  first: number;
  rows: number; // number of row per page
  page: number; // current page
  pageCount: number; // number of pages
  sortField: string; // Order name field
  sortOrder: number; // sortOrder = 1 => asc , sortOrder -1 => desc
  filters: DataTableFilterMeta; // object filter field datatable
}

interface SortEvent {
  sortField: string;
  sortOrder: number;
}

export type { PageEvent, SortEvent };
