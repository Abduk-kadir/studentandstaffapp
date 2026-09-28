import React from "react";
import StudentDataTable from "../../../components/StudentDataTable";
import baseURL from "../../../utils/baseUrl";

const studentColumns = [
  { data: "id", title: "ID" },
  { data: "reg_no", title: "Registration No" },
  {
    data: "first_name",
    title: "Name",
    render: (_data, _type, row) =>
      [row?.first_name, row?.last_name].filter(Boolean).join(" ") || "—",
  },
  { data: "contact_number", title: "Contact Number" },
  {
    data: "classInfo.class_name",
    title: "Class",
    defaultContent: "—",
    render: (_data, _type, row) => row?.classInfo?.class_name || "—",
  },
  {
    data: "divisionInfo.division_name",
    title: "Division",
    defaultContent: "—",
    render: (_data, _type, row) => row?.divisionInfo?.division_name || "—",
  },
  {
    data: null,
    title: "Actions",
    orderable: false,
    searchable: false,
    render: (_data, _type, row) => `
      <div class="table-action-group">
        <button type="button" class="table-action-btn table-action-view-detail" data-id="${row?.id ?? ""}" title="View detail">View Detail</button>
      </div>
    `,
  },
];

const StudentListPage = () => {
  return (
    <div>
      <StudentDataTable
        url={`${baseURL}/api/parmanent-personal-information`}
        columns={studentColumns}
        pagename="Student List"
        showStudentDetail
      />
    </div>
  );
};

export default StudentListPage;
