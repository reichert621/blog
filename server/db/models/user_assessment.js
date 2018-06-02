const { first } = require('lodash');
const knex = require('../knex');

const UserAssessment = () => knex('user_assessments');

const fetch = (where = {}, userId) => {
  return UserAssessment()
    .select()
    .where({ ...where, userId });
};

const findOne = (where = {}, userId) => {
  return fetch(where, userId).first();
};

const findById = (id, userId, where = {}) => {
  return UserAssessment()
    .select('a.type', 'a.title', 'ua.id', 'ua.date', 'ua.userId')
    .from('user_assessments as ua')
    .innerJoin('assessments as a', 'ua.assessmentId', 'a.id')
    .where({ 'ua.userId': userId, 'ua.id': id })
    .first();
};

const create = (params, userId) => {
  return UserAssessment()
    .returning('id')
    .insert({ ...params, userId })
    .then(first)
    .then(id => findById(id, userId));
};

const findOrCreate = (params, userId) => {
  return findOne(params, userId)
    .then(found => {
      if (found) {
        return found;
      }

      return create(params, userId);
    });
};

const update = (id, params, userId) => {
  return findById(id, userId)
    .update({ ...params, userId })
    .then(count => (count > 0))
    .then(success => findById(id, userId));
};

module.exports = {
  fetch,
  findById,
  create,
  findOrCreate,
  update
};
