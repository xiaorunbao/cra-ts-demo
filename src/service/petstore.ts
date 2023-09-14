import axios from 'axios';
import { schema } from 'normalizr';

import { PETSTORE_API_ENDPOINT } from 'src/config';
import { PetstoreAPIClient } from 'src/sdk/petstore';

import { paramsSerializer } from './helper';

export const petSchema = new schema.Entity('pets');
export const storeSchema = new schema.Entity('stores');

const axiosInstance = axios.create({
  baseURL: PETSTORE_API_ENDPOINT,
  paramsSerializer,
});

export const petstore = new PetstoreAPIClient(axiosInstance);
