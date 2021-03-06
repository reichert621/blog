const knex = require('../knex.js');
const { first } = require('lodash');

const Imperatives = () => knex('imperatives');

const merge = (x, y) => Object.assign({}, x, y);

const fetch = (where = {}, userId) =>
  Imperatives()
    .select()
    .where(merge(where, { userId }));

const findOne = (where = {}, userId) =>
  fetch(where, userId).first();

const findById = (id, userId, where = {}) =>
  findOne(merge(where, { id }), userId);

const create = (params = {}, userId) =>
  Imperatives()
    .returning('id')
    .insert(merge(params, { userId }))
    .then(first)
    .then(id => findById(id, userId));

const update = (id, params = {}, userId) => {
  return findById(id, userId)
    .update(params)
    .then(count => (count > 0))
    .then(success => findById(id, userId));
};

const destroy = (id, userId) =>
  findById(id, userId).delete();

module.exports = {
  fetch,
  findById,
  create,
  update,
  destroy
};
