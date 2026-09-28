import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";
import axios from "axios";
import baseURL from "../utils/baseUrl";
import { Icon } from "@iconify/react/dist/iconify.js";
import "../assets/css/mastercom.css";
import "../assets/css/academicOfflineFeeReport.css";
import DocumentViewer from "./child/DocumentViewer";
import { downloadFile } from "../utils/downloadFile";

const PAGE_SIZE = 10;
const MOBILE_MQ = "(max-width: 767.98px)";

const buildFileUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${baseURL}${path}`;
};

const getDocumentUrl = (row) =>
  row?.diary_url ||
  row?.notes_url ||
  row?.assignment_url ||
  row?.timetable_url ||
  row?.document_url ||
  "";

const getNestedValue = (obj, path) => {
  if (!path || typeof path !== "string") return undefined;
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
};

const formatCardValue = (field, row) => {
  const raw = getNestedValue(row, field.data);
  if (typeof field.render === "function") {
    const rendered = field.render(raw, "display", row);
    if (rendered == null || rendered === "") return "";
    return typeof rendered === "string" ? rendered : String(rendered);
  }
  if (raw == null || raw === "") return "";
  if (typeof raw === "object") return "";
  return String(raw);
};

const getStudentFullName = (row) =>
  [row?.first_name, row?.last_name].filter(Boolean).join(" ") || "—";

const getStudentClassName = (row) =>
  row?.class_name || row?.classInfo?.class_name || "—";

const getStudentDivisionName = (row) =>
  row?.division_name || row?.divisionInfo?.division_name || "—";

const STUDENT_DETAIL_FIELDS = [
  { key: "reg_no", label: "Registration No", get: (r) => r?.reg_no ?? "—" },
  { key: "rollnumber", label: "Roll Number", get: (r) => r?.rollnumber ?? "—" },
  { key: "first_name", label: "First Name", get: (r) => r?.first_name || "—" },
  { key: "last_name", label: "Last Name", get: (r) => r?.last_name || "—" },
  { key: "email", label: "Email", get: (r) => r?.email || "—" },
  { key: "class", label: "Class", get: getStudentClassName },
  { key: "division", label: "Division", get: getStudentDivisionName },
  { key: "gender", label: "Gender", get: (r) => r?.gender || "—" },
  { key: "dob", label: "Date of Birth", get: (r) => r?.dob || "—" },
  { key: "mother_name", label: "Mother Name", get: (r) => r?.mother_name || "—" },
  { key: "father_name", label: "Father Name", get: (r) => r?.father_name || "—" },
  { key: "contact_number", label: "Contact Number", get: (r) => r?.contact_number || "—" },
  {
    key: "contact_number_second",
    label: "Alt. Contact",
    get: (r) => r?.contact_number_second || "—",
  },
  { key: "address", label: "Address", get: (r) => r?.address || "—" },
];

const StudentDataTable = ({ url, columns, pagename, showStudentDetail = false }) => {
  const tableRef = useRef(null);
  const datatableRef = useRef(null);
  const sentinelRef = useRef(null);
  const mobileLoadLockRef = useRef(false);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_MQ).matches : false
  );

  const [classes, setClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [batches, setBatches] = useState([]);

  const [classFilter, setClassFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [viewUrl, setViewUrl] = useState(null);
  const [detailStudent, setDetailStudent] = useState(null);

  const [mobileItems, setMobileItems] = useState([]);
  const [mobileStart, setMobileStart] = useState(0);
  const [mobileHasMore, setMobileHasMore] = useState(true);
  const [mobileLoading, setMobileLoading] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [mobileFilterTick, setMobileFilterTick] = useState(0);

  const classFilterRef = useRef("");
  const fromDateRef = useRef("");
  const toDateRef = useRef("");
  const batchFilterRef = useRef("");
  const divisionFilterRef = useRef("");
  const setViewUrlRef = useRef(setViewUrl);
  const setDetailStudentRef = useRef(setDetailStudent);

  const cardFields = useMemo(
    () =>
      (columns || []).filter(
        (col) => col?.data && col.data !== "id" && typeof col.data === "string"
      ),
    [columns]
  );

  useEffect(() => {
    setViewUrlRef.current = setViewUrl;
  }, []);

  useEffect(() => {
    setDetailStudentRef.current = setDetailStudent;
  }, []);

  useEffect(() => {
    classFilterRef.current = classFilter;
  }, [classFilter]);

  useEffect(() => {
    fromDateRef.current = fromDate;
  }, [fromDate]);

  useEffect(() => {
    toDateRef.current = toDate;
  }, [toDate]);

  useEffect(() => {
    batchFilterRef.current = batchFilter;
  }, [batchFilter]);

  useEffect(() => {
    divisionFilterRef.current = divisionFilter;
  }, [divisionFilter]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res1 = await axios.get(`${baseURL}/api/batches`);
        setBatches(res1?.data?.data || []);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/batches/${batchFilter}/relations`);
        setClasses(res?.data?.class || []);
        setDivisions(res?.data?.division || []);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };
    if (!batchFilter) {
      setClasses([]);
      setDivisions([]);
      return;
    }
    fetchData();
  }, [batchFilter]);

  const buildFilterParams = useCallback(
    () => ({
      className: classFilterRef.current.trim(),
      fromDate: fromDateRef.current.trim(),
      toDate: toDateRef.current.trim(),
      batchId: batchFilterRef.current.trim(),
      divisionId: divisionFilterRef.current.trim(),
    }),
    []
  );

  const loadMobilePage = useCallback(
    async (start = 0, reset = false) => {
      if (mobileLoadLockRef.current) return;
      mobileLoadLockRef.current = true;
      setMobileLoading(true);
      setMobileError("");

      try {
        const res = await axios.get(url, {
          params: {
            draw: 1,
            start,
            length: PAGE_SIZE,
            filter: buildFilterParams(),
          },
        });

        const rows = res.data?.data || [];
        const total = Number(res.data?.recordsFiltered ?? res.data?.recordsTotal ?? 0);

        setMobileItems((prev) => {
          const next = reset ? rows : [...prev, ...rows];
          setMobileHasMore(next.length < total && rows.length > 0);
          return next;
        });
        setMobileStart(start + rows.length);
      } catch (err) {
        console.error("Failed to load report data", err);
        setMobileError("Failed to load data. Please try again.");
        if (reset) {
          setMobileItems([]);
          setMobileHasMore(false);
        }
      } finally {
        setMobileLoading(false);
        mobileLoadLockRef.current = false;
      }
    },
    [url, buildFilterParams]
  );

  const handleFilter = () => {
    if (isMobile) {
      setMobileItems([]);
      setMobileStart(0);
      setMobileHasMore(true);
      setMobileFilterTick((t) => t + 1);
      return;
    }
    if (datatableRef.current) {
      datatableRef.current.draw();
    }
  };

  useEffect(() => {
    if (!isMobile) return;
    loadMobilePage(0, true);
  }, [isMobile, url, mobileFilterTick, loadMobilePage]);

  useEffect(() => {
    if (!isMobile || !mobileHasMore || mobileLoading) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && mobileHasMore && !mobileLoadLockRef.current) {
          loadMobilePage(mobileStart, false);
        }
      },
      { root: null, rootMargin: "120px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile, mobileHasMore, mobileLoading, mobileStart, loadMobilePage]);

  useEffect(() => {
    if (isMobile || !tableRef.current) return;

    datatableRef.current = $(tableRef.current).DataTable({
      pageLength: PAGE_SIZE,
      processing: true,
      serverSide: true,
      destroy: true,

      ajax: {
        url,
        type: "GET",
        data: (d) => {
          d.filter = buildFilterParams();
        },
      },
      columns,
      createdRow: function (row, data) {
        const documentUrl = getDocumentUrl(data);

        $(row).find(".table-action-view-document").on("click", function () {
          if (!documentUrl) return;
          setViewUrlRef.current(buildFileUrl(documentUrl));
        });

        $(row)
          .find(".table-action-download-document")
          .on("click", async function () {
            if (!documentUrl) return;
            try {
              await downloadFile(documentUrl);
            } catch (err) {
              console.error("Download failed:", err);
            }
          });

        $(row).find(".table-action-view-detail").on("click", function () {
          setDetailStudentRef.current(data);
        });
      },

      headerCallback: function (thead) {
        $(thead).find("th").css("white-space", "nowrap");
      },
    });

    return () => {
      if (datatableRef.current) {
        datatableRef.current.destroy(true);
        datatableRef.current = null;
      }
    };
  }, [url, columns, isMobile, buildFilterParams]);

  const handleViewDocument = (row) => {
    const documentUrl = getDocumentUrl(row);
    if (!documentUrl) return;
    setViewUrl(buildFileUrl(documentUrl));
  };

  const handleDownloadDocument = async (row) => {
    const documentUrl = getDocumentUrl(row);
    if (!documentUrl) return;
    try {
      await downloadFile(documentUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="fee-report-scope d-flex flex-column gap-4 pb-2">
      <div className="chfi-wrapper">
        <section className="chfi-card" aria-label="Report filters">
          <div className="card-header">
            <div className="header-row">
              <span className="header-icon">
                <Icon icon="solar:filter-bold-duotone" width="22" />
              </span>
              <div>
                <h5 className="card-title">{`Filter ${pagename}`}</h5>
              </div>
            </div>
          </div>

          <div className="card-body">
            <div className="report-filter-grid">
              

              <div className="report-filter-field">
                <label className="form-label">
                  <span className="label-dot" />
                  Batch
                </label>
                <div className="icon-field">
                  <span className="icon">
                    <Icon icon="solar:layers-bold-duotone" width="18" />
                  </span>
                  <select
                    className="form-select"
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value)}
                  >
                    <option value="">Select batch</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batch_name ?? b.academic_year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="report-filter-field">
                <label className="form-label">
                  <span className="label-dot" />
                  Class
                </label>
                <div className="icon-field">
                  <span className="icon">
                    <Icon icon="solar:square-academic-cap-bold-duotone" width="18" />
                  </span>
                  <select
                    className="form-select"
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                  >
                    <option value="">Select class</option>
                    {classes.map((elem) => (
                      <option key={elem?.id} value={elem?.id ?? elem?.class_name}>
                        {elem?.class_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="report-filter-field">
                <label className="form-label">
                  <span className="label-dot" />
                  Division
                </label>
                <div className="icon-field">
                  <span className="icon">
                    <Icon icon="solar:widget-bold-duotone" width="18" />
                  </span>
                  <select
                    className="form-select"
                    value={divisionFilter}
                    onChange={(e) => setDivisionFilter(e.target.value)}
                  >
                    <option value="">Select division</option>
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.division_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="report-filter-field report-filter-action">
                <button
                  type="button"
                  className="btn-submit chfi-root"
                  onClick={handleFilter}
                >
                  <Icon icon="solar:magnifer-bold-duotone" width="18" />
                  Apply filters
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        className="card fee-report-card fee-report-table-card basic-data-table border-0 mb-0"
        aria-label="Notification report data"
      >
        <div className="card-header border-0 bg-dark py-3 px-4">
          <div className="d-flex align-items-center gap-3 min-w-0">
            <span className="fee-report-icon-wrap bg-white bg-opacity-10 text-white border border-white border-opacity-25">
              <Icon icon="solar:document-text-bold-duotone" className="fs-4" />
            </span>
            <div className="min-w-0">
              <h6 className="card-title mb-0 fw-semibold text-white text-truncate">
                {pagename}
              </h6>
            </div>
          </div>
        </div>

        <div className="card-body px-3 px-md-4 pb-4">
          {isMobile ? (
            <div className="report-mobile-list" aria-live="polite">
              {mobileItems.length === 0 && !mobileLoading && !mobileError && (
                <div className="report-mobile-empty">
                  <span className="report-mobile-empty__icon" aria-hidden="true">
                    <Icon icon="solar:inbox-line-bold-duotone" width="28" />
                  </span>
                  <p className="mb-0">No records found</p>
                </div>
              )}

              {mobileError && (
                <div className="report-mobile-error">
                  <Icon icon="solar:danger-triangle-bold-duotone" width="20" />
                  <p className="mb-0">{mobileError}</p>
                </div>
              )}

              <div className="report-mobile-cards">
                {mobileItems.map((row, index) => {
                  if (showStudentDetail) {
                    const studentRows = [
                      { key: "name", label: "Name", value: getStudentFullName(row) },
                      {
                        key: "reg_no",
                        label: "Registration No",
                        value: row?.reg_no != null ? String(row.reg_no) : "",
                      },
                      {
                        key: "contact_number",
                        label: "Contact Number",
                        value: row?.contact_number || "",
                      },
                      {
                        key: "class_name",
                        label: "Class",
                        value: getStudentClassName(row) === "—" ? "" : getStudentClassName(row),
                      },
                      {
                        key: "division_name",
                        label: "Division",
                        value:
                          getStudentDivisionName(row) === "—"
                            ? ""
                            : getStudentDivisionName(row),
                      },
                    ].filter((item) => item.value);

                    return (
                      <article
                        key={row.id ?? `row-${index}`}
                        className="report-mobile-card"
                      >
                        <div className="report-mobile-card__rows">
                          {studentRows.map((item) => (
                            <div key={item.key} className="report-mobile-row">
                              <span className="report-mobile-row__label">
                                {item.label}:
                              </span>
                              <span className="report-mobile-row__value">
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="report-mobile-card__actions">
                          <button
                            type="button"
                            className="report-mobile-action report-mobile-action--detail"
                            onClick={() => setDetailStudent(row)}
                          >
                            <Icon icon="solar:eye-bold-duotone" width="18" />
                            View Detail
                          </button>
                        </div>
                      </article>
                    );
                  }

                  const infoRows = [
                    {
                      key: "batch_name",
                      label: "Batch",
                      value: row?.batch_name || "",
                    },
                    {
                      key: "class_name",
                      label: "Class",
                      value: row?.class_name || row?.classInfo?.class_name || "",
                    },
                    {
                      key: "division_name",
                      label: "Division",
                      value:
                        row?.division_name || row?.divisionInfo?.division_name || "",
                    },
                  ].filter((item) => item.value);

                  const skipKeys = new Set([
                    "staff_name",
                    "staff",
                    "created_at",
                    "createdAt",
                    "batch_name",
                    "class_name",
                    "division_name",
                    "classInfo.class_name",
                    "divisionInfo.division_name",
                    "message",
                    "title",
                    "topic",
                  ]);

                  const extraRows = cardFields
                    .filter((field) => !skipKeys.has(field.data))
                    .map((field) => ({
                      key: field.data,
                      label: field.title || field.data,
                      value: formatCardValue(field, row),
                    }))
                    .filter((item) => item.value);

                  const messageText =
                    row?.message || row?.title || row?.topic || "";

                  return (
                    <article
                      key={row.id ?? `row-${index}`}
                      className="report-mobile-card"
                    >
                      <div className="report-mobile-card__rows">
                        {[...infoRows, ...extraRows].map((item) => (
                          <div key={item.key} className="report-mobile-row">
                            <span className="report-mobile-row__label">{item.label}:</span>
                            <span className="report-mobile-row__value">{item.value}</span>
                          </div>
                        ))}
                      </div>

                      {messageText ? (
                        <div className="report-mobile-card__message-wrap">
                          <span className="report-mobile-card__message-label">Message:</span>
                          <div className="report-mobile-card__message-box">
                            {messageText}
                          </div>
                        </div>
                      ) : null}

                      {getDocumentUrl(row) ? (
                        <div className="report-mobile-card__actions">
                          <button
                            type="button"
                            className="report-mobile-action report-mobile-action--view"
                            onClick={() => handleViewDocument(row)}
                          >
                            <Icon icon="solar:eye-bold-duotone" width="18" />
                            View
                          </button>
                          <button
                            type="button"
                            className="report-mobile-action report-mobile-action--download"
                            onClick={() => handleDownloadDocument(row)}
                          >
                            <Icon icon="solar:download-minimalistic-bold-duotone" width="18" />
                            Download
                          </button>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>

              <div ref={sentinelRef} className="report-mobile-sentinel" aria-hidden="true" />

              {mobileLoading && (
                <div className="report-mobile-loading">
                  <span className="report-mobile-spinner" aria-hidden="true" />
                  <span>Loading more…</span>
                </div>
              )}
              {!mobileHasMore && mobileItems.length > 0 && !mobileLoading && (
                <p className="report-mobile-end mb-0">You're all caught up</p>
              )}
            </div>
          ) : (
            <div
              className="table-responsive shadow-sm rounded-3 border"
              style={{ overflowY: "hidden", overflowX: "auto" }}
            >
              <table
                className="table bordered-table mb-0"
                id="dataTable"
                ref={tableRef}
              />
            </div>
          )}
        </div>
      </section>
      <DocumentViewer
        url={viewUrl}
        show={!!viewUrl}
        onClose={() => setViewUrl(null)}
      />

      {detailStudent ? (
        <div
          className="report-detail-modal"
          onClick={() => setDetailStudent(null)}
          role="presentation"
        >
          <div
            className="report-detail-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Student detail"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="report-detail-modal__header">
              <h5 className="report-detail-modal__title">Student Detail</h5>
              <button
                type="button"
                className="report-detail-modal__close"
                onClick={() => setDetailStudent(null)}
                aria-label="Close"
              >
                <Icon icon="solar:close-circle-bold" width={22} />
              </button>
            </div>
            <div className="report-detail-modal__body">
              {STUDENT_DETAIL_FIELDS.map(({ key, label, get }) => (
                <div key={key} className="report-detail-modal__row">
                  <span className="report-detail-modal__label">{label}</span>
                  <span className="report-detail-modal__value">
                    {get(detailStudent)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StudentDataTable;
