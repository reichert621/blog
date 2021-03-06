const { Entry } = require('../index');
const { handleError } = require('./utils');

module.exports = {
  fetch: (req, res) =>
    Entry.fetchWithUtc({}, req.user.id)
      .then(entries => res.json({ entries }))
      .catch(err => handleError(res, err)),

  findById: (req, res) =>
    Entry.findById(req.params.id, req.user.id)
      .then(entry => res.json({ entry }))
      .catch(err => handleError(res, err)),

  create: (req, res) =>
    Entry.create(req.body, req.user.id)
      .then(entry => res.json({ entry }))
      .catch(err => handleError(res, err)),

  update: (req, res) =>
    Entry.update(req.params.id, req.body, req.user.id)
      .then(entry => res.json({ entry }))
      .catch(err => handleError(res, err)),

  destroy: (req, res) =>
    Entry.destroy(req.params.id, req.user.id)
      .then(entry => res.json({ entry }))
      .catch(err => handleError(res, err)),

  findOrCreateByDate: (req, res) => {
    const { body, user } = req;
    const { date } = body;
    const { id: userId } = user;

    return Entry.findOrCreateByDate(date, userId)
      .then(entry => res.json({ entry }))
      .catch(err => handleError(res, err));
  }
};
