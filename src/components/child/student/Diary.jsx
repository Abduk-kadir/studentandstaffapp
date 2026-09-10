import React, { useState, useEffect, useMemo } from 'react'
import baseURL from '../../../utils/baseUrl'
import axios from 'axios'
import { useParams } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import '../../../assets/css/diary.css';
import DocumentViewer from '../../child/DocumentViewer'

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

      {subjectOptions.length > 0 && <div className='row diary-page__filters'>
        <div className='col-8'>
          <div className='diary-page__select-wrap'>
            {showIcons && (
              <Icon icon='solar:book-bold-duotone' className='diary-page__select-icon' />
            )}
            <select
              className={`form-control diary-page__select${showIcons ? '' : ' diary-page__select--plain'}`}
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value=''>All Subjects</option>
              {subjectOptions.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className='col-4'>
          <button
            type='button'
            className='btn diary-page__search-btn'
            onClick={handleSubjectChange}
          >
            {showIcons && <Icon icon='solar:magnifer-bold' width={18} />}
            Search
          </button>
        </div>
      </div>}

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
                    {showIcons && (
                      <span className='diary-card__icon-badge diary-card__icon-badge--subject' aria-hidden='true'>
                        <Icon icon='solar:book-2-bold-duotone' className='diary-card__subject-icon' />
                      </span>
                    )}
                    <span className='diary-card__subject-text'>{item?.subject_name}</span>
                  </span>
                  <span className='diary-card__date'>
                    {showIcons && (
                      <span className='diary-card__icon-badge diary-card__icon-badge--date' aria-hidden='true'>
                        <Icon icon='solar:calendar-bold-duotone' className='diary-card__date-icon' />
                      </span>
                    )}
                    <span className='diary-card__date-text'>
                      {item?.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
               
                  </span>
                </div>
                <div className='card-body diary-card__body'>
                  <p className='diary-card__teacher'>
                    {item?.staff ? item?.staff : 'arman khan'}
                  </p>
                  <p className='diary-card__message'>
                    {item?.message?item?.message:item?.title}
                  </p>
                  {getDocumentUrl(item) ? (
                    <div className='diary-card__footer'>
                      <button
                        type='button'
                        className='diary-card__view-btn'
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
