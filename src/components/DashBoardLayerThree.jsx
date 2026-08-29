import { Link } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import "../assets/css/staffdasoard.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStaffData } from "../redux/slices/registrationNo";
import baseURL from "../utils/baseUrl";
import axios from "axios";

const DASHBOARD_CARDS = [
  {
    slug: "my-attendance",
    label: "My Attendance",
    icon: "solar:user-check-rounded-bold-duotone",
    accent: "emerald",
  },
  {
    slug: "staff-attendance",
    label: "Staff Attendance",
    icon: "solar:users-group-rounded-bold-duotone",
    accent: "emerald",
  },
  {
    slug: "student-attendance",
    label: "Student Attendance",
    icon: "solar:clipboard-check-bold-duotone",
    accent: "sky",
  },
  {
    slug: "diary",
    label: "Diary",
    icon: "solar:notebook-bookmark-bold-duotone",
    accent: "rose",
  },
  {
    slug: "notification",
    label: "Notification",
    icon: "solar:bell-bing-bold-duotone",
    accent: "violet",
    stat: "5",
  },
  {
    slug: "timetable",
    label: "TimeTable",
    icon: "solar:calendar-mark-bold-duotone",
    accent: "amber",
  },
  {
    slug: "fee-report",
    label: "Fee Report",
    icon: "solar:wallet-money-bold-duotone",
    accent: "amber",
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
  },
  {
    slug: "student-list",
    label: "Student List",
    icon: "solar:users-group-two-rounded-bold-duotone",
    accent: "orange",
  },
  {
    slug: "syllabus-trackin",
    label: "Syllabus Tracking",
    icon: "solar:checklist-bold-duotone",
    accent: "teal",
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

const getStaffFullName = (staff) => {
  if (!staff) return "Staff Member";
  const parts = [
    staff.surname,
    staff.firstname || staff.first_name,
    staff.lastname || staff.last_name,
  ].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return staff.name || staff.staff_name || "Staff Member";
};

const getStaffPhotoUrl = (staff) => {
  if (!staff) return null;
  const raw =
    staff.staff_photo ||
    staff.profile_image ||
    staff.profileImage ||
    staff.image ||
    staff.photo ||
    staff.avatar;
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `${baseURL}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

const DashBoardLayerThree = () => {
  const [schoolName, setSchoolName] = useState("");
  const [supportStatement, setSupportStatement] = useState("");
  const dispatch = useDispatch();
  const staff = useSelector((state) => state.registrationNo.staff?.data);
  const staffLoading = useSelector(
    (state) => state.registrationNo.staffLoading
  );
  const [photoError, setPhotoError] = useState(false);
  const [photoVisible, setPhotoVisible] = useState(false);

  const fullName = getStaffFullName(staff);
  const photoUrl = getStaffPhotoUrl(staff);
  const designation =
    staff?.designationInfo?.designation_name || staff?.designation || "—";
  const department =
    staff?.departmentInfo?.department_name || staff?.department || "—";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getStaffData({ token }));
    }
  }, [dispatch]);

  useEffect(() => {
    setPhotoError(false);
    setPhotoVisible(false);
  }, [photoUrl]);
  useEffect(() => {
    const fetchInstituteData = async () => {
      try {
        const { data } = await axios.get(`${baseURL}/api/institute`);
        const institute = data?.data?.[0];
        setSchoolName(institute?.name || "");
        setSupportStatement(institute?.support_statement || "");
      } catch {
        setSchoolName("");
        setSupportStatement("");
      }
    };

    fetchInstituteData();
  }, []);

  return (
    <section className="staff-dashboard staff-dashboard--tiles-v2">
      {schoolName ? (
        <div className="sd-school-name">
          <p className="sd-school-name__text">{schoolName}</p>
        </div>
      ) : null}

      <div
        className={`sd-profile sd-profile--staff${staffLoading ? " sd-profile--loading" : ""}`}
      >
        <div className="sd-profile__info">
          <h2 className="sd-profile__name">{fullName}</h2>
          <p className="sd-profile__designation">{designation}</p>
          <div className="sd-profile__details">
            <p className="sd-profile__detail">
              <Icon icon="solar:buildings-2-bold-duotone" aria-hidden />
              {department}
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
        ) : (
          <div
            className="sd-profile__avatar-wrap"
            aria-label={`${fullName} profile`}
          >
            <div
              className="sd-profile__avatar sd-profile__avatar--placeholder"
              aria-hidden
            >
              <Icon
                icon="solar:user-circle-bold-duotone"
                className="sd-profile__avatar-icon"
                aria-hidden
              />
            </div>
          </div>
        )}
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
            {slug === "notification" && stat ? (
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

export default DashBoardLayerThree;
