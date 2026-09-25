import React, { useState, useEffect } from 'react';
import baseURL from '../../../utils/baseUrl';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import '../../../assets/css/diary.css';

const PAGE_ICONS = {
  event: 'solar:calendar-date-bold-duotone',
  holiday: 'solar:calendar-minimalistic-bold-duotone',
};

const SLUG_CONFIG = {
  event: {
    apiPath: '/api/event-masters/student',
    titleField: 'event',
  },
  holiday: {
    apiPath: '/api/holiday-masters/student',
    titleField: 'holiday',
  },
};

const formatDisplayDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const Event = ({slug}) => {
  const [data, setData] = useState([]);

  const reg_no = localStorage.getItem('reg_no');
  const pageIcon = PAGE_ICONS[slug];
  const config = SLUG_CONFIG[slug];

  useEffect(() => {
    const slugConfig = SLUG_CONFIG[slug];

    const fetchData = async () => {
      if (!slugConfig?.apiPath || !reg_no) {
        setData([]);
        return;
      }

      try {
        const response = await axios.get(`${baseURL}${slugConfig.apiPath}/${reg_no}`);
        setData(response?.data?.data || []);
      } catch (error) {
        setData([]);
      }
    };

    fetchData();
  }, [slug, reg_no]);

  return (
    <div className="container-fluid diary-page diary-page--plain">
      <h4 className="diary-page__title">
        {pageIcon && (
          <span className={`diary-page__title-icon diary-page__title-icon--${slug}`}>
            <Icon icon={pageIcon} />
          </span>
        )}
        {slug?.replace(/-/g, ' ')}
      </h4>

      <div className="row diary-page__list">
        <div className="diary-page__cards">
          {data?.length === 0 ? (
            <div className="diary-page__empty">No entries found</div>
          ) : (
            data.map((item, index) => (
              <div className="card diary-card" key={item?.id ?? item?._id ?? index}>
                <div className="card-header diary-card__header diary-card__header--date-only">
                  <span className="diary-card__date">
                    <span className="diary-card__icon-badge diary-card__icon-badge--date" aria-hidden="true">
                      <Icon icon="solar:calendar-bold-duotone" className="diary-card__date-icon" />
                    </span>
                    <span className="diary-card__date-text">
                      {formatDisplayDate(item?.date || item?.createdAt)}
                    </span>
                  </span>
                </div>

                <div className="card-body diary-card__body">
                  <p className="diary-card__message">
                    {item?.[config?.titleField] || '—'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Event;
