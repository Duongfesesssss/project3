interface RestBase {
  status: string;
  metadata?: object;
}

interface RestData<T> extends RestBase {
  data: T;
}
interface RestDataList<T> extends RestBase {
  data: T[];
}
type RestErrorDescription = {
  code: number;
  descripion: string;
  message: string;
};

interface RestError extends RestBase {
  errors: RestErrorDescription[];
}

interface RestPagedDataTable<T> extends RestBase {
  data: T;
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
  totalPages: number;
  totalRecords: number;
}

export type { RestBase, RestData, RestDataList, RestError, RestErrorDescription, RestPagedDataTable };
