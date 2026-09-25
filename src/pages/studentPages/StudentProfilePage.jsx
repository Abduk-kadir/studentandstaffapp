import { useState, useEffect } from "react";
import axios from "axios";
import { Icon } from "@iconify/react/dist/iconify.js";
import baseURL from "../../utils/baseUrl";
import "../../assets/css/diary.css";

const displayValue = (value) => {
  if (value == null || value === "") return "—";
  return String(value);
};

const resolvePhotoUrl = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  if (raw.startsWith("http")) return raw;
  return `${baseURL}/uploads/students/photoandsignature/${raw}`;
};

const StudentProfilePage = () => {
  const [student, setStudent] = useState(null);
  const [divisionName, setDivisionName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  const reg_no = localStorage.getItem("reg_no");

  useEffect(() => {
    const fetchStudent = async () => {
      if (!reg_no) {
        setStudent(null);
        setError("Registration number not found");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(
          `${baseURL}/api/parmanent-personal-information/reg/${reg_no}`
        );
        const record = data?.data ?? null;
        setStudent(record);

        const divisionId = record?.division;
        if (divisionId != null && divisionId !== "") {
          try {
            const divRes = await axios.get(`${baseURL}/api/divisions`);
            const list = divRes?.data?.data ?? divRes?.data ?? [];
            const match = Array.isArray(list)
              ? list.find((d) => String(d?.id) === String(divisionId))
              : null;
            setDivisionName(
              match?.division_name || match?.name || String(divisionId)
            );
          } catch {
            setDivisionName(String(divisionId));
          }
        } else {
          setDivisionName("");
        }
      } catch (err) {
        setStudent(null);
        setError("Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [reg_no]);

  useEffect(() => {
    setPhotoError(false);
  }, [student?.photo_url]);

  const fullName = [student?.first_name, student?.last_name]
    .filter(Boolean)
    .join(" ");
  const photoUrl = resolvePhotoUrl(student?.photo_url);

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
          {loading ? (
            <div className="diary-page__empty">Loading profile...</div>
          ) : error || !student ? (
            <div className="diary-page__empty">{error || "Student not found"}</div>
          ) : (
            <div className="card diary-card">
              <div className="card-header diary-card__header">
                <span className="diary-card__subject">
                  <span
                    className="diary-card__icon-badge diary-card__icon-badge--subject"
                    aria-hidden="true"
                  >
                    <Icon
                      icon="solar:user-id-bold-duotone"
                      className="diary-card__subject-icon"
                    />
                  </span>
                  <span className="diary-card__subject-text">
                    {fullName || "Student Detail"}
                  </span>
                </span>
                {reg_no ? (
                  <span className="diary-card__date">
                    <span className="diary-card__date-text">Reg: {reg_no}</span>
                  </span>
                ) : null}
              </div>

              <div className="card-body diary-card__body emergency-contact-card__body student-profile-card__body">
                {photoUrl && !photoError ? (
                  <div className="student-profile-photo">
                    <img
                      src={photoUrl}
                      alt={fullName || "Student"}
                      className="student-profile-photo__img"
                      onError={() => setPhotoError(true)}
                    />
                  </div>
                ) : (
                  <div className="student-profile-photo student-profile-photo--placeholder" aria-hidden>
                    <Icon icon="solar:user-circle-bold-duotone" />
                  </div>
                )}

                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">First Name</span>
                  <span className="emergency-contact-row__value">
                    {displayValue(student.first_name)}
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Last Name</span>
                  <span className="emergency-contact-row__value">
                    {displayValue(student.last_name)}
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Father Name</span>
                  <span className="emergency-contact-row__value">
                    {displayValue(student.father_name)}
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Mother Name</span>
                  <span className="emergency-contact-row__value">
                    {displayValue(student.mother_name)}
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Email</span>
                  <span className="emergency-contact-row__value">
                    {student.email ? (
                      <a href={`mailto:${student.email}`} className="emergency-contact-row__phone">
                        {student.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Contact</span>
                  <span className="emergency-contact-row__value">
                    {student.contact_number ? (
                      <a
                        href={`tel:${student.contact_number}`}
                        className="emergency-contact-row__phone"
                      >
                        <Icon icon="solar:phone-calling-bold-duotone" width={18} />
                        {student.contact_number}
                      </a>
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Second Contact</span>
                  <span className="emergency-contact-row__value">
                    {student.contact_number_second ? (
                      <a
                        href={`tel:${student.contact_number_second}`}
                        className="emergency-contact-row__phone"
                      >
                        <Icon icon="solar:phone-calling-bold-duotone" width={18} />
                        {student.contact_number_second}
                      </a>
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Division</span>
                  <span className="emergency-contact-row__value">
                    {displayValue(divisionName || student.division)}
                  </span>
                </div>
                <div className="emergency-contact-row">
                  <span className="emergency-contact-row__label">Address</span>
                  <span className="emergency-contact-row__value">
                    {displayValue(student.address)}
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

export default StudentProfilePage;
