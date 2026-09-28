import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Attendance from '../../../components/child/student/Attendance'
import baseURL from '../../../utils/baseUrl'
import { getStaffData } from '../../../redux/slices/registrationNo'

const StaffMyAttendancePage = () => {
  const dispatch = useDispatch()
  const staff = useSelector((state) => state.registrationNo.staff?.data)
  const staffId = staff?.id

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!staffId && token) {
      dispatch(getStaffData({ token }))
    }
  }, [dispatch, staffId])

  return (
    <div>
      {staffId && (
        <Attendance
          todayUrl={`${baseURL}/api/staff-in-out-attendance/${staffId}`}
          monthlyUrl={`${baseURL}/api/staff-in-out-attendance/${staffId}/month`}
        />
      )}
    </div>
  )
}

export default StaffMyAttendancePage
