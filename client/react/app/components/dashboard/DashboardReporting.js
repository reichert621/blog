import React from 'react';
import { Link } from 'react-router-dom';
import Highcharts from 'react-highcharts';
import ReportingChart from '../reporting/ReportingChart';
import { fetchStats } from '../../helpers/reporting';
import '../reporting/Reporting.less';

// TODO: DRY up (see Reporting)
class DashboardReporting extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stats: {}
    };
  }

  componentDidMount() {
    return fetchStats()
      .then(stats => this.setState({ stats }))
      .catch(err => {
        console.log('Error fetching stats!', err);
      });
  }

  render() {
    const { stats } = this.state;
    const { onClickPoint } = this.props;

    return (
      <div className="dashboard-chart-container">
        <ReportingChart
          stats={stats}
          onClickPoint={onClickPoint} />
      </div>
    );
  }
}

export default DashboardReporting;
