import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Icon } from '@iconify/react/dist/iconify.js'
import baseURL from '../../../utils/baseUrl'
import AttendanceReportList from '../../../components/child/academic/AttendanceReportList'
import '../../../assets/css/mastercom.css'
import '../../../assets/css/academicOfflineFeeReport.css'
import '../../../assets/css/staffAttendanceReport.css'

const normalizeListResponse = (res) => {
  const payload = res?.data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const getId = (item) => item?.id ?? item?._id ?? ''

const getAuthConfig = () => {
  const token = localStorage.getItem('token')
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

const STAFF_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'department', label: 'Department' },
  { key: 'designation', label: 'Designation' },
]

const getTodayDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const StaffAttendancePage = () => {
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedDesignation, setSelectedDesignation] = useState('all')
  const [selectedDate, setSelectedDate] = useState(getTodayDate)
  const [appliedFilters, setAppliedFilters] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true)
      setErrorMsg('')
      const config = getAuthConfig()

      const [departmentRes, designationRes] = await Promise.allSettled([
        axios.get(`${baseURL}/api/departments`, config),
        axios.get(`${baseURL}/api/designations`, config),
      ])

      if (departmentRes.status === 'fulfilled') {
        setDepartments(normalizeListResponse(departmentRes.value))
      }
      if (designationRes.status === 'fulfilled') {
        setDesignations(normalizeListResponse(designationRes.value))
      }
      if (departmentRes.status === 'rejected' || designationRes.status === 'rejected') {
        setErrorMsg('Failed to load departments or designations.')
      }
      setLoading(false)
    }
    fetchOptions()
  }, [])

  const handleSubmit = () => {
    setAppliedFilters((prev) => ({
      filter: {
        date: selectedDate,
        departmentId: selectedDepartment,
        designationId: selectedDesignation,
      },
      submitCount: (prev?.submitCount ?? 0) + 1,
    }))
  }

  return (
    <div className="fee-report-scope d-flex flex-column gap-4 pb-2">
      <div className="chfi-wrapper">
        <section className="chfi-card" aria-label="Staff attendance filters">
          <div className="card-header">
            <div className="header-row">
              <span className="header-icon">
                <Icon icon="solar:filter-bold-duotone" width="22" />
              </span>
              <div>
                <h5 className="card-title">Filter Staff Attendance</h5>
              </div>
            </div>
          </div>

          <div className="card-body">
            {errorMsg && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {errorMsg}
                <button type="button" className="btn-close" onClick={() => setErrorMsg('')} />
              </div>
            )}

            <div className="report-filter-grid sar-filter-grid">
              <div className="report-filter-field">
                <label className="form-label">
                  <span className="label-dot" />
                  Department
                </label>
                <div className="icon-field">
                  <span className="icon">
                    <Icon icon="solar:buildings-2-bold-duotone" width="18" />
                  </span>
                  <select
                    className="form-select"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    disabled={loading}
                  >
                    <option value="all">All</option>
                    {departments.map((d) => (
                      <option key={getId(d)} value={getId(d)}>
                        {d?.department_name ?? d?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="report-filter-field">
                <label className="form-label">
                  <span className="label-dot" />
                  Designation
                </label>
                <div className="icon-field">
                  <span className="icon">
                    <Icon icon="solar:user-id-bold-duotone" width="18" />
                  </span>
                  <select
                    className="form-select"
                    value={selectedDesignation}
                    onChange={(e) => setSelectedDesignation(e.target.value)}
                    disabled={loading}
                  >
                    <option value="all">All</option>
                    {designations.map((d) => (
                      <option key={getId(d)} value={getId(d)}>
                        {d?.designation_name ?? d?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="report-filter-field">
                <label className="form-label">
                  <span className="label-dot" />
                  Date
                </label>
                <div className="icon-field">
                  <span className="icon">
                    <Icon icon="solar:calendar-bold-duotone" width="18" />
                  </span>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value || getTodayDate())}
                  />
                </div>
              </div>

              <div className="report-filter-field report-filter-action">
                <button
                  type="button"
                  className="btn-submit chfi-root"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  <Icon icon="solar:magnifer-bold-duotone" width="18" />
                  Submit
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {appliedFilters && (
        <section
          className="card fee-report-card fee-report-table-card basic-data-table border-0 mb-0"
          aria-label="Staff attendance records"
        >
          <div className="card-header border-0 bg-dark py-3 px-4">
            <div className="d-flex align-items-center gap-3 min-w-0">
              <span className="fee-report-icon-wrap bg-white bg-opacity-10 text-white border border-white border-opacity-25">
                <Icon icon="solar:users-group-rounded-bold-duotone" className="fs-4" />
              </span>
              <div className="min-w-0">
                <h6 className="card-title mb-0 fw-semibold text-white text-truncate">
                  Staff Attendance
                </h6>
              </div>
            </div>
          </div>

          <div className="card-body px-3 px-md-4 pb-4">
            <AttendanceReportList
              key={appliedFilters.submitCount}
              url={`${baseURL}/api/staff-in-out-attendance/reports/detail`}
              filter={appliedFilters.filter}
              fields={STAFF_FIELDS}
              getRowKey={(row) => row?.staff_id}
            />
          </div>
        </section>
      )}
    </div>
  )
}

export default StaffAttendancePage
