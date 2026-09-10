import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Icon } from '@iconify/react/dist/iconify.js'
import baseURL from '../../../utils/baseUrl'
import '../../../assets/css/notes.css'
import DocumentViewer from '../../child/DocumentViewer'

const formatNoteDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const Notes = () => {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [viewUrl, setViewUrl] = useState(null)
  const reg_no = localStorage.getItem('reg_no')

  

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/notes/student/${reg_no}`)
        setNotes(response?.data?.data || [])
      } catch {
        setNotes([])
      }
    }
    fetchNotes()
  }, [reg_no])

  const handleNotes = (note) => {
    setSelectedNote(note)
  }
  const handleView = (url) => {
    if (url) setViewUrl(`${baseURL}${url}`)
  }

  return (
    <div className='notes-page'>
      <h4 className='notes-page__title'>
        <span className='notes-page__title-icon'>
          <Icon icon='solar:notebook-bold-duotone' />
        </span>
        Student Notes
      </h4>

      <div className='notes-page__list'>
        {notes.length === 0 ? (
          <div className='notes-page__empty'>
            <Icon icon='solar:inbox-line-bold-duotone' className='notes-page__empty-icon' />
            No notes found
          </div>
        ) : (
          notes.map((note, index) => (
            <article
              className={`notes-card${selectedNote === note ? ' notes-card--selected' : ''}`}
              key={note?.id ?? note?._id ?? index}
              onClick={() => handleNotes(note)}
            >
              <header className='notes-card__header'>
                <div className='notes-card__subject'>
                  <span className='notes-card__icon-badge notes-card__icon-badge--subject' aria-hidden='true'>
                    <Icon icon='solar:book-2-bold-duotone' />
                  </span>
                  <span className='notes-card__subject-name'>{note?.subject_name || 'Subject'}</span>
                </div>
                <div className='notes-card__date'>
                  <span className='notes-card__icon-badge notes-card__icon-badge--date' aria-hidden='true'>
                    <Icon icon='solar:calendar-bold-duotone' />
                  </span>
                  <time className='notes-card__date-text' dateTime={note?.createdAt ?? note?.createAt}>
                    {formatNoteDate(note?.createdAt ?? note?.createAt)}
                  </time>
                </div>
              </header>
            
            </article>
          ))
        )}
      </div>
      {selectedNote && (
        <section className='notes-detail'>
          <div className='notes-detail__body'>
            <p className='notes-detail__line'>
              <span className='notes-detail__label'>Chapter:</span>
              <span className='notes-detail__value'>{selectedNote?.chapter || '—'}</span>
            </p>
            <p className='notes-detail__line'>
              <span className='notes-detail__label'>Topic:</span>
              <span className='notes-detail__value'>{selectedNote?.topic || '—'}</span>
            </p>
            <p className='notes-detail__line'>
              <span className='notes-detail__label'>staff:</span>
              <span className='notes-detail__value'>{selectedNote?.staff || '—'}</span>
            </p>
          </div>
          {selectedNote?.notes_url ? (
            <button
              type='button'
              className='notes-detail__download-btn'
              onClick={() => handleView(selectedNote.notes_url)}
            >
              <Icon icon='solar:eye-bold-duotone' width={18} />
              View
            </button>
          ) : null}
        </section>
      )}

      <DocumentViewer url={viewUrl} show={!!viewUrl} onClose={() => setViewUrl(null)} />
    </div>
  )
}

export default Notes
