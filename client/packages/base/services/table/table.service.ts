import type { RestData } from '../../models/base-response.model';
import type { TableColumnModel } from '../../models/dto/response/table/column/table-column.model';
import type { TableModel } from '../../models/dto/response/table/table.model';
import { BaseService } from '../base.service';

const BASE_URL = '/api/table';
class _TableService extends BaseService {
  async getTableBySchema(schema: string) {
    const response = await $api<RestData<TableModel[]>>(`${this.baseApiUrl}${BASE_URL}/list`, {
      method: 'GET',
      params: {
        schema: schema,
      },
    });

    if (response != null && response.status === EnumStatus.OK) {
      return response.data;
    }

    return null;
  }

  async getDataById(tableId?: number) {
    const response = await $api<RestData<object[]>>(`${this.baseApiUrl}${BASE_URL}/data`, {
      method: 'GET',
      params: {
        id: tableId,
      },
    });

    if (response != null && response.status === EnumStatus.OK) {
      return response.data;
    }

    return null;
  }

  async insert(tableId?: number, entity?: object) {
    const response = await $api<RestData<object[]>>(`${this.baseApiUrl}${BASE_URL}/${tableId}/insert`, {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json',
      }),
      body: JSON.stringify(entity),
    });

    if (response != null && response.status === EnumStatus.OK) {
      return response;
    }

    return null;
  }

  async update(tableId?: number, entity?: object) {
    console.log(tableId);
    console.log(entity);
    const response = await $api<RestData<object[]>>(`${this.baseApiUrl}${BASE_URL}/${tableId}/update`, {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json',
      }),
      body: JSON.stringify(entity),
    });

    if (response != null && response.status === EnumStatus.OK) {
      return response;
    }

    return null;
  }

  async delete(tableId: number, id: number) {
    const response = await $api<RestData<object[]>>(`${this.baseApiUrl}${BASE_URL}/${tableId}/delete`, {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json',
      }),
      body: JSON.stringify(id),
    });

    if (response != null && response.status === EnumStatus.OK) {
      return response;
    }

    return null;
  }

  async getColumnTableById(tableId?: number) {
    const response = await $api<RestData<TableColumnModel[]>>(`${this.baseApiUrl}${BASE_URL}/${tableId}/columns`, {
      method: 'GET',
    });

    if (response != null && response.status === EnumStatus.OK) {
      return response.data;
    }

    return null;
  }

  async getInfoTable(tableId: number) {
    const response = await $api<RestData<TableModel>>(`${this.baseApiUrl}${BASE_URL}/${tableId}`, {
      method: 'GET',
    });

    if (response != null && response.status === EnumStatus.OK) {
      return response.data;
    }

    return null;
  }
}

const TableService = new _TableService();
export { TableService };
