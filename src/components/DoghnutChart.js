import React, { Component } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import moment from 'moment';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;
class App extends Component {
  renderWithDates(item) {
    let rendering = item.answer + '<br /> <b>' + moment(item.timestamp).format('ddd, D MMM YYYY') + '</b>'
    if (item.isLate) {
      rendering += ' <span style="color: red">(Late)</span>'
    }
    return rendering
  }

  renderTable(title) {
    const { noReasons, blockers } = this.props.data
    const list = title === '"No" Reasons' ? noReasons : blockers

    return <table border='2' className='width'>
      <tr>
        <th>{title}</th>
      </tr>
      {list.map(item => <tr>
        <td className='font-size' dangerouslySetInnerHTML={{ __html: this.renderWithDates(item) }}></td>
      </tr>)}
    </table>
  }

  render() {
    const { empName, performance, message, noReasons, blockers, lates } = this.props.data
    const options = {
      animationEnabled: true,
      title: {
        text: empName
      },
      subtitles: [{
        text: performance + '%',
        verticalAlign: "center",
        fontSize: 24,
        dockInsidePlotArea: true
      }, { text: message }],
      data: [{
        type: "doughnut",
        showInLegend: true,
        indexLabel: "{name}: {y}",
        yValueFormatString: "#,###'%'",
        dataPoints: [
          { name: "Yes", y: performance },
          { name: "No", y: 100 - performance }
        ]
      }]
    }
    return (
      <div>
        <CanvasJSChart options={options}
        /* onRef={ref => this.chart = ref} */
        />
        <h3><u>Lates:</u> {lates}</h3>
        {!!noReasons.length && this.renderTable('"No" Reasons')}
        {!!blockers.length && this.renderTable('Blockers')}
      </div>
    );
  }
}
export default App;      