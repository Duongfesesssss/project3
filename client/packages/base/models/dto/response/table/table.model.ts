import type { TableColumnModel } from './column/table-column.model';

interface TableModel {
  id?: number;
  table_schema?: string;
  table_name?: string;
  name_en?: string;
  name_vn?: string;
  permanent?: boolean;
  order?: number;
  table_group_id?: number;
  table_schema_info: TableSchemaInfo;
  columns: TableColumnModel;
}

interface TableSchemaInfo {
  schema_name?: string;
  description?: string;
}

export type { TableModel };
