import React, { Component } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import moment from 'moment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;
class App extends Component {
  renderWithDates(item) {
    let rendering = item.answer + '<br /> <b>' + moment(item.timestamp).format('ddd, Do MMM YYYY') + '</b>'
    if (item.isLate) {
      rendering += ' <span style="color: red">(Late)</span>'
    }
    return rendering
  }

  renderTable(title) {
    const { noReasons, blockers } = this.props.data
    const list = title === '"No" Reasons' ? noReasons : blockers
    const filteredList = list.filter(item => item.timestamp)

    return <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell><b>{title} ({filteredList.length})</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredList.map((item) => (
            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="td" scope="row">
                <p dangerouslySetInnerHTML={{ __html: this.renderWithDates(item) }}></p>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  }

  renderHeads() {
    const { lates, notFilledBeta } = this.props.data

    return <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell><b>Lates</b></TableCell>
            <TableCell>{lates}</TableCell>
          </TableRow>
        </TableHead>
        <TableHead>
          <TableRow>
            <TableCell><b>Not Filled Standup Beta</b></TableCell>
            <TableCell>{notFilledBeta}</TableCell>
          </TableRow>
        </TableHead>
      </Table>
    </TableContainer>
  }

  render() {
    const { empName, performance, message, noReasons, blockers } = this.props.data
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
        <CanvasJSChart options={options} />
        {this.renderHeads()}
        {!!noReasons.length && this.renderTable('"No" Reasons')}
        {!!blockers.length && this.renderTable('Blockers')}
      </div>
    );
  }
}
export default App;      