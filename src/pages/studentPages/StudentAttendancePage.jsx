import React from 'react'
import Attendance from '../../components/child/student/Attendance'
import baseURL from '../../utils/baseUrl'

const StudentAttendancePage = () => {
  const reg_no = localStorage.getItem('reg_no')
  return (
    <div>
      <Attendance
        todayUrl={`${baseURL}/api/in-out-attendance/14`}
        monthlyUrl={`${baseURL}/api/in-out-attendance/${reg_no}/month`}
      />
    </div>
  )
}

export default StudentAttendancePage
