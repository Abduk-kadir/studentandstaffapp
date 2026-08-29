import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import "../assets/css/staffdasoard.css";
import { useEffect, useState } from "react";

import axios from "axios";
import baseURL from "../utils/baseUrl";

const STAT_CARD_SLUGS = new Set(["timetable", "notes", "holiday"]);

const DASHBOARD_CARDS = [
  {
    slug: "dues-fees",
    label: "Dues fees",
    icon: "solar:wallet-money-bold-duotone",
    accent: "emerald",
  },
  {
    slug: "attendance",
    label: "Attendance",
    icon: "solar:clipboard-check-bold-duotone",
    accent: "sky",
  },
  {
    slug: "student-diary",
    label: "Diary",
    icon: "solar:notebook-bookmark-bold-duotone",
    accent: "rose",
  },
  {
    slug: "notification",
    label: "Notification",
    icon: "solar:bell-bing-bold-duotone",
    accent: "violet",
  },
  {
    slug: "timetable",
    label: "TimeTable",
    icon: "solar:calendar-mark-bold-duotone",
    accent: "amber",
    stat: "8",
  },
  {
    slug: "assignment",
    label: "Assignment",
    icon: "solar:document-text-bold-duotone",
    accent: "lime",
  },
  {
    slug: "notes",
    label: "Notes",
    icon: "solar:notebook-bold-duotone",
    accent: "cyan",
    stat: "12",
  },
  {
    slug: "event",
    label: "Event",
    icon: "solar:calendar-date-bold-duotone",
    accent: "orange",
  },
  {
    slug: "holiday",
    label: "Holiday",
    icon: "solar:calendar-minimalistic-bold-duotone",
    accent: "teal",
    stat: "15",
  },
  {
    slug: "about-school",
    label: "About School",
    icon: "solar:buildings-2-bold-duotone",
    accent: "slate",
  },
  {
    slug: "profile",
    label: "Profile",
    icon: "solar:user-circle-bold-duotone",
    accent: "indigo",
  },
  {
    slug: "emergency-contact",
    label: "Emergency call to Institute",
    icon: "solar:phone-calling-bold-duotone",
    accent: "red",
  },
];

const getStudentFullName = (student) => {
  if (!student) return "Student";
  const parts = [student.first_name, student.last_name].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return student.name || "Student";
};

