import NotificationDiaryCommon from "../../../components/child/academic/NotificationDiaryCommon"
import { useState } from "react"
import DiaryReportPage from "./DiaryReportPage"
import { Icon } from "@iconify/react/dist/iconify.js"
import "../../../assets/css/staffdasoard.css"

const DiaryPage = () => {
  const [isShowView, setIsShowView] = useState(false)

  const handleView = (flag) => {
    if (flag === true) {
      setIsShowView(true)
    }
    if (flag === false) {
      setIsShowView(false)
    }
  }

  return (
    <section className="staff-dashboard staff-dashboard-page">
      <h3 className="sd-section-title">Diary</h3>

      <div className="sd-mode-grid" role="group" aria-label="Diary mode">
        <button
          type="button"
          className={`sd-mode-btn sd-mode-btn--view ${isShowView ? "sd-mode-btn--active" : ""}`}
          onClick={() => handleView(true)}
        >
          <span className="sd-mode-btn__icon sd-mode-btn__icon--sky">
            <Icon icon="solar:eye-bold-duotone" aria-hidden />
          </span>
          <span className="sd-mode-btn__body">
            <span className="sd-mode-btn__label">View</span>
            <span className="sd-mode-btn__hint">See diary report</span>
          </span>
        </button>

        <button
          type="button"
          className={`sd-mode-btn sd-mode-btn--take ${!isShowView ? "sd-mode-btn--active" : ""}`}
          onClick={() => handleView(false)}
        >
          <span className="sd-mode-btn__icon sd-mode-btn__icon--emerald">
            <Icon icon="solar:notebook-bookmark-bold-duotone" aria-hidden />
          </span>
          <span className="sd-mode-btn__body">
            <span className="sd-mode-btn__label">Take</span>
            <span className="sd-mode-btn__hint">Add diary entry</span>
          </span>
        </button>
      </div>

      <div className="staff-dashboard-page__content">
        {isShowView ? (
          <DiaryReportPage />
        ) : (
          <NotificationDiaryCommon isSubject={true} formType='Diary'/>
        )}
      </div>
    </section>
  )
}

export default DiaryPage
