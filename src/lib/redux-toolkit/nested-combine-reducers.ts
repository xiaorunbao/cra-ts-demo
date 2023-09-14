import { combineReducers, ReducersMapObject } from 'redux';

/**
 * Takes a Reducers maps with multiple levels of nesting and turns it into in a single reducing function.
 *
 * @param map An object whose values are either reducing functions or other objects
 */
export function nestedCombineReducers(map: ReducersMapObject) {
  if (!map) throw new Error('You must specify a reducers map.');

  const flatReducersMapObject: ReducersMapObject = {};

  const recursiveMapKeys = Object.keys(map);

  for (const recursiveMapKey of recursiveMapKeys) {
    const recursiveMapValue = map[recursiveMapKey];

    if (recursiveMapValue === null) {
      continue;
    }

    if (recursiveMapValue === undefined) {
      continue;
    }

    //Hopefully a reducer function, let's store it to combine it later
    if (typeof recursiveMapValue === 'function') {
      const reducer = recursiveMapValue;

      flatReducersMapObject[recursiveMapKey] = reducer;
    }

    //Nesting found, let's go deeper !
    if (typeof recursiveMapValue === 'object') {
      const nestedRecursiveReducersMapObject = recursiveMapValue;

      flatReducersMapObject[recursiveMapKey] = nestedCombineReducers(nestedRecursiveReducersMapObject);
    }
  }

  //Once all the properties have been processed, the ReducersMap is no longer incomplete and can be combined one last time
  return combineReducers(flatReducersMapObject);
}
