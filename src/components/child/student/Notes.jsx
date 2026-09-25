import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Icon } from "@iconify/react/dist/iconify.js";
import baseURL from "../../../utils/baseUrl";
import "../../../assets/css/diary.css";
import DocumentViewer from "../../child/DocumentViewer";
import SubjectFilterBar from "./SubjectFilterBar";

const formatNoteDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [searchSubjectId, setSearchSubjectId] = useState("");
  const [viewUrl, setViewUrl] = useState(null);
  const reg_no = localStorage.getItem("reg_no");

  useEffect(() => {
    const fetchNotes = async () => {
      if (!reg_no) {
        setNotes([]);
        return;
      }
      try {
        const response = await axios.get(
          `${baseURL}/api/notes/student/${reg_no}`
        );
        setNotes(response?.data?.data || []);
      } catch {
        setNotes([]);
      }
    };
    fetchNotes();
  }, [reg_no]);

  const subjectOptions = useMemo(() => {
    const map = new Map();
    notes?.forEach((item) => {
      const id = item?.subject ?? item?.subject_id;
      if (id != null && !map.has(String(id))) {
        map.set(String(id), item?.subject_name);
      }
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [notes]);

  const displayData = useMemo(() => {
    if (!searchSubjectId) return notes || [];
    return (notes || []).filter(
      (item) => String(item?.subject ?? item?.subject_id) === searchSubjectId
    );
  }, [notes, searchSubjectId]);

  const handleSubjectSearch = () => {
    setSearchSubjectId(subjectId);
  };

  const handleView = (url) => {
    if (url) setViewUrl(`${baseURL}${url}`);
  };

  return (
    <div className="container-fluid diary-page diary-page--plain">
      <h4 className="diary-page__title">
        <span className="diary-page__title-icon diary-page__title-icon--notes">
          <Icon icon="solar:notebook-bold-duotone" />
        </span>
        Notes
      </h4>

      {subjectOptions.length > 0 ? (
        <SubjectFilterBar
          options={subjectOptions}
          value={subjectId}
          onChange={setSubjectId}
          onSearch={handleSubjectSearch}
        />
      ) : null}

      <div className="row diary-page__list">
        <div className="diary-page__cards">
          {displayData.length === 0 ? (
            <div className="diary-page__empty">No notes found</div>
          ) : (
            displayData.map((note, index) => (
              <div
                className="card diary-card"
                key={note?.id ?? note?._id ?? index}
              >
                <div className="card-header diary-card__header">
                  <span className="diary-card__subject">
                    <span className="diary-card__subject-text">
                      {note?.subject_name || "Subject"}
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
                      {formatNoteDate(note?.createdAt ?? note?.createAt)}
                    </span>
                  </span>
                </div>

                <div className="card-body diary-card__body">
                  <p className="diary-card__teacher notes-card__staff">
                    {note?.staff || "—"}
                  </p>
                  <p className="notes-card__meta">
                    <span className="notes-card__meta-label">Chapter:</span>{" "}
                    <span className="notes-card__meta-value">
                      {note?.chapter || "—"}
                    </span>
                  </p>
                  <p className="notes-card__meta">
                    <span className="notes-card__meta-label">Topic:</span>{" "}
                    <span className="notes-card__meta-value">
                      {note?.topic || "—"}
                    </span>
                  </p>
                  {note?.notes_url ? (
                    <div className="diary-card__footer">
                      <button
                        type="button"
                        className="diary-card__view-btn notes-card__view-btn"
                        onClick={() => handleView(note.notes_url)}
                      >
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

      <DocumentViewer
        url={viewUrl}
        show={!!viewUrl}
        onClose={() => setViewUrl(null)}
      />
    </div>
  );
};

export default Notes;
