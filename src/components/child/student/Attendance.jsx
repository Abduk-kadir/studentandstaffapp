import React from 'react'

import axios from 'axios'

import { Icon } from '@iconify/react/dist/iconify.js'

import { useEffect, useState,useMemo } from 'react'

import '../../../assets/css/attendance.css'
import MyCalender from '../MyCalender'
import AttendanceStudentModal from './AttendanceStudentModal'



const formatDisplayDate = (value) => {

  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-IN', {

    weekday: 'long',

    day: 'numeric',

    month: 'short',

    year: 'numeric',

  })

}


const formatDisplayTime = (value) => {

  if (!value || value === '00:00:00') return '—'

  return value.slice(0, 5)

}



const Attendance = ({ todayUrl, monthlyUrl }) => {

  const [view, setView] = useState('today')
  const [todayData, setTodayData] = useState([])
  const [monthlyData, setMontlyData] = useState([])
  const [detattofaDay,setDetattofaDay]=useState({})

  let date = new Date()

  let formattedDate = useMemo(()=>{return date.toISOString().split('T')[0]},[date])
  const yearMonth = useMemo(()=>{return formattedDate.split('-').slice(0, 2).join('-')},[formattedDate])

  const [selectedDate, setSelectedDate]=useState(yearMonth)
  
  const getDatefromMyCalender = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`
    console.log('selected attendance date:', formattedDate)

    const data = monthlyData.find((item) => item.attendance_date === formattedDate)
    setDetattofaDay(data || {})
  }
  console.log('monthly data **************:',monthlyData)
  console.log('detattofaDay **************:',detattofaDay)
  const  getYearMonthfromMyCalender=(yearMonth)=>{
    console.log('yearMonth ***************:',yearMonth)
    setSelectedDate(yearMonth)
    
    
    

   
  }


  useEffect(() => {

    const fetchData = async () => {

      try {

        if(view=='today' && todayUrl){
        const response = await axios.get(`${todayUrl}/${formattedDate}`)
        setTodayData(response.data.data)
        }
        else if(view=='monthly' && monthlyUrl){
          const response =await axios.get(`${monthlyUrl}/${selectedDate}`)
          setMontlyData(response?.data?.data)
          
        }

      } catch (error) {}

    }

    fetchData()

  }, [view,selectedDate,todayUrl,monthlyUrl])



  const todayView = () => {

    return (

      <div className='attendance-today'>

        {!todayData?.attendance_date ? (

          <div className='attendance-today__empty'>

            <Icon icon='solar:calendar-mark-bold-duotone' className='attendance-today__empty-icon' />

            No attendance record for today

          </div>

        ) : (

          <>

            <div className='attendance-today__date-row'>

              <span className='attendance-today__date-icon' aria-hidden='true'>

                <Icon icon='solar:calendar-bold-duotone' />

              </span>

              <div className='attendance-today__date-wrap'>

                <span className='attendance-today__date-label'>Date</span>

                <span className='attendance-today__date-value'>

                  {formatDisplayDate(todayData?.attendance_date)}

                </span>

              </div>

            </div>



            <div className='attendance-today__times'>

              <div className='attendance-today__time-card attendance-today__time-card--in'>

                <span className='attendance-today__time-icon' aria-hidden='true'>

                  <Icon icon='solar:login-3-bold-duotone' />

                </span>

                <span className='attendance-today__time-label'>In Time</span>

                <span className='attendance-today__time-value'>

                  {formatDisplayTime(todayData?.in_time)}

                </span>

              </div>



              <div className='attendance-today__time-card attendance-today__time-card--out'>

                <span className='attendance-today__time-icon' aria-hidden='true'>

                  <Icon icon='solar:logout-3-bold-duotone' />

                </span>

                <span className='attendance-today__time-label'>Out Time</span>

                <span className='attendance-today__time-value'>

                  {formatDisplayTime(todayData?.out_time)}

                </span>

              </div>

            </div>

          </>

        )}

      </div>

    )

  }



  const MonthlyView = () => {

    return (
      <div className='attendance-monthly__placeholder'>
        <Icon icon='solar:calendar-date-bold-duotone' className='attendance-monthly__placeholder-icon' />
        <MyCalender getDatefromMyCalender={getDatefromMyCalender} 
        getYearMonthfromMyCalender={getYearMonthfromMyCalender}
        monthlyData={monthlyData}/>
      </div>
    )

  }



  return (

    <div className='attendance-page'>

      <h4 className='attendance-page__title'>

        <span className='attendance-page__title-icon'>

          <Icon icon='solar:clipboard-check-bold-duotone' />

        </span>

        Attendance

      </h4>



      <div className='card attendance-card'>

        <div className='card-header attendance-card__header'>
          <div className='attendance-view-toggle' role='tablist' aria-label='Attendance view'>
            <button
              type='button'
              role='tab'
              aria-selected={view === 'today'}
              className={`attendance-view-toggle__btn${view === 'today' ? ' attendance-view-toggle__btn--active' : ''}`}
              onClick={() => setView('today')}
            >
              <Icon icon='solar:calendar-bold-duotone' width={20} />
              Today
            </button>
            <button
              type='button'
              role='tab'
              aria-selected={view === 'monthly'}
              className={`attendance-view-toggle__btn${view === 'monthly' ? ' attendance-view-toggle__btn--active' : ''}`}
              onClick={() => setView('monthly')}
            >
              <Icon icon='solar:calendar-date-bold-duotone' width={20} />
              Monthly
            </button>
          </div>
        </div>

        <div className='card-body attendance-card__body'>
          {view === 'today' ? todayView() : <MonthlyView />}
        </div>

      </div>

      <AttendanceStudentModal data={detattofaDay} onClose={() => setDetattofaDay({})} />

    </div>

  )

}



export default Attendance


