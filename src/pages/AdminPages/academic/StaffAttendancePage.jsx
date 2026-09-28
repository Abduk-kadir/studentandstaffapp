import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Icon } from '@iconify/react/dist/iconify.js'
import baseURL from '../../../utils/baseUrl'
import Attendance from '../../../components/child/student/Attendance'
import '../../../assets/css/mastercom.css'

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

const getStaffLabel = (s) =>
  s?.name ??
  s?.staff_name ??
  ([s?.firstname ?? s?.first_name, s?.lastname ?? s?.last_name, s?.surname]
    .filter(Boolean)
    .join(' ') || `Staff #${getId(s)}`)

const StaffAttendancePage = () => {
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedDesignation, setSelectedDesignation] = useState('')
  const [staffList, setStaffList] = useState([])
  const [selectedStaff, setSelectedStaff] = useState('')
  const [loading, setLoading] = useState(false)
  const [staffLoading, setStaffLoading] = useState(false)
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

  useEffect(() => {
    let cancelled = false
    setSelectedStaff('')
    setStaffList([])
    setStaffLoading(false)
    if (!selectedDepartment || !selectedDesignation) return

    const fetchStaff = async () => {
      setStaffLoading(true)
      const params = { department: selectedDepartment, designation: selectedDesignation }

      try {
        const res = await axios.get(`${baseURL}/api/staff`, { ...getAuthConfig(), params })
        if (!cancelled) setStaffList(normalizeListResponse(res))
      } catch (error) {
        if (!cancelled) {
          setStaffList([])
          setErrorMsg(error?.response?.data?.message ?? 'Failed to load staff.')
        }
      } finally {
        if (!cancelled) setStaffLoading(false)
      }
    }
    fetchStaff()
    return () => {
      cancelled = true
    }
  }, [selectedDepartment, selectedDesignation])

  return (
    <div className="chfi-wrapper mb-3">
      <div className="chfi-card">
        <div className="card-header">
          <div className="header-row">
            <span className="header-icon">
              <Icon icon="solar:users-group-rounded-bold-duotone" width="24" />
            </span>
            <div>
              <h5 className="card-title">Staff Attendance</h5>
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

          <div className="form-area">
            <div className="chfi-root">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="field-row">
                    <label className="form-label mb-1">
                      <span className="label-dot" />
                      Department
                    </label>
                    <div className="icon-field">
                      <span className="icon">
                        <Icon icon="solar:buildings-2-bold-duotone" width="16" />
                      </span>
                      <select
                        className="form-select"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select Department</option>
                        {departments.map((d) => (
                          <option key={getId(d)} value={getId(d)}>
                            {d?.department_name ?? d?.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="field-row">
                    <label className="form-label mb-1">
                      <span className="label-dot" />
                      Designation
                    </label>
                    <div className="icon-field">
                      <span className="icon">
                        <Icon icon="solar:user-id-bold-duotone" width="16" />
                      </span>
                      <select
                        className="form-select"
                        value={selectedDesignation}
                        onChange={(e) => setSelectedDesignation(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select Designation</option>
                        {designations.map((d) => (
                          <option key={getId(d)} value={getId(d)}>
                            {d?.designation_name ?? d?.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="field-row">
                    <label className="form-label mb-1">
                      <span className="label-dot" />
                      Staff
                    </label>
                    <div className="icon-field">
                      <span className="icon">
                        <Icon icon="solar:user-bold-duotone" width="16" />
                      </span>
                      <select
                        className="form-select"
                        value={selectedStaff}
                        onChange={(e) => setSelectedStaff(e.target.value)}
                        disabled={!selectedDepartment || !selectedDesignation || staffLoading}
                      >
                        <option value="">Select Staff</option>
                        {staffList.map((s) => (
                          <option key={getId(s)} value={getId(s)}>
                            {getStaffLabel(s)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedStaff && (
        <Attendance
          key={selectedStaff}
          todayUrl={`${baseURL}/api/staff-in-out-attendance/${selectedStaff}`}
          monthlyUrl={`${baseURL}/api/staff-in-out-attendance/${selectedStaff}/month`}
        />
      )}
    </div>
  )
}

export default StaffAttendancePage
