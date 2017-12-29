const knex = require('../knex.js');
const { first, groupBy, isNumber } = require('lodash');
const Task = require('./task');
const ScoreCardSelectedTask = require('./scorecard_selected_task');

const ScoreCard = () => knex('scorecards');

const merge = (x, y) => Object.assign({}, x, y);

const fetch = (where = {}, userId) =>
  ScoreCard()
    .select()
    .where(merge(where, { userId }));

const findOne = (where, userId) =>
  fetch(where, userId)
    .first();

// TODO: rename
const findById = (id, userId, where = {}) => {
  return Promise.all([
    findOne(merge(where, { id }), userId),
    ScoreCardSelectedTask.fetchByScorecardId(id, userId),
    Task.fetch()
  ])
    .then(([scorecard, selectedTasks, tasks]) => {
      const isComplete = selectedTasks.reduce((map, { taskId }) => {
        return merge(map, { [taskId]: true });
      }, {});

      return merge(scorecard, {
        tasks: tasks.map(t => {
          return merge(t, { isComplete: isComplete[t.id] });
        })
      });
    });
};

const fetchStats = (userId) => {
  return Promise.all([
    fetch({}, userId),
    Task.fetch()
  ])
    .then(([scorecards, tasks]) => {
      const taskScores = tasks.reduce((map, { id: taskId, points }) => {
        return merge(map, { [taskId]: Number(points) });
      }, {});

      const promises = scorecards.map(scorecard => {
        const { id } = scorecard;

        return ScoreCardSelectedTask.fetchByScorecardId(id, userId)
          .then(selectedTasks => {
            return merge(scorecard, {
              scores: selectedTasks.map(({ taskId }) => {
                return taskScores[taskId] || 0;
              })
            });
          });
      });

      return Promise.all(promises);
    })
    .then(scorecards => {
      const stats = scorecards
        .sort((x, y) => Number(x.date) - Number(y.date))
        .map(scorecard => {
          const { date, scores = [] } = scorecard;
          const timestamp = Number(new Date(date));
          const total = scores.reduce((sum, n) => sum + Number(n), 0);

          return [timestamp, total];
        });

      return stats;
    });
};

const create = (params, userId) =>
  ScoreCard()
    .returning('id')
    .insert(merge(params, { userId }))
    .then(first)
    .then(id => findById(id, userId));

const createWithScores = async (params, userId) => {
  const { date, selectedTasks } = params;
  const scorecard = await create({ date }, userId);
  const { id: scorecardId } = scorecard;
  const promises = selectedTasks.map(({ taskId }) => {
    const selectedTask = { taskId, scorecardId };

    return ScoreCardSelectedTask.create(selectedTask, userId);
  });

  await Promise.all(promises);

  return scorecard;
};

const update = (id, params, userId) =>
  findOne({ id }, userId)
    .update(params)
    .then(count => (count > 0))
    .then(success => findById(id, userId));

const updateSelectedTasks = (id, params, userId) => {
  const { date, selectedTasks } = params;

  return update(id, { date }, userId)
    .then(scorecard => {
      // FIXME: remove de-selected tasks
      const promises = selectedTasks.map(selectedTask => {
        const { taskId, scorecardId } = selectedTask;

        // FIXME: findOrCreate selected tasks to avoid dupes
        return ScoreCardSelectedTask.create({ taskId, scorecardId }, userId);
      });

      return Promise.all(promises);
    });
};

const destroy = (id, userId) =>
  findById(id, userId)
    .delete();

module.exports = {
  fetch,
  findById,
  fetchStats,
  create,
  createWithScores,
  update,
  updateSelectedTasks,
  destroy
};