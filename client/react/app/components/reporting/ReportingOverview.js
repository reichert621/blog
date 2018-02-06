import React from 'react';
import { first, max, size } from 'lodash';
import { getStreakStats } from '../../helpers/utils';

const ReportingOverview = ({ scorecards, tasks }) => {
  const scorecardStreak = getStreakStats(scorecards);
  const nonZeroDays = scorecards.filter(({ count }) => count > 0);
  const totalTasks = tasks.reduce((result, t) => result + t.count, 0);
  const totalPoints = tasks.reduce((result, t) => {
    return result + (t.points * t.count);
  }, 0);

  return (
    <div className="clearfix">
      <div className="pull-left">
        <div className="reporting-header-stat">
          <div className="stat-value">
            <span>{first(scorecardStreak)}</span>
            <span style={{ fontSize: 16, marginLeft: 4 }}>days</span>
          </div>
          <div className="stat-label text-active">Current Streak</div>
        </div>

        <div className="reporting-header-stat">
          <div className="stat-value">
            <span>{max(scorecardStreak)}</span>
            <span style={{ fontSize: 16, marginLeft: 4 }}>days</span>
          </div>
          <div className="stat-label text-active">Longest Streak</div>
        </div>
      </div>

      <div className="pull-right">
        <div className="reporting-header-stat">
          <div className="stat-value">
            <span>{size(nonZeroDays)}</span>
            <span style={{ fontSize: 16, marginLeft: 4 }}>days</span>
          </div>
          <div className="stat-label text-active">Total Non-Zero Days</div>
        </div>

        <div className="reporting-header-stat">
          <div className="stat-value">
            <span>{totalTasks}</span>
            <span style={{ fontSize: 16, marginLeft: 4 }}>tasks</span>
          </div>
          <div className="stat-label text-active">Total Accomplishments</div>
        </div>

        <div className="reporting-header-stat">
          <div className="stat-value">
            <span>{totalPoints}</span>
            <span style={{ fontSize: 16, marginLeft: 4 }}>points</span>
          </div>
          <div className="stat-label text-active">Total Points</div>
        </div>
      </div>
    </div>
  );
};

export default ReportingOverview;