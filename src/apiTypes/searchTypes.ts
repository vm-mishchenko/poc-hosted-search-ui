// Request
export enum SORT_DIRECTION {
  ASC = 'ASC',
  DESC = 'DESC'
}

export interface SortRequest {
  path: string;
  direction: SORT_DIRECTION;
}
