const pet = require('./pet');

// 给 post 和 patch 请求添加时间戳
const timestamp = (req, res, next) => {
  if (req.method === 'POST') {
    req.body.createAt = Date.now();
    req.body.updateAt = Date.now();
    // req.body.createBy = req.get('Authorization')?.replace('Bearer ', '');
    // req.body.updateBy = req.get('Authorization')?.replace('Bearer ', '');
  }
  if (req.method === 'PUT' || req.method === 'PATCH') {
    req.body.updateAt = Date.now();
    // req.body.updateBy = req.get('Authorization')?.replace('Bearer ', '');
  }
  next();
};

const db = {
  pet,
};

module.exports = {
  db,
  /**
   * rewrites
   */
  rewrites: {},

  /**
   * routers
   */
  routers: [timestamp],
};
