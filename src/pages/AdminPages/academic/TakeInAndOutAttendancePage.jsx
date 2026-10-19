import React from 'react'
import TakeAttendance from '../../../components/child/academic/TakeAttendance'
import { useNavigate } from 'react-router-dom'
import {useState,useEffect} from 'react'
import InAndOutDetailReportPage from './InAndOutDetailReportPage'
import InAndOutSummaryReportPage from './InAndOutSummaryReportPage'
import { Icon } from '@iconify/react/dist/iconify.js'
import '../../../assets/css/staffdasoard.css'
const TakeInAndOutAttendancePage = () => {
  const Navigate=useNavigate()
  const [mode,setMode]=useState('take')
  return (
    <>
    <section className={`staff-dashboard take-in-out-attendance-page ${mode !== 'take' ? 'take-in-out-attendance-page--view' : ''}`}>
      <h3 className="sd-section-title">In / Out Attendance</h3>

      <div className="sd-mode-grid sd-mode-grid--three" role="group" aria-label="Attendance mode">
        <button
          type="button"
          className={`sd-mode-btn sd-mode-btn--view ${mode === 'report' ? 'sd-mode-btn--active' : ''}`}
          onClick={()=>setMode('report')}
        >
          <span className="sd-mode-btn__icon sd-mode-btn__icon--sky">
            <Icon icon="solar:eye-bold-duotone" aria-hidden />
          </span>
          <span className="sd-mode-btn__body">
            <span className="sd-mode-btn__label">In/Out Report</span>
            <span className="sd-mode-btn__hint">See attendance report</span>
          </span>
        </button>

        <button
          type="button"
          className={`sd-mode-btn sd-mode-btn--summary ${mode === 'summary' ? 'sd-mode-btn--active' : ''}`}
          onClick={()=>setMode('summary')}
        >
          <span className="sd-mode-btn__icon sd-mode-btn__icon--violet">
            <Icon icon="solar:pie-chart-2-bold-duotone" aria-hidden />
          </span>
          <span className="sd-mode-btn__body">
            <span className="sd-mode-btn__label">Summary Report</span>
            <span className="sd-mode-btn__hint">See attendance summary</span>
          </span>
        </button>

        <button
          type="button"
          className={`sd-mode-btn sd-mode-btn--take ${mode === 'take' ? 'sd-mode-btn--active' : ''}`}
          onClick={()=>setMode('take')}
        >
          <span className="sd-mode-btn__icon sd-mode-btn__icon--emerald">
            <Icon icon="solar:checklist-minimalistic-bold-duotone" aria-hidden />
          </span>
          <span className="sd-mode-btn__body">
            <span className="sd-mode-btn__label">Take</span>
            <span className="sd-mode-btn__hint">Mark in / out attendance</span>
          </span>
        </button>
      </div>

      {mode === 'take' && (
        <div className="take-in-out-attendance-page__content">
          <TakeAttendance />
        </div>
      )}
    </section>

    {mode === 'report' && (
      <div className="take-in-out-attendance-page__report">
        <InAndOutDetailReportPage />
      </div>
    )}

    {mode === 'summary' && (
      <div className="take-in-out-attendance-page__report">
        <InAndOutSummaryReportPage />
      </div>
    )}
    </>
  )
}

export default TakeInAndOutAttendancePage