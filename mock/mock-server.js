const jsonServer = require('json-server'); // eslint-disable-line
const { pickBy, startsWith, isNil, trimStart, endsWith } = require('lodash');// eslint-disable-line
const mocksApi = require('./api');

function isNumeric(num) {
  return !isNaN(num);
}

function safeToNumber(num) {
  if (isNumeric(num)) {
    return Number(num);
  }

  return num;
}

function safeToArray(field) {
  if (typeof field === 'string') {
    return [field];
  }

  return field;
}

function toJsonServerQuery(req, res, next) {
  const filters = pickBy(req.query, (_, key) => !startsWith(key, '_'));
  const others = pickBy(req.query, (_, key) => startsWith(key, '_'));

  const ret = {};
  const { _offset, _sort, ...rest } = others;

  // _limit, _offset 转换为 _start 和 _limit
  if (!isNil(_offset)) {
    ret._start = safeToNumber(_offset);
  }

  // _sort 转换为 _order, _sort
  if (!isNil(_sort)) {
    const sort = safeToArray(_sort);
    const order = sort.map((s) => (startsWith(s, '-') ? 'desc' : 'asc'));

    ret._sort = sort.map((s) => trimStart(s, '-')).join(',');
    ret._order = order.join(',');
  }

  // 将 _gt，_lt  转换为 _gte 和 _lte
  for (const key in filters) {
    if (endsWith(key, '_lt') || endsWith(key, '_gt')) {
      filters[key + 'e'] = filters[key];
      delete filters[key];
    }
  }

  req.query = {
    ...ret,
    ...filters,
    ...rest,
  };
  return next();
}

const delay = (req, res, next) => {
  setTimeout(next, Math.floor(Math.random() * 1000 + 100));
};

module.exports = function (app) {
  const baseUrl = '/api';

  const { db, rewrites, routers } = mocksApi;

  // rewrite
  app.use(jsonServer.rewriter(rewrites));

  // body parser
  app.use(baseUrl, jsonServer.bodyParser);

  // routers
  routers.forEach((router) => app.use(baseUrl, router));

  // db
  const dbRouter = jsonServer.router(db, { foreignKeySuffix: '_id' });
  app.use(baseUrl, delay, toJsonServerQuery, jsonServer.defaults(), dbRouter);
};
