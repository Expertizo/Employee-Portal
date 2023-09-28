import React, { Component } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;
class App extends Component {
  render() {
    const { empName, percentage, message, noReasons, lates } = this.props
    const options = {
      animationEnabled: true,
      title: {
        text: empName
      },
      subtitles: [{
        text: percentage + '%',
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
          { name: "Yes", y: percentage },
          { name: "No", y: 100 - percentage }
        ]
      }]
    }
    return (
      <div>
        <CanvasJSChart options={options}
        /* onRef={ref => this.chart = ref} */
        />
        <h3><u>Lates:</u> {lates}</h3>
        {!!noReasons?.length && <div>
          <h4><u>"NO" Reasons:</u></h4>
          <ol>
            {noReasons.map(item => <li dangerouslySetInnerHTML={{ __html: item }}></li>)}
          </ol>
        </div>}
        {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
      </div>
    );
  }
}
export default App;      