const { faker } = require('@faker-js/faker'); // eslint-disable-line
const { range } = require('lodash');

module.exports = range(100).map(() => {
  return {
    id: faker.database.mongodbObjectId(),
    name: faker.animal.cat(),
    type: faker.helpers.arrayElement(['CAT', 'DOG']),
  };
});
