import { Draft, produce } from 'immer';
import { isPlainObject } from 'lodash';
import { denormalize, Schema } from 'normalizr';
import { createSelector } from 'reselect';

type EntityState = {
  [key: string]: any;
};

type EntitiesState = {
  [key: string]: EntityState;
};

const initState = {};

export const entitiesReducer = produce((draft: Draft<EntitiesState>, { payload = {} } = {}) => {
  if (isPlainObject(payload.entities)) {
    Object.keys(payload.entities).forEach((key) => {
      if (!draft[key]) return (draft[key] = payload.entities[key]);
      Object.keys(payload.entities[key]).forEach((id) => {
        if (!draft[key][id]) return (draft[key][id] = payload.entities[key][id]);
        Object.assign(draft[key][id], payload.entities[key][id]);
      });
    });
  }
}, initState);

export const entitiesStateSelector = (state: any) => state.entities;

export const makeEntitiesSelector = (schema: Schema) =>
  createSelector(
    (_: any, input: any) => input,
    entitiesStateSelector,
    (input, entities) => {
      const result = denormalize(input, schema, entities);
      return result;
    }
  );
