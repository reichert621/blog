import React from 'react';
import { resolve } from 'bluebird';
import { extend } from 'lodash';
import { createTask, updateTask } from '../../helpers/tasks';
import TaskItem from './TaskItem';

class CategoryTasks extends React.Component {
  constructor(props) {
    super(props);

    const { category, tasks } = props;

    this.state = {
      category,
      tasks,
      isCreating: false,
      newTask: '',
      newPoints: undefined
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { isCreating } = this.state;
    const { isCreating: wasCreating } = prevState;

    if (!wasCreating && isCreating) {
      this.refs.newTaskInput.focus();
    }
  }

  handleCreateTask(e, category) {
    e.preventDefault();
    const { newTask, newPoints, tasks = [] } = this.state;

    if (!newTask || !newPoints) return resolve();

    const { id: categoryId } = category;
    const params = {
      categoryId,
      description: newTask,
      points: newPoints
    };

    return createTask(params)
      .then(task => {
        console.log('Created task!', task);
        return this.setState({
          tasks: tasks.concat(task),
          newTask: '',
          newPoints: 0,
          isCreating: false
        });
      })
      .catch(err => {
        console.log('Error creating task!', err);
      });
  }

  handleUpdateTask(taskId, updates) {
    const { tasks = [] } = this.state;

    return updateTask(taskId, updates)
      .then(task => {
        console.log('Updated task!', task);
        return this.setState({
          tasks: tasks.map(t => {
            return t.id === task.id ? extend(t, task) : t;
          })
        });
      })
      .catch(err => {
        console.log('Error updating task!', err);
      });
  }

  handleToggleTaskActive(task) {
    const { id, isActive } = task;
    const updates = { isActive: !isActive };

    return this.handleUpdateTask(id, updates);
  }

  renderNewTaskForm() {
    const {
      isCreating,
      category = {},
      newTask = '',
      newPoints = 0
    } = this.state;

    return (
      <form
        className={isCreating ? '' : 'hidden'}
        onSubmit={(e) => this.handleCreateTask(e, category)}>
        <input
          type="text"
          className="input-default -inline task-description-input"
          ref="newTaskInput"
          placeholder="New task"
          value={newTask}
          onChange={(e) => this.setState({ newTask: e.target.value })} />
        {/* TODO: fix width and only allow 1, 2, 4, 8, 16 points */}
        <input
          type="number"
          className="input-default -inline task-points-input"
          placeholder="0"
          min="0"
          value={newPoints}
          onChange={(e) => this.setState({ newPoints: e.target.value })} />
        <button
          type="submit"
          className="btn-primary"
          disabled={!newTask || !newPoints}>
          Create
        </button>
        <a className="btn-link"
          onClick={() => this.setState({ isCreating: false })}>
          Cancel
        </a>
      </form>
    );
  }

  render() {
    const {
      isCreating,
      category = {},
      tasks = []
    } = this.state;
    const isActive = tasks.some(t => t.isActive);

    return (
      <div>
        <h4 className={`category-label ${isActive ? 'active' : 'inactive'}`}>
          {category.name}
          <img
            className={isCreating ? 'hidden' : 'plus-icon'}
            src="assets/plus.svg"
            onClick={() => this.setState({ isCreating: true })} />
        </h4>
        <ul className="task-sublist">
          {
            tasks
              .sort((x, y) => y.points - x.points)
              .map((task, key) => {
                return (
                  <TaskItem
                    key={key}
                    task={task}
                    onUpdateTask={this.handleUpdateTask.bind(this)}
                    onToggleTaskActive={this.handleToggleTaskActive.bind(this)} />
                );
              })
          }
          <li className="task-item-container">
            {this.renderNewTaskForm()}
          </li>
        </ul>
      </div>
    );
  }
}

export default CategoryTasks;
