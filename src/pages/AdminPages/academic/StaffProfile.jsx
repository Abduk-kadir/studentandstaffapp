import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "@iconify/react/dist/iconify.js";
import baseURL from "../../../utils/baseUrl";
import { getStaffData } from "../../../redux/slices/registrationNo";
import "../../../assets/css/diary.css";

const displayValue = (value) => {
  if (value == null || value === "") return "—";
  return String(value);
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStaffFullName = (staff) => {
  if (!staff) return "";
  const parts = [
    staff.surname,
    staff.firstname || staff.first_name,
    staff.lastname || staff.last_name,
  ].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return staff.name || staff.staff_name || "";
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

const PhoneLink = ({ number }) =>
  number ? (
    <a href={`tel:${number}`} className="emergency-contact-row__phone">
      <Icon icon="solar:phone-calling-bold-duotone" width={18} />
      {number}
    </a>
  ) : (
    "—"
  );

const StaffProfile = () => {
  const dispatch = useDispatch();
  const staff = useSelector((state) => state.registrationNo.staff?.data);
  const staffLoading = useSelector((state) => state.registrationNo.staffLoading);
  const staffError = useSelector((state) => state.registrationNo.staffError);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!staff && token) {
      dispatch(getStaffData({ token }));
    }
  }, [dispatch, staff]);

  const fullName = getStaffFullName(staff);
  const photoUrl = getStaffPhotoUrl(staff);
  const designation =
    staff?.designationInfo?.designation_name || staff?.designation;
  const department =
    staff?.departmentInfo?.department_name || staff?.department;

  useEffect(() => {
    setPhotoError(false);
  }, [photoUrl]);

  return (
    <div className="container-fluid diary-page diary-page--plain diary-page--emergency-contact diary-page--profile">
      <h4 className="diary-page__title">
        <span className="diary-page__title-icon diary-page__title-icon--profile">
          <Icon icon="solar:user-circle-bold-duotone" />
        </span>
        Profile
      </h4>

      <div className="row diary-page__list">
        <div className="diary-page__cards">
          {staffLoading && !staff ? (
            <div className="diary-page__empty">Loading profile...</div>
          ) : !staff ? (
            <div className="diary-page__empty">
              {staffError || "Staff not found"}
            </div>
          ) : (
            <div className="card diary-card">
              <div className="card-header diary-card__header">
                <span className="diary-card__subject">
                  <span className="diary-card__subject-text">
                    {fullName || "Staff Detail"}
                  </span>
                </span>
              </div>

              <div className="card-body diary-card__body emergency-contact-card__body student-profile-card__body">
                {photoUrl && !photoError ? (
                  <div className="student-profile-photo">
                    <img
                      src={photoUrl}
                      alt={fullName || "Staff"}
                      className="student-profile-photo__img"
                      onError={() => setPhotoError(true)}
                    />
                  </div>
                ) : (
                  <div
                    className="student-profile-photo student-profile-photo--placeholder"
                    aria-hidden
                  >
                    <Icon icon="solar:user-circle-bold-duotone" />
                  </div>
                )}

                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Name</span>
                  <span className="emergency-contact-row__value">
                    {displayValue(fullName)}
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Department</span>
                  <span className="emergency-contact-row__value">
                    {displayValue(department)}
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Designation</span>
                  <span className="emergency-contact-row__value">
                    {displayValue(designation)}
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Gender</span>
                  <span className="emergency-contact-row__value">
                    {displayValue(staff.gender)}
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Date of Birth</span>
                  <span className="emergency-contact-row__value">
                    {formatDate(staff.dob)}
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Date of Joining</span>
                  <span className="emergency-contact-row__value">
                    {formatDate(staff.date_of_join)}
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Email</span>
                  <span className="emergency-contact-row__value">
                    {staff.email ? (
                      <a
                        href={`mailto:${staff.email}`}
                        className="emergency-contact-row__phone"
                      >
                        {staff.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Mobile</span>
                  <span className="emergency-contact-row__value">
                    <PhoneLink number={staff.mobile_number} />
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Emergency Contact</span>
                  <span className="emergency-contact-row__value">
                    <PhoneLink number={staff.emergency_contact_number} />
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Address</span>
                  <span className="emergency-contact-row__value">
                    {displayValue(staff.address)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