const resolvePhotoPath = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  if (raw.startsWith("http")) return raw;
  return `${baseURL}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

const getStudentPhotoUrl = (student) => {
  if (!student) return null;
  const raw =
    student.student_photo ||
    student.profile_image ||
    student.profileImage ||
    student.image ||
    student.photo ||
    student.avatar ||
    student.photograph ||
    student.passport_photo;
  return resolvePhotoPath(raw);
};

const getStudentPhotoFromDocuments = (documents) => {
  if (!Array.isArray(documents) || !documents.length) return null;

  const photoDoc = documents.find((doc) =>
    /photo|passport|picture/i.test(
      doc.document_type ||
        doc.document_name ||
        doc.requirement_document?.document_type ||
        doc.RequirementDocument?.document_type ||
        ""
    )
  );

  if (!photoDoc) return null;

  const raw =
    photoDoc.document_url ||
    photoDoc.file_path ||
    photoDoc.file_url ||
    photoDoc.url ||
    photoDoc.path;

  return resolvePhotoPath(raw);
};

const getSchoolNameFromInstitute = (payload) => {
  const record = payload?.data ?? payload;
  if (!record) return "";

  if (Array.isArray(record)) {
    return (
      record[0]?.school_name ||
      record[0]?.name ||
      record[0]?.institute_name ||
      ""
    );
  }

  return (
    record.school_name ||
    record.name ||
    record.institute_name ||
    record.institute?.name ||
    record.Institute?.name ||
    ""
  );
};

const DashBoardLayerTwo = () => {
  const [student, setStudent] = useState(null);
  const [studentLoading, setStudentLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);
  const [photoVisible, setPhotoVisible] = useState(false);
  const [documentPhotoUrl, setDocumentPhotoUrl] = useState(null);
  const [schoolName, setSchoolName] = useState("");
  const [supportStatement, setSupportStatement] = useState("");

  const regNo = localStorage.getItem("reg_no");
  const fullName = getStudentFullName(student);
  const photoUrl = getStudentPhotoUrl(student) || documentPhotoUrl;
  const studentClass = student?.class || "—";
  const division = student?.division || "—";
  const fatherName = student?.father_name || "—";

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!regNo) {
        setStudent(null);
        setDocumentPhotoUrl(null);
        setSchoolName("");
        setStudentLoading(false);
        return;
      }

      setStudentLoading(true);
      setSchoolName("");
      try {
        const [personalRes, documentsRes, infoRes] = await Promise.allSettled([
          axios.get(`${baseURL}/api/parmanent-personal-information/reg/${regNo}`),
          axios.get(`${baseURL}/api/student-documents/student/${regNo}`),
          axios.get(`${baseURL}/api/personal-information/reg_no/${regNo}`),
        ]);

        const personalData =
          personalRes.status === "fulfilled"
            ? personalRes.value.data?.data ?? personalRes.value.data ?? null
            : null;
        const infoData =
          infoRes.status === "fulfilled"
            ? infoRes.value.data?.data ?? infoRes.value.data ?? null
            : null;
        const documents =
          documentsRes.status === "fulfilled"
            ? documentsRes.value.data?.data ?? []
            : [];

        const mergedStudent =
          personalData && infoData
            ? { ...infoData, ...personalData }
            : personalData || infoData;

        setStudent(mergedStudent);
        setDocumentPhotoUrl(getStudentPhotoFromDocuments(documents));

        const classId = mergedStudent?.class;
        if (classId) {
          try {
            const { data } = await axios.get(
              `${baseURL}/api/classwise-institute`,
              { params: { classid: classId } }
            );
            setSchoolName(getSchoolNameFromInstitute(data));
          } catch {
            setSchoolName("");
          }
        }
      } catch {
        setStudent(null);
        setDocumentPhotoUrl(null);
        setSchoolName("");
      } finally {
        setStudentLoading(false);
      }
    };

    fetchStudentData();
  }, [regNo]);

  useEffect(() => {
    const fetchInstituteData = async () => {
      try {
        const { data } = await axios.get(`${baseURL}/api/institute`);
        const institute = data?.data?.[0];
        setSupportStatement(institute?.support_statement || "");
      } catch {
        setSupportStatement("");
      }
    };

    fetchInstituteData();
  }, []);

  useEffect(() => {
    setPhotoError(false);
    setPhotoVisible(false);
  }, [photoUrl]);

  return (
    <section className="staff-dashboard staff-dashboard--tiles-v2">
      {schoolName ? (
        <div className="sd-school-name">
          <p className="sd-school-name__text">{schoolName}</p>
        </div>
      ) : null}

      <div
        className={`sd-profile sd-profile--student${studentLoading ? " sd-profile--loading" : ""}`}
      >
        <div className="sd-profile__info">
          <h2 className="sd-profile__name">{fullName}</h2>
          <p className="sd-profile__designation">
            Class {studentClass} - {division}
          </p>
          <div className="sd-profile__details">
            <p className="sd-profile__detail">
              <Icon icon="solar:user-id-bold-duotone" aria-hidden />
              Reg No: {regNo || "—"}
            </p>
            <p className="sd-profile__detail">
              <Icon icon="solar:user-rounded-bold-duotone" aria-hidden />
              Father: {fatherName}
            </p>
          </div>
        </div>

        {photoUrl && !photoError ? (
          <button
            type="button"
            className="sd-profile__view-btn"
            onClick={() => setPhotoVisible(true)}
            aria-label="View photo"
          >
            <Icon icon="solar:gallery-bold-duotone" aria-hidden />
            View photo
          </button>
        ) : null}
      </div>

      {photoVisible && photoUrl && !photoError ? (
        <div
          className="sd-photo-popup"
          onClick={() => setPhotoVisible(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${fullName} photo`}
        >
          <div
            className="sd-photo-popup__card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sd-photo-popup__header">
              <div className="sd-photo-popup__title-wrap">
                <Icon
                  icon="solar:user-circle-bold-duotone"
                  className="sd-photo-popup__title-icon"
                  aria-hidden
                />
                <p className="sd-photo-popup__title">Profile Photo</p>
              </div>
              <button
                type="button"
                className="sd-photo-popup__close"
                onClick={() => setPhotoVisible(false)}
                aria-label="Close photo"
              >
                <Icon icon="solar:close-circle-bold" aria-hidden />
              </button>
            </div>
            <div className="sd-photo-popup__body">
              <img
                src={photoUrl}
                alt={fullName}
                className="sd-photo-popup__img"
                onError={() => {
                  setPhotoError(true);
                  setPhotoVisible(false);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {supportStatement ? (
        <div className="sd-support-statement">
          <Icon
            icon="solar:info-circle-bold-duotone"
            className="sd-support-statement__icon"
            aria-hidden
          />
          <p className="sd-support-statement__text">{supportStatement}</p>
        </div>
      ) : null}

      <div className="sd-grid sd-grid--uniform">
        {DASHBOARD_CARDS.map(({ slug, label, icon, accent, stat }) => (
          <Link key={slug} to={slug} className="sd-tile sd-tile--uniform">
            {STAT_CARD_SLUGS.has(slug) && stat ? (
              <span className="sd-tile__stat">{stat}</span>
            ) : null}
            <div className={`sd-tile__icon-wrap sd-tile__icon-wrap--${accent}`}>
              <Icon icon={icon} aria-hidden />
            </div>
            <div className="sd-tile__body">
              <p className="sd-tile__label">{label}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default DashBoardLayerTwo;
