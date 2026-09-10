import React from 'react'
import AllTypeNotficationDataTable from '../../../components/AllTypeNotficationDataTable'
import baseURL from '../../../utils/baseUrl'

const TimetableReportPage = () => {
    const timetableColumns = [
        {data:"id",title:"ID"},
        {data:"batch_name",title:"Batch"},
        {data:"class_name",title:"Class"},
        {data:"division_name",title:"Division"},  
        {data:"subject_name",title:"Subject", defaultContent:""},
        
        {data:"valid_from",title:"Valid From", defaultContent:""},
        {data:"staff_name",title:"Teacher", defaultContent:""},
        {
          data: null,
          title: "Actions",
          orderable: false,
          searchable: false,
          render: (data, type, row) => {
            return `
              <div class="table-action-group">
                <button type="button" class="table-action-btn table-action-view-document" data-id="${row.id}" title="View document">View</button>
                <button type="button" class="table-action-btn table-action-download-document" data-id="${row.id}" title="Download document">Download</button>
              </div>
            `;
          },
        },
        
    ]
  return (
    <div>
    
      <AllTypeNotficationDataTable url={`${baseURL}/api/timetables`} columns={timetableColumns} pagename='Timetables'/>
    </div>
  )
}

export default TimetableReportPage