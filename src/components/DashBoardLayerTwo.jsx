import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import "../assets/css/staffdasoard.css";
import { useEffect, useState } from "react";

import axios from "axios";
import baseURL from "../utils/baseUrl";

const DASHBOARD_CARDS = [
  {
    slug: "dues-fees",
    label: "Dues fees",
    icon: "solar:wallet-money-bold-duotone",
    accent: "emerald",
    stat: "₹800",
    statHint: "Total due amount",
  },
  {
    slug: "attendance",
    label: "Attendance",
    icon: "solar:clipboard-check-bold-duotone",
    accent: "sky",
    stat: "92%",
    statHint: "Present this month",
  },
  {
    slug: "student-diary",
    label: "Diary",
    icon: "solar:notebook-bookmark-bold-duotone",
    accent: "rose",
    stat: "12",
    statHint: "Entries this week",
  },
  {
    slug: "notification",
    label: "Notification",
    icon: "solar:bell-bing-bold-duotone",
    accent: "violet",
    stat: "5",
    statHint: "Unread messages",
  },
  {
    slug: "timetable",
    label: "TimeTable",
    icon: "solar:calendar-mark-bold-duotone",
    accent: "amber",
    stat: "8",
    statHint: "Periods today",
  },
  {
    slug: "assignment",
    label: "Assignment",
    icon: "solar:document-text-bold-duotone",
    accent: "lime",
    stat: "5",
    statHint: "Pending review",
  },
  {
    slug: "notes",
    label: "Notes",
    icon: "solar:notebook-bold-duotone",
    accent: "cyan",
    stat: "12",
    statHint: "Subject notes",
  },
  {
    slug: "event",
    label: "Event",
    icon: "solar:calendar-date-bold-duotone",
    accent: "orange",
    stat: "3",
    statHint: "Upcoming events",
  },
  {
    slug: "holiday",
    label: "Holiday",
    icon: "solar:calendar-minimalistic-bold-duotone",
    accent: "teal",
    stat: "15",
    statHint: "Days this term",
  },
  {
    slug: "about-school",
    label: "About School",
    icon: "solar:buildings-2-bold-duotone",
    accent: "slate",
    stat: "25+",
    statHint: "Years of excellence",
  },
  {
    slug: "profile",
    label: "Profile",
    icon: "solar:user-circle-bold-duotone",
    accent: "indigo",
    stat: "100%",
    statHint: "Profile complete",
  },
  {
    slug: "emergency-contact",
    label: "Emergency call to Institute",
    icon: "solar:phone-calling-bold-duotone",
    accent: "red",
    stat: "24×7",
    statHint: "Tap to call",
  },
];

const getStudentFullName = (student) => {
  if (!student) return "Student";
  const parts = [student.first_name, student.last_name].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return student.name || "Student";
};

const getStudentPhotoUrl = (student) => {
  if (!student) return null;
  const raw =
    student.profile_image ||
    student.profileImage ||
    student.image ||
    student.photo ||
    student.avatar;
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `${baseURL}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

const DashBoardLayerTwo = () => {
 
  const [student, setStudent] = useState(null);
  const [studentLoading, setStudentLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  const regNo =localStorage.getItem("reg_no");
  const fullName = getStudentFullName(student);
  const photoUrl = getStudentPhotoUrl(student);
  const studentClass = student?.class || "—";
  const division = student?.division || "—";
  const email = student?.email || "—";
  const mobile = student?.contact_number || student?.mobile || "—";
  const fatherName = student?.father_name || "—";

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!regNo) {
        setStudentLoading(false);
        return;
      }

      setStudentLoading(true);
      try {
        const { data } = await axios.get(
          `${baseURL}/api/parmanent-personal-information/reg/${regNo}`
        );
        setStudent(data?.data ?? data ?? null);
      } catch {
        setStudent(null);
      } finally {
        setStudentLoading(false);
      }
    };

    fetchStudentData();
  }, [regNo]);

  useEffect(() => {
    setPhotoError(false);
  }, [photoUrl]);

  return (
    <section className="staff-dashboard">
      <div
        className={`sd-profile${studentLoading ? " sd-profile--loading" : ""}`}
      >
        <div className="sd-profile__info">
          <p className="sd-profile__greeting">Welcome back</p>
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
            <p className="sd-profile__detail">
              <Icon icon="solar:letter-bold-duotone" aria-hidden />
              {email}
            </p>
            <p className="sd-profile__detail">
              <Icon icon="solar:phone-bold-duotone" aria-hidden />
              {mobile}
            </p>
          </div>
        </div>

        <div className="sd-profile__avatar-wrap">
          {photoUrl && !photoError ? (
            <img
              src={photoUrl}
              alt={fullName}
              className="sd-profile__avatar"
              onError={() => setPhotoError(true)}
            />
          ) : (
            <div
              className="sd-profile__avatar sd-profile__avatar--placeholder"
              aria-label={`${fullName} profile`}
            >
              <Icon
                icon="solar:user-circle-bold-duotone"
                className="sd-profile__avatar-icon"
                aria-hidden
              />
            </div>
          )}
        </div>
      </div>

      <h3 className="sd-section-title">Quick Access</h3>

      <div className="sd-grid">
        {DASHBOARD_CARDS.map(
          ({ slug, label, icon, accent, stat, statHint }) => (
            <Link key={slug} to={slug} className="sd-tile">
              <span className="sd-tile__stat">{stat}</span>
              <div className={`sd-tile__icon-wrap sd-tile__icon-wrap--${accent}`}>
                <Icon icon={icon} aria-hidden />
              </div>
              <div className="sd-tile__body">
                <p className="sd-tile__label">{label}</p>
                <span className="sd-tile__hint">{statHint}</span>
              </div>
              <Icon
                icon="solar:alt-arrow-right-linear"
                className="sd-tile__chevron"
                aria-hidden
              />
            </Link>
          )
        )}
      </div>
    </section>
  );
};

export default DashBoardLayerTwo;
