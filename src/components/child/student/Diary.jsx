import React, { useState, useEffect, useMemo } from 'react'
import baseURL from '../../../utils/baseUrl'
import axios from 'axios'
import { useParams } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import '../../../assets/css/diary.css';
import DocumentViewer from '../../child/DocumentViewer'
import SubjectFilterBar from './SubjectFilterBar'

const DIARY_SLUG = 'student-diary';

const PAGE_ICONS = {
  'student-diary': 'solar:notebook-bookmark-bold-duotone',
  notification: 'solar:bell-bing-bold-duotone',
  timetable: 'solar:calendar-mark-bold-duotone',
  assignment: 'solar:document-text-bold-duotone',
  notes: 'solar:notebook-bold-duotone',
  'dues-fees': 'solar:wallet-money-bold-duotone',
  attendance: 'solar:clipboard-check-bold-duotone',
  event: 'solar:calendar-date-bold-duotone',
  holiday: 'solar:palms-bold-duotone',
  'about-school': 'solar:buildings-2-bold-duotone',
  profile: 'solar:user-circle-bold-duotone',
  'emergency-call': 'solar:phone-calling-bold-duotone',
};

const getDocumentUrl = (item) =>
  item?.diary_url ||
  item?.notes_url ||
  item?.assignment_url ||
  item?.timetable_url ||
  item?.document_url ||
  "";

const formatSubmissionDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatSubmissionTime = (value) => {
  if (!value) return "—";
  const parts = String(value).split(":");
  if (parts.length < 2) return value;
  const hours = Number(parts[0]);
  const minutes = parts[1];
  if (Number.isNaN(hours)) return value;
  const date = new Date();
  date.setHours(hours, Number(minutes) || 0, 0, 0);
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const Diary = ({ url, isSubject }) => {
  const [data, setData] = useState([])
  const [subjectId, setSubjectId] = useState('')
  const [viewUrl, setViewUrl] = useState(null)
  const [searchSubjectId, setSearchSubjectId] = useState('')
  const { slug } = useParams()
  const reg_no = localStorage.getItem('reg_no')
  const showIcons = slug === DIARY_SLUG;
  const pageIcon = PAGE_ICONS[slug];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (slug == 'student-diary') {
          const response = await axios.get(`${baseURL}/api/diaries/student/${reg_no}`)
          setData(response?.data?.data || [])
        }
        if (slug == 'timetable') {
          const response = await axios.get(`${baseURL}/api/timetables/student/${reg_no}`)
          setData(response?.data?.data || [])
        }
        if (slug == 'assignment') {
          const response = await axios.get(`${baseURL}/api/assignments/student/${reg_no}`)
          setData(response?.data?.data || [])
        }
        if (slug == 'notes') {
          const response = await axios.get(`${baseURL}/api/notes/student/${reg_no}`)
          setData(response?.data?.data || [])
        }
        if(slug=='notification'){
          const response = await axios.get(`${baseURL}/api/student-notifications/student/${reg_no}`)
          setData(response?.data?.data || [])
        }
      } catch (error) {
        setData([])
      }
    }
    fetchData()
  }, [slug, reg_no])

  const subjectOptions = useMemo(() => {
    const map = new Map()
    data?.forEach((item) => {
      const id = item?.subject ?? item?.subject_id
      if (id != null && !map.has(String(id))) {
        map.set(String(id), item?.subject_name)
      }
    })
    return Array.from(map, ([id, name]) => ({ id, name }))
  }, [data])

  const displayData = useMemo(() => {
    if (!searchSubjectId) return data || []
    return (data || []).filter(
      (item) => String(item?.subject ?? item?.subject_id) === searchSubjectId
    )
  }, [data, searchSubjectId])

  const handleSubjectChange = () => {
    setSearchSubjectId(subjectId)
  }


  const handleView = (url) => {
    if (url) setViewUrl(`${baseURL}${url}`)
  }

  return (
    <div className={`container-fluid diary-page${showIcons ? ' diary-page--diary' : ' diary-page--plain'}`}>
      <h4 className='diary-page__title'>
        {pageIcon && (
          <span className={`diary-page__title-icon diary-page__title-icon--${slug}`}>
            <Icon icon={pageIcon} />
          </span>
        )}
        {slug?.replace(/-/g, ' ')}
      </h4>

      {subjectOptions.length > 0 ? (
        <SubjectFilterBar
          options={subjectOptions}
          value={subjectId}
          onChange={setSubjectId}
          onSearch={handleSubjectChange}
        />
      ) : null}

      <div className='row diary-page__list'>
        <div className='diary-page__cards'>
          {displayData?.length === 0 ? (
            <div className='diary-page__empty'>
              {showIcons && (
                <Icon icon='solar:inbox-line-bold-duotone' className='diary-page__empty-icon' />
              )}
              No entries found
            </div>
          ) : (
            displayData.map((item, index) => (
              <div className='card diary-card' key={item?.id ?? item?._id ?? index}>
                <div className='card-header diary-card__header'>
                  <span className='diary-card__subject'>
                    <span className='diary-card__subject-text'>{item?.subject_name}</span>
                  </span>
                  <span className='diary-card__date'>
                    <span className='diary-card__icon-badge diary-card__icon-badge--date' aria-hidden='true'>
                      <Icon icon='solar:calendar-bold-duotone' className='diary-card__date-icon' />
                    </span>
                    <span className='diary-card__date-text'>
                      {item?.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </span>
                </div>
                <div className='card-body diary-card__body'>
                  <p className='diary-card__teacher'>
                    {item?.staff ? item?.staff : 'arman khan'}
                  </p>
                  {slug === 'assignment' ? (
                    <>
                      <p className='notes-card__meta'>
                        <span className='notes-card__meta-label'>Topic:</span>{' '}
                        <span className='notes-card__meta-value'>
                          {item?.title || '—'}
                        </span>
                      </p>
                      <p className='notes-card__meta'>
                        <span className='notes-card__meta-label'>Submission Date:</span>{' '}
                        <span className='notes-card__meta-value'>
                          {formatSubmissionDate(item?.submission_date)}
                        </span>
                      </p>
                      <p className='notes-card__meta'>
                        <span className='notes-card__meta-label'>Submission Time:</span>{' '}
                        <span className='notes-card__meta-value'>
                          {formatSubmissionTime(item?.submission_time)}
                        </span>
                      </p>
                    </>
                  ) : slug === 'timetable' ? (
                    <p className='notes-card__meta'>
                      <span className='notes-card__meta-label'>Valid From:</span>{' '}
                      <span className='notes-card__meta-value'>
                        {formatSubmissionDate(item?.valid_from)}
                      </span>
                    </p>
                  ) : (
                    <p className='diary-card__message'>
                      {item?.message ? item?.message : item?.title}
                    </p>
                  )}
                  {getDocumentUrl(item) ? (
                    <div className='diary-card__footer'>
                      <button
                        type='button'
                        className={`diary-card__view-btn${slug === 'assignment' ? ' diary-card__view-btn--assignment' : ''}${slug === 'notes' ? ' notes-card__view-btn' : ''}`}
                        onClick={() => handleView(getDocumentUrl(item))}
                      >
                        {showIcons && (
                          <Icon icon='solar:document-text-bold-duotone' width={18} />
                        )}
                        View
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <DocumentViewer url={viewUrl} show={!!viewUrl} onClose={() => setViewUrl(null)} />
    </div>
  )
}

export default Diary
