export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  status: string;
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
}
