import baseURL from "../../../utils/baseUrl";
import InAndOutDetailReportPage from "./InAndOutDetailReportPage";

const SUMMARY_FIELDS = [
  { key: "class", label: "Class" },
  { key: "div", label: "Division" },
];

const displayCount = (value) => (value == null || value === "" ? "—" : value);

const renderSummaryCounts = (row) => (
  <div className="sar-summary">
    <span className="sar-summary__item sar-summary__item--total">
      <span className="sar-summary__label">Total</span>
      <span className="sar-summary__value">{displayCount(row?.total_student)}</span>
    </span>
    <span className="sar-summary__item sar-summary__item--present">
      <span className="sar-summary__label">Present</span>
      <span className="sar-summary__value">{displayCount(row?.present_count)}</span>
    </span>
    <span className="sar-summary__item sar-summary__item--absent">
      <span className="sar-summary__label">Absent</span>
      <span className="sar-summary__value">{displayCount(row?.absent_count)}</span>
    </span>
  </div>
);

const InAndOutSummaryReportPage = () => (
  <InAndOutDetailReportPage
    reportUrl={`${baseURL}/api/in-out-attendance/reports/summary`}
    title="In / Out Summary Report"
    fields={SUMMARY_FIELDS}
    getRowKey={(row) => `${row?.class ?? ""}-${row?.div ?? ""}`}
    renderSide={renderSummaryCounts}
  />
);

export default InAndOutSummaryReportPage;
