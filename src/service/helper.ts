import { AxiosResponse } from 'axios';
import { isEmpty, pickBy } from 'lodash';
import * as qs from 'qs';

export type Response<T> = Promise<AxiosResponse<T>>;

export type Entity = {
  id: string;
  ns: string; // 命名空间
  source?: string; // 来源
  creatAt?: string; // 创建时间
  updateAt?: string; // 修改时间
};

export type ListParams = {
  _limit?: number;
  _offset?: number;
  _sort?: string;
  ns?: string;
  source?: string;
  ns_like?: string;
};

function filter(value: any) {
  if (typeof value === 'string' && value.trim() === '') return false;
  if (typeof value === 'object' && isEmpty(value)) return false;
  return true;
}

export function paramsSerializer(params: any): string {
  return qs.stringify(pickBy(params, filter), { indices: false, skipNulls: true });
}
