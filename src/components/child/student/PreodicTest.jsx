import React, { useState, useEffect } from "react";
import axios from "axios";
import { Icon } from "@iconify/react/dist/iconify.js";
import baseURL from "../../../utils/baseUrl";
import "../../../assets/css/diary.css";

const formatDisplayDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const PreodicTest = () => {
  const [entries, setEntries] = useState([]);
  const reg_no = localStorage.getItem("reg_no");

  useEffect(() => {
    const fetchEntries = async () => {
      if (!reg_no) {
        setEntries([]);
        return;
      }
      try {
        const response = await axios.get(
          `${baseURL}/api/preodictest-mark-entries/by-regno/${reg_no}`
        );
        setEntries(response?.data?.data || []);
      } catch {
        setEntries([]);
      }
    };
    fetchEntries();
  }, [reg_no]);

  return (
    <div className="container-fluid diary-page diary-page--plain">
      <h4 className="diary-page__title">
        <span className="diary-page__title-icon diary-page__title-icon--periodic-test">
          <Icon icon="solar:checklist-bold-duotone" />
        </span>
        Periodic Test
      </h4>

      <div className="row diary-page__list">
        <div className="diary-page__cards">
          {entries.length === 0 ? (
            <div className="diary-page__empty">No entries found</div>
          ) : (
            entries.map((item, index) => (
              <div
                className="card diary-card"
                key={item?.id ?? item?._id ?? index}
              >
                <div className="card-header diary-card__header">
                  <span className="diary-card__subject">
                    <span className="diary-card__subject-text">
                      {item?.subject_name || "Subject"}
                    </span>
                  </span>
                  <span className="diary-card__date">
                    <span
                      className="diary-card__icon-badge diary-card__icon-badge--date"
                      aria-hidden="true"
                    >
                      <Icon
                        icon="solar:calendar-bold-duotone"
                        className="diary-card__date-icon"
                      />
                    </span>
                    <span className="diary-card__date-text">
                      {formatDisplayDate(item?.test_date || item?.createdAt)}
                    </span>
                  </span>
                </div>

                <div className="card-body diary-card__body">
                  <p className="notes-card__meta">
                    <span className="notes-card__meta-label">Exam Name:</span>{" "}
                    <span className="notes-card__meta-value">
                      {item?.exam_name || "—"}
                    </span>
                  </p>
                  <p className="notes-card__meta">
                    <span className="notes-card__meta-label">Exam Date:</span>{" "}
                    <span className="notes-card__meta-value">
                      {formatDisplayDate(item?.test_date)}
                    </span>
                  </p>
                  <p className="notes-card__meta">
                    <span className="notes-card__meta-label">Topic:</span>{" "}
                    <span className="notes-card__meta-value">
                      {item?.topics || "—"}
                    </span>
                  </p>
                  <p className="notes-card__meta">
                    <span className="notes-card__meta-label">Total Marks:</span>{" "}
                    <span className="notes-card__meta-value">
                      {item?.total_marks ?? "—"}
                    </span>
                  </p>
                  <p className="notes-card__meta">
                    <span className="notes-card__meta-label">
                      Marks Obtained:
                    </span>{" "}
                    <span className="notes-card__meta-value">
                      {item?.mark_obtained ?? "—"}
                    </span>
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

export default PreodicTest;
