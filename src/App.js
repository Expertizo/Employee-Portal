import './App.css';
import { useState } from 'react'
import _ from 'underscore'
import { epoch, epochToDate } from './utils/date'
import DoghnutChart from './components/DoghnutChart'
import { getStandupReports } from './config/api'

function App() {
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [performances, setPerformances] = useState()

  const getReports = async () => {
    const after = epoch(startDate)
    const before = epoch(endDate)

    const firstStandupReport = await getStandupReports({ standupId: 107800, before, after })
    const latesData = getLates(firstStandupReport)

    const lastStandupReport = await getStandupReports({ standupId: 107801, before, after })
    getPerformance(lastStandupReport, latesData)
  }

  const groupByEmp = (data) => {
    const empNameExposedData = _.map(data, item => {
      return { ...item, emp_name: item.member.realname }
    })
    return _.groupBy(empNameExposedData, 'emp_name')
  }

  const getLates = (data) => {
    const groupedDataByEmp = groupByEmp(data)

    _.mapObject(groupedDataByEmp, (standups, empName) => {
      const employee = groupedDataByEmp[empName]
      employee.lates = 0

      _.map(standups.reverse(), item => {
        const standupTimestamp = epochToDate(item.timestamp)
        const deadline = new Date(standupTimestamp.getTime())
        if (empName != 'Owais Ghaira') {
          deadline.setHours(11, 30)
        } else {
          deadline.setHours(15, 0)
        }

        if (deadline < standupTimestamp) {
          employee.lates++
        }
      })
    })
    return groupedDataByEmp
  }

  const getPerformance = (data, latesData) => {
    const groupedDataByEmp = groupByEmp(data)

    _.mapObject(groupedDataByEmp, (standups, empName) => {
      const employee = groupedDataByEmp[empName]
      employee.saidYes = 0
      employee.noReasons = []
      employee.lates = latesData[empName].lates

      _.map(standups.reverse(), item => {
        const firstAnswer = item.questions[0].answer

        if (firstAnswer.toLowerCase().indexOf('yes') === 0) {
          employee.saidYes++
        } else {
          employee.noReasons.push(firstAnswer)
        }
      })

      employee.performance = (employee.saidYes / standups.length * 100).toFixed(0)
      employee.message = `answered 'YES' ${employee.saidYes} times out of ${standups.length} for the question: "Did you complete all the tasks from yesterday? If not, please mention with *each task* what caused the task to remain incomplete.`
    })
    setPerformances(groupedDataByEmp)
  }

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <input type='date' placeholder='Start date' onChange={(e) => setStartDate(e.target.value)} />
          <input min={startDate} type='date' placeholder='End date' onChange={(e) => setEndDate(e.target.value)} />
          <button
            onClick={getReports}
            disabled={!startDate || !endDate}
          >Check Performances</button>
        </div>

        <div style={{ display: 'flex', flex: 1 }}>
          {performances && Object.keys(performances).map((empName) => {
            const { performance, message, noReasons, lates } = performances[empName]
            return (
              <div style={{ width: '22%', margin: 20, overflow: 'scroll' }}>
                <DoghnutChart
                  empName={empName}
                  percentage={performance}
                  message={message}
                  noReasons={noReasons}
                  lates={lates}
                  />
              </div>
            )
          })}
        </div>
      </header>
    </div>
  );
}

export default App;
