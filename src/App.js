import './App.css';
import { useState, useEffect } from 'react'
import moment from 'moment'
import _ from 'underscore'
import { epoch, epochToDate, getCurrentMonthStartAndEndDate } from './utils/date'
import DoghnutChart from './components/DoghnutChart'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import { getStandupReports } from './config/api'

function App() {
  const { firstDay, lastDay } = getCurrentMonthStartAndEndDate()
  const [startDate, setStartDate] = useState(moment(firstDay))
  const [endDate, setEndDate] = useState(moment(lastDay))
  const [firstStandups, setFirstStandups] = useState([])
  const [secondStandups, setSecondStandups] = useState([])
  const [performances, setPerformances] = useState()
  const [addUnfilledStandupB, setAddUnfilledStandupB] = useState(false)

  useEffect(() => {
    getReports()
  }, [])

  useEffect(() => {
    prepareReportsAgain()
  }, [addUnfilledStandupB])

  const getReports = async () => {
    const after = epoch(startDate)
    const before = epoch(endDate)

    const firstStandupReport = await getStandupReports({ standupId: 107800, before, after })
    setFirstStandups(firstStandupReport)
    const latesData = getLates(firstStandupReport)

    const lastStandupReport = await getStandupReports({ standupId: 107801, before, after })
    setSecondStandups(lastStandupReport)
    getPerformance(lastStandupReport, latesData)
  }

  const prepareReportsAgain = async () => {
    const latesData = getLates(firstStandups)
    getPerformance(secondStandups, latesData)
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
      employee.blockers = []

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

        if (item.questions[2]) {
          employee.blockers.push({
            answer: item.questions[2].answer,
            timestamp: standupTimestamp,
            isLate: deadline < standupTimestamp
          })
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
      employee.blockers = latesData[empName].blockers
      employee.notFilledBeta = latesData[empName].length - employee.length
      if (addUnfilledStandupB) {
        Array(employee.notFilledBeta).fill('').map(item => {
          standups.push({ questions: [{ answer: "Didn't fill standup Beta" }] })
        })
      }

      _.map(standups.reverse(), item => {
        const standupTimestamp = epochToDate(item.timestamp)
        const firstAnswer = item.questions[0].answer

        if (firstAnswer.toLowerCase().indexOf('yes') === 0) {
          employee.saidYes++
        } else {
          employee.noReasons.push({
            answer: firstAnswer,
            ...(item.timestamp && { timestamp: standupTimestamp })
          })
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
        <div className="header-container">
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              label="Start date"
              onChange={setStartDate}
              value={startDate}
              format={'DD-MM-YYYY'}
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              minDate={startDate}
              label="End date"
              onChange={setEndDate}
              value={endDate}
              format={'DD-MM-YYYY'}
            />
          </LocalizationProvider>
          <Button
            onClick={getReports}
            disabled={!startDate || !endDate}
            variant="contained">Check Performances</Button>
        </div>
        <div className="header-container">
          <FormControlLabel
            control={
              <Switch
                label="Gilad Gray"
                checked={addUnfilledStandupB}
                onChange={() => setAddUnfilledStandupB(!addUnfilledStandupB)}
              />
            }
            label="Count Unfilled Standup Beta in Performance"
          />
        </div>

        <div style={{ display: 'flex', flex: 1 }}>
          {performances && Object.keys(performances).map((empName) => {
            const { performance, message, noReasons, lates, blockers,
              notFilledBeta } = performances[empName]
            return (
              <div style={{ width: '22%', margin: 20, overflow: 'scroll' }}>
                <DoghnutChart
                  data={{ empName, performance, message, noReasons, lates, blockers, notFilledBeta }}
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
