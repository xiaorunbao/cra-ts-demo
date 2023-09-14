import { cancel, fork, join, takeEvery } from 'redux-saga/effects';

export function takeLeadingPerKey(patternOrChannel, worker, ...args) {
  return fork(function* () {
    const tasks = {};

    yield takeEvery(patternOrChannel, function* (action) {
      const key = action.key || 'something_not_defined';

      if (!(tasks[key] && tasks[key].isRunning())) {
        tasks[key] = yield fork(worker, ...args, action);

        yield join(tasks[key]);

        if (tasks[key] && !tasks[key].isRunning()) {
          delete tasks[key];
        }
      }
    });
  });
}

export function takeLatestPerKey(patternOrChannel, worker, ...args) {
  return fork(function* () {
    const tasks = {};

    yield takeEvery(patternOrChannel, function* (action) {
      const key = action.key || 'something_not_defined';

      if (tasks[key]) {
        yield cancel(tasks[key]);
      }

      tasks[key] = yield fork(worker, ...args, action);

      yield join(tasks[key]);

      if (tasks[key] && !tasks[key].isRunning()) {
        delete tasks[key];
      }
    });
  });
}
