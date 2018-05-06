import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { extend, values } from 'lodash';
import * as moment from 'moment';
import { all, resolve } from 'bluebird';
import NavBar from '../navbar';
import DashboardReporting from './DashboardReporting';
import DashboardList from './DashboardList';
import DashboardPreview from './DashboardPreview';
import { IScorecard, fetchScorecard, createNewScorecard } from '../../helpers/scorecard';
import { IChecklist, createNewChecklist } from '../../helpers/checklist';
import { Entry, createEntry } from '../../helpers/entries';
import { IMood } from '../../helpers/mood';
import { AppState, SelectedState, keyifyDate, getPastDates } from '../../helpers/utils';
import {
  LIST_VIEW,
  CHART_VIEW,
  UPDATE_VIEW,
  getScorecards,
  getChecklists,
  getEntries,
  getUserMoods,
  setMoodByDate,
  selectDate
} from '../../reducers';
import './Dashboard.less';

const mapStateToProps = (state: AppState) => {
  const {
    currentView,
    selected,
    scorecards,
    checklists,
    entries,
    challenges,
    moods
  } = state;
  const { byId: scorecardsById, byDate: scorecardsByDate } = scorecards;
  const { byId: checklistsById, byDate: checklistsByDate } = checklists;
  const { byId: entriesById, byDate: entriesByDate } = entries;
  const { byDate: moodsByDate } = moods;

  return {
    currentView,
    selected,
    scorecardsByDate,
    checklistsByDate,
    entriesByDate,
    moodsByDate,
    scorecards: values(scorecardsById),
    checklists: values(checklistsById),
    entries: values(entriesById),
    moods: values(moodsByDate)
  };
};

interface DashboardProps extends RouteComponentProps<{}> {
  currentView: string;
  selected: SelectedState;
  scorecardsByDate: { [date: string]: IScorecard; };
  checklistsByDate: { [date: string]: IChecklist; };
  entriesByDate: { [date: string]: Entry; };
  moodsByDate: { [date: string]: IMood; };
  scorecards: IScorecard[];
  checklists: IChecklist[];
  entries: Entry[];
  moods: IMood[];
  dispatch: Dispatch<Promise<any>>;
}

interface DashboardState {
  isLoading: boolean;
  showChart: boolean;
}

class Dashboard extends React.Component<DashboardProps, DashboardState> {
  constructor(props: DashboardProps) {
    super(props);

    this.state = {
      isLoading: true,
      showChart: false
    };
  }

  componentDidMount() {
    // TODO: this is a temporary hack to make sure this page scrolls
    // to the top after a scorecard or a checklist is submitted
    window.scrollTo(0, 0);
    const { history, dispatch, selected = {} as SelectedState } = this.props;
    const { date = moment() } = selected;

    return all([
      dispatch(getScorecards()),
      dispatch(getChecklists()),
      dispatch(getEntries()),
      dispatch(getUserMoods())
    ])
      .then(() => this.setState({ isLoading: false }))
      .then(() => this.handleDateSelected(date))
      .catch(err => {
        if (err.status === 401) {
          return history.push('/login');
        }

        return console.log('Error fetching dashboard!', err);
      });
  }

  handleDateSelected(date: moment.Moment) {
    const {
      scorecardsByDate,
      checklistsByDate,
      entriesByDate,
      moodsByDate
    } = this.props;
    const { dispatch } = this.props;
    const key = keyifyDate(date);
    const scorecard = scorecardsByDate[key];
    const checklist = checklistsByDate[key];
    const entry = entriesByDate[key];
    const mood = moodsByDate[key];

    if (!scorecard) {
      return dispatch(selectDate({
        date,
        scorecard,
        checklist,
        entry,
        mood
      }));
    }

    const { id: scorecardId } = scorecard;

    return fetchScorecard(scorecardId)
      .then(({ tasks = [] }) => {
        return dispatch(selectDate({
          date,
          checklist,
          entry,
          mood,
          scorecard: extend(scorecard, { tasks })
        }));
      });
  }

  handlePointClicked(timestamp: number) {
    const date = moment.utc(timestamp);

    if (date.isValid()) {
      return this.handleDateSelected(date);
    } else {
      return false;
    }
  }

  createNewScorecard(scorecard: IScorecard, date: moment.Moment) {
    if (scorecard && scorecard.id) return resolve();

    const { history } = this.props;
    // TODO: deal with timezone bug (inconsistency with db and client)
    const params = { date: date.format('YYYY-MM-DD') };

    return createNewScorecard(params)
      .then(({ id: scorecardId }) => {
        return history.push(`/scorecard/${scorecardId}`);
      });
  }

  createNewChecklist(checklist: IChecklist, date: moment.Moment) {
    if (checklist && checklist.id) return resolve();

    const { history } = this.props;
    const params = { date: date.format('YYYY-MM-DD') };

    return createNewChecklist(params)
      .then(({ id: checklistId }) => {
        return history.push(`/checklist/${checklistId}`);
      });
  }

  createNewEntry(entry: Entry, date: moment.Moment) {
    if (entry && entry.id) return resolve();

    const { history } = this.props;
    const params = {
      date: date.format('YYYY-MM-DD'),
      title: date.format('YYYY-MM-DD'),
      content: '',
      isPrivate: true
    };

    return createEntry(params)
      .then(({ id: entryId }) => {
        return history.push(`/entry/${entryId}`);
      });
  }

  setCurrentView(view: string) {
    const { dispatch } = this.props;

    return dispatch({ view, type: UPDATE_VIEW });
  }

  handleMoodSelected(mood: IMood) {
    const { dispatch, selected } = this.props;
    const { date } = selected;
    const { id: moodId } = mood;
    const formatted = date.format('YYYY-MM-DD');

    return dispatch(setMoodByDate(formatted, moodId))
      .catch(err => {
        console.log('Error updating mood!');
      });
  }

  render() {
    const dates = getPastDates();
    const { isLoading } = this.state;
    const {
      history,
      currentView,
      selected = {} as SelectedState,
      scorecards = [],
      checklists = [],
      moodsByDate
    } = this.props;
    const showChart = (currentView === CHART_VIEW);

    if (isLoading) {
      // TODO: handle loading state better
    }

    return (
      <div>
        <NavBar
          title='Dashboard'
          history={history} />

        <div className='default-container'>
          <div className='clearfix'>
            <div className='dashboard-preview-container pull-left'>
              <DashboardPreview
                isLoading={isLoading}
                selected={selected}
                handleMoodSelected={this.handleMoodSelected.bind(this)}
                handleScorecardClicked={this.createNewScorecard.bind(this)}
                handleChecklistClicked={this.createNewChecklist.bind(this)}
                handleEntryClicked={this.createNewEntry.bind(this)} />
            </div>

            <div className='dashboard-list-container pull-right'>
              <div className='toggle-btn-container'>
                <button
                  className={`btn-default btn-toggle ${showChart ? '' : 'active'}`}
                  onClick={this.setCurrentView.bind(this, LIST_VIEW)}>
                  List
                </button>
                <button
                  className={`btn-default btn-toggle ${showChart ? 'active' : ''}`}
                  onClick={this.setCurrentView.bind(this, CHART_VIEW)}>
                  Chart
                </button>
              </div>
              {
                showChart ?
                  <DashboardReporting
                    onClickPoint={this.handlePointClicked.bind(this)}/> :
                  <DashboardList
                    dates={dates}
                    scorecards={scorecards}
                    checklists={checklists}
                    selected={selected}
                    handleDateSelected={this.handleDateSelected.bind(this)} />
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Dashboard);
