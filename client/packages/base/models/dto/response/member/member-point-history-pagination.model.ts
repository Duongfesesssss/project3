import type { PaginationMeta } from '../../response/common/api-response.model';
import type { MemberPointHistoryModel } from './member-point-history.model';

export interface MemberPointHistoryPagination {
  data: MemberPointHistoryModel[];
  pagination: PaginationMeta;
}
