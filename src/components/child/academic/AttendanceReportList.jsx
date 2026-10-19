import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Icon } from '@iconify/react/dist/iconify.js'
import '../../../assets/css/academicOfflineFeeReport.css'
import '../../../assets/css/staffAttendanceReport.css'

const PAGE_SIZE = 10

const getAuthConfig = () => {
  const token = localStorage.getItem('token')
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

const isUnmarked = (time) => !time || time === '00:00:00'

const formatTime = (value) => {
  if (isUnmarked(value)) return '—'
  const [h, m] = value.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return value
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`
}

const renderAttendanceStatus = (row) => {
  const absent = isUnmarked(row?.in_time)
  return (
    <div
      className={`sar-card__status ${absent ? 'sar-card__status--absent' : 'sar-card__status--present'}`}
    >
      <span className="sar-card__badge">{absent ? 'A' : 'P'}</span>
      {!absent && (
        <div className="sar-card__times">
          <span className="sar-card__time">
            <span className="sar-card__time-label">In</span>
            {formatTime(row?.in_time)}
          </span>
          <span className="sar-card__time sar-card__time--out">
            <span className="sar-card__time-label">Out</span>
            {formatTime(row?.out_time)}
          </span>
        </div>
      )}
    </div>
  )
}

const AttendanceReportList = ({
  url,
  filter,
  fields,
  getRowKey,
  renderSide = renderAttendanceStatus,
}) => {
  const [items, setItems] = useState([])
  const [start, setStart] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const sentinelRef = useRef(null)
  const requestIdRef = useRef(0)
  const loadingRef = useRef(false)
  const filterKey = JSON.stringify(filter ?? {})

  const loadPage = useCallback(
    async (offset, reset) => {
      if (!reset && loadingRef.current) return
      const requestId = reset ? ++requestIdRef.current : requestIdRef.current
      loadingRef.current = true
      setLoading(true)
      setError('')

      try {
        const res = await axios.get(url, {
          ...getAuthConfig(),
          params: {
            draw: 1,
            start: offset,
            length: PAGE_SIZE,
            filter: JSON.parse(filterKey),
          },
        })
        if (requestId !== requestIdRef.current) return

        const rows = Array.isArray(res.data?.data) ? res.data.data : []
        const total = Number(res.data?.recordsFiltered ?? res.data?.recordsTotal)
        const loaded = offset + rows.length

        setItems((prev) => (reset ? rows : [...prev, ...rows]))
        setStart(loaded)
        setHasMore(rows.length === PAGE_SIZE && (!Number.isFinite(total) || loaded < total))
      } catch (err) {
        if (requestId !== requestIdRef.current) return
        setError(err?.response?.data?.message ?? 'Failed to load attendance. Please try again.')
        setHasMore(false)
        if (reset) setItems([])
      } finally {
        if (requestId === requestIdRef.current) {
          loadingRef.current = false
          setLoading(false)
        }
      }
    },
    [url, filterKey]
  )

  useEffect(() => {
    setItems([])
    setStart(0)
    setHasMore(true)
    loadPage(0, true)
  }, [loadPage])

  useEffect(() => {
    if (!hasMore || loading) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingRef.current) {
          loadPage(start, false)
        }
      },
      { root: null, rootMargin: '120px', threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loading, start, loadPage])

  return (
    <div className="report-mobile-list" aria-live="polite">
      {items.length === 0 && !loading && !error && (
        <div className="report-mobile-empty">
          <span className="report-mobile-empty__icon" aria-hidden="true">
            <Icon icon="solar:inbox-line-bold-duotone" width="28" />
          </span>
          <p className="mb-0">No records found</p>
        </div>
      )}

      {error && (
        <div className="report-mobile-error">
          <Icon icon="solar:danger-triangle-bold-duotone" width="20" />
          <p className="mb-0">{error}</p>
        </div>
      )}

      <div className="report-mobile-cards sar-cards">
        {items.map((row, index) => (
          <article
            key={`${getRowKey ? getRowKey(row) : 'row'}-${row?.date ?? ''}-${index}`}
            className="report-mobile-card sar-card"
          >
            <div className="report-mobile-card__rows sar-card__rows">
              {fields.map((field) => (
                <div key={field.key} className="report-mobile-row">
                  <span className="report-mobile-row__label">{field.label}:</span>
                  <span className="report-mobile-row__value">{row?.[field.key] || '—'}</span>
                </div>
              ))}
            </div>

            {renderSide(row)}
          </article>
        ))}
      </div>

      <div ref={sentinelRef} className="report-mobile-sentinel" aria-hidden="true" />

      {loading && (
        <div className="report-mobile-loading">
          <span className="report-mobile-spinner" aria-hidden="true" />
          <span>Loading more…</span>
        </div>
      )}
      {!hasMore && items.length > 0 && !loading && (
        <p className="report-mobile-end mb-0">You&apos;re all caught up</p>
      )}
    </div>
  )
}

export default AttendanceReportList
