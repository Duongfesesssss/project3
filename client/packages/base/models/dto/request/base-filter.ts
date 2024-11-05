class BaseFilter {
  first?: number;
  rows?: number;
  page?: number;
  draw?: number;
  sortField?: string;
  sortOrder?: string;
  keyword?: string;
  constructor() {
    this.rows = 10;
    this.page = 100;
  }
}

export { BaseFilter };
