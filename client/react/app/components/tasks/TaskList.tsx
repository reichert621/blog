import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { all, resolve } from 'bluebird';
import { groupBy } from 'lodash';
import {
  Task,
  Category,
  fetchTasks,
  fetchCategories,
  createCategory
} from '../../helpers/tasks';
import NavBar from '../navbar';
import CategoryTasks from './CategoryTasks';
import './Task.less';

interface TaskListState {
  tasks: Task[];
  categories: Category[];
  newCategory: string;
}

class TaskList extends React.Component<RouteComponentProps<{}>, TaskListState> {
  constructor(props: RouteComponentProps<{}>) {
    super(props);

    this.state = {
      tasks: [],
      categories: [],
      newCategory: ''
    };
  }

  componentDidMount() {
    return all([
      fetchTasks(),
      fetchCategories()
    ])
      .then(([tasks, categories]) => this.setState({ tasks, categories }))
      .catch(err => {
        console.log('Error fetching tasks!', err);
      });
  }

  handleCreateCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { newCategory, categories } = this.state;

    if (!newCategory) return resolve();

    const params = { name: newCategory, isActive: true };

    return createCategory(params)
      .then(category => {
        this.setState({
          categories: categories.concat(category),
          newCategory: ''
        });
      })
      .catch(err => {
        console.log('Error creating category!', err);
      });
  }

  render() {
    const { tasks, categories, newCategory } = this.state;
    const { history } = this.props;
    const tasksByCategory = groupBy(tasks, 'category');

    return (
      <div>
        <NavBar
          title='My Tasks'
          linkTo='/dashboard'
          history={history} />

        <div className='default-container'>
          {
            categories
              .sort((x, y) => x.id - y.id)
              .map((category, key) => {
                const { name } = category;
                const categoryTasks = tasksByCategory[name];

                return (
                  <CategoryTasks
                    key={key}
                    category={category}
                    tasks={categoryTasks} />
                );
              })
          }

          <form
            className='new-category-form'
            onSubmit={(e) => this.handleCreateCategory(e)}>
            <input
              type='text'
              className='input-default -inline new-category-input'
              placeholder='New category'
              value={newCategory}
              onChange={(e) => this.setState({ newCategory: e.target.value })} />
            <button
              type='submit'
              className='btn-primary'
              disabled={!newCategory}>
              Create
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default TaskList;