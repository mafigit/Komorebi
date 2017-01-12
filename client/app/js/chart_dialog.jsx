import React from 'react';
import Dialog from 'material-ui/Dialog';
import BoardActions from './actions/BoardActions';
import BoardStore from './store/BoardStore';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Line } from 'react-chartjs';

export default class ChartDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState = () => {
    return {
      open: BoardStore.getShowChartDialog(),
      data: BoardStore.getBurnDownData()
    };
  }

  _onChange = () => {
    this.setState(this.getState());
  }

  componentWillUnmount = () => {
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    BoardStore.addChangeListener(this._onChange);
  }

  timeConverter = (timestamp) => {
    var a = new Date(timestamp/1000/1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }

  getData = () => {
    var time = [];
    var count = [];

    if (this.state.data) {
      time = this.state.data.map((x) => {
        return this.timeConverter(x.creation);
      });
      count = this.state.data.map((x) => {return x.todo;});
    }

    return {
      labels: time,
      datasets: [{
        label: "Burndown",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 3,
        data: count,
        spanGaps: false,
      }]
    };
  };

  showForm = () => {
    return <Dialog
        title={"Burndown"}
        modal={false}
        open={this.state.open}
        onRequestClose={BoardActions.closeChartDialog}
        autoScrollBodyContent={true}
      >
       <div>
         <Line data={this.getData()}  width="700" height="350" />
       </div>
      </Dialog>;
  }

  render() {
    return this.showForm();
  }

  static childContextTypes = {
    muiTheme: React.PropTypes.object
  }

  getChildContext() {
    return {
      muiTheme: getMuiTheme()
    };
  }
}
