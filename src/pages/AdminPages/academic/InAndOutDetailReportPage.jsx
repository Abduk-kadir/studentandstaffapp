import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import baseURL from "../../../utils/baseUrl";
import AttendanceReportList from "../../../components/child/academic/AttendanceReportList";
import "../../../assets/css/mastercom.css";
import "../../../assets/css/academicOfflineFeeReport.css";
import "../../../assets/css/staffAttendanceReport.css";

const STUDENT_FIELDS = [
  { key: "name", label: "Name" },
  { key: "reg_no", label: "Reg No" },
  { key: "class", label: "Class" },
  { key: "div", label: "Division" },
  { key: "roll_no", label: "Roll No" },
];

const InAndOutDetailReportPage = ({
  reportUrl = `${baseURL}/api/in-out-attendance/reports/detail`,
  title = "In / Out Detail Report",
  fields = STUDENT_FIELDS,
  getRowKey = (row) => row?.reg_no,
  renderSide,
}) => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("class_id");
  const divisionId = searchParams.get("division_id");

  const [batches, setBatches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);

  const [dateFilter, setDateFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [classFilter, setClassFilter] = useState(() => classId || "");
  const [divisionFilter, setDivisionFilter] = useState(() => divisionId || "");
  const [appliedFilters, setAppliedFilters] = useState(() =>
    classId && divisionId
      ? {
          filter: { className: classId, date: "", batchId: "", divisionId },
          submitCount: 0,
        }
      : null
  );

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/batches`);
        setBatches(res?.data?.data || []);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    if (!batchFilter) return;
    const fetchRelations = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/batches/${batchFilter}/relations`);
        setClasses(res?.data?.class || []);
        setDivisions(res?.data?.division || []);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };
    fetchRelations();
  }, [batchFilter]);

  const handleFilter = () => {
    setAppliedFilters((prev) => ({
      filter: {
        className: classFilter.trim(),
        date: dateFilter.trim(),
        batchId: batchFilter.trim(),
        divisionId: divisionFilter.trim(),
      },
      submitCount: (prev?.submitCount ?? 0) + 1,
    }));
  };

  return (
    <div className="fee-report-scope d-flex flex-column gap-4 pb-2">
      {!classId && !divisionId && (
        <div className="chfi-wrapper">
          <section className="chfi-card" aria-label="Report filters">
            <div className="card-header">
              <div className="header-row">
                <span className="header-icon">
                  <Icon icon="solar:filter-bold-duotone" width="22" />
                </span>
                <div>
                  <h5 className="card-title">Filter</h5>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="report-filter-grid">
                <div className="report-filter-field">
                  <label className="form-label">
                    <span className="label-dot" />
                    Date
                  </label>
                  <div className="icon-field">
                    <span className="icon">
                      <Icon icon="solar:calendar-bold-duotone" width="18" />
                    </span>
                    <input
                      className="form-control"
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                </div>

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
                      <option value="">All</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batch_name}
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
                      <option value="">All</option>
                      {classes.map((elem, index) => (
                        <option key={index} value={elem?.id ?? elem?.class_name}>
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
                      <option value="">All</option>
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
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {appliedFilters && (
      <section
        className="card fee-report-card fee-report-table-card basic-data-table border-0 mb-0"
        aria-label="Report data"
      >
        <div className="card-header border-0 bg-dark py-3 px-4">
          <div className="d-flex align-items-center gap-3 min-w-0">
            <span className="fee-report-icon-wrap bg-white bg-opacity-10 text-white border border-white border-opacity-25">
              <Icon icon="solar:document-text-bold-duotone" className="fs-4" />
            </span>
            <div className="min-w-0">
              <h6 className="card-title mb-0 fw-semibold text-white text-truncate">
                {title}
              </h6>
            </div>
          </div>
        </div>

        <div className="card-body px-3 px-md-4 pb-4">
          <AttendanceReportList
            key={appliedFilters.submitCount}
            url={reportUrl}
            filter={appliedFilters.filter}
            fields={fields}
            getRowKey={getRowKey}
            {...(renderSide ? { renderSide } : {})}
          />
        </div>
      </section>
      )}
    </div>
  );
};

export default InAndOutDetailReportPage;
