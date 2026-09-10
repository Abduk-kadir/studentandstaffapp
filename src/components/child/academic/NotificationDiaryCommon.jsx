import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import baseURL from '../../../utils/baseUrl';
import { Icon } from '@iconify/react/dist/iconify.js';
import Loader from '../../../helper/Loader';
import '../../../assets/css/mastercom.css';
import {useDispatch,useSelector} from "react-redux";
import { getStaffData } from "../../../redux/slices/registrationNo";


const validationSchema = Yup.object({
  message: Yup.string().required('Message is required'),
  document: Yup.mixed()
    .nullable()
    .test('fileSize', 'File size must be 1 MB or less', (value) =>
      !value || value.size <= 1024 * 1024
    )
    .test('fileType', 'Only PDF or JPG files are allowed', (value) =>
      !value || ['application/pdf', 'image/jpeg', 'image/jpg'].includes(value.type)
    ),
});

const initialValues = {
  message: '',
  document: null,
  batches: [],
  classes: [],
  divisions: [],
  staffGroup: '',
  subject: '',
};

const normalizeListResponse = (res) => {
  const payload = res?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getOptionId = (item) => item?.optionId ?? item?.id ?? item?._id ?? '';

const getRawId = (item) => item?.id ?? item?._id ?? '';

const buildSubmitTargets = (selectedDivisionKeys, divisionOptions, message, subjectId, staffId) =>
  selectedDivisionKeys
    .map((key) =>
      divisionOptions.find((o) => String(getOptionId(o)) === String(key))
    )
    .filter(Boolean)
    .map((o) => ({
      batch: Number(o.batchId),
      class: Number(o.classId),
      division: Number(getRawId(o)),
      message,
      staffid: Number(staffId),
      ...(subjectId ? { subject: Number(subjectId) } : {}),
    }));

const getApiMessage = (payload) => {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  return payload.message || payload.error || payload.msg || payload.data?.message || '';
};

const parseProgramSubjects = (payload) => {
  const list = Array.isArray(payload?.data) ? payload.data : [];
  const subjectMap = new Map();
  list.forEach((item) => {
    const subject = item?.subject;
    if (subject?.id && !subjectMap.has(subject.id)) {
      subjectMap.set(subject.id, subject);
    }
  });
  return Array.from(subjectMap.values());
};

const NotificationDiaryCommon = ({ isSubject = false,formType }) => {
  const [activeTab, setActiveTab] = useState('student');
  const [batchOptions, setBatchOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [staffGroupOptions, setStaffGroupOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const staff = useSelector((state) => state.registrationNo.staff?.data);
  const staffid = staff?.id;

  const dispatch=useDispatch();

  useEffect(()=>{
    console.log('calling use effect in dashboard admin')
    const token=localStorage.getItem('token');
    console.log('token**********************:',token)
    if(!staffid){
      dispatch(getStaffData({token:token}))
    }
    console.log("end")
  },[])

  useEffect(() => {
    const fetchOptions = async () => {
      const [batchRes, staffGroupRes] = await Promise.allSettled([
        axios.get(`${baseURL}/api/batches`),
        axios.get(`${baseURL}/api/staff-groups`),
      ]);

      if (batchRes.status === 'fulfilled') {
        setBatchOptions(normalizeListResponse(batchRes.value));
      }
      if (staffGroupRes.status === 'fulfilled') {
        setStaffGroupOptions(normalizeListResponse(staffGroupRes.value));
      }
    };
    fetchOptions();
  }, []);

  const fetchBatchRelations = async (batchIds, setFieldValue) => {
    setFieldValue('classes', []);
    setFieldValue('divisions', []);
    setFieldValue('subject', '');
    setClassOptions([]);
    setDivisionOptions([]);
    setSubjectOptions([]);

    const ids = (batchIds || []).filter(Boolean);
    if (!ids.length) return;

    try {
      const results = await Promise.all(
        ids.map((id) => axios.get(`${baseURL}/api/batches/${id}/relations`))
      );
      const classMap = new Map();
      const divisionMap = new Map();
      results.forEach((res) => {
        const batch = res?.data?.batch || {};
        const batchId = batch?.id;
        const batchName = batch?.batch_name ?? batch?.name ?? '';
        const classes = res?.data?.class || [];
        const divisions = res?.data?.division || [];
        const batchmasters = res?.data?.batchmasters || res?.data?.batchMasters || [];

        classes.forEach((item) => {
          const classId = getRawId(item);
          const optionId = `${batchId}-${classId}`;
          classMap.set(optionId, {
            ...item,
            batchId,
            batch_name: batchName,
            optionId,
          });
        });

        const addDivisionOption = (cls, div) => {
          const classId = getRawId(cls);
          const divisionId = getRawId(div);
          const optionId = `${batchId}-${classId}-${divisionId}`;
          divisionMap.set(optionId, {
            ...div,
            classId,
            class_name: cls?.class_name ?? cls?.name ?? '',
            batchId,
            optionId,
          });
        };

        if (batchmasters.length) {
          batchmasters.forEach((bm) => {
            const cls = classes.find((c) => String(c.id) === String(bm.classId));
            const div = divisions.find(
              (d) => String(d.id) === String(bm.divisionId ?? bm.divId)
            );
            if (cls && div) addDivisionOption(cls, div);
          });
        } else {
          classes.forEach((cls) => {
            divisions.forEach((div) => addDivisionOption(cls, div));
          });
        }
      });
      setClassOptions(Array.from(classMap.values()));
      setDivisionOptions(Array.from(divisionMap.values()));
    } catch (error) {
      console.error('Failed to fetch batch relations', error);
    }
  };

  const fetchClassSubjects = async (classOptionKeys, setFieldValue) => {
    setFieldValue('subject', '');
    const classIds = (classOptionKeys || [])
      .map((key) =>
        classOptions.find((c) => String(getOptionId(c)) === String(key))
      )
      .filter(Boolean)
      .map((c) => String(getRawId(c)));
    const uniqueClassIds = [...new Set(classIds)];

    if (!uniqueClassIds.length) {
      setSubjectOptions([]);
      return;
    }

    try {
      const results = await Promise.all(
        uniqueClassIds.map((id) =>
          axios.get(`${baseURL}/api/program-subjects?classId=${id}`)
        )
      );
      const subjectMap = new Map();
      results.forEach((res) => {
        parseProgramSubjects(res?.data).forEach((s) => {
          if (s?.id && !subjectMap.has(s.id)) subjectMap.set(s.id, s);
        });
      });
      setSubjectOptions(Array.from(subjectMap.values()));
    } catch (error) {
      console.error('Failed to fetch program subjects', error);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const formData = new FormData();
    const submitUrl = isSubject
      ? `${baseURL}/api/diaries`
      : `${baseURL}/api/student-notifications`;

    try {
      setSubmitting(true);

      if (activeTab === 'staff') {
        formData.append('message', values.message);
        formData.append('staffGroup', values.staffGroup);
        if (values.document) formData.append('document', values.document);
      } else {
        const rows = buildSubmitTargets(
          values.divisions,
          divisionOptions,
          values.message,
          isSubject ? values.subject : '',
          staffid
        );

        if (!rows.length) {
          setErrorMsg('Select at least one batch, class and division combination.');
          setLoading(false);
          setSubmitting(false);
          return;
        }

        formData.append('rows', JSON.stringify(rows));
        if (values.document) formData.append('document', values.document);
      }

      const res = await axios.post(submitUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
   
      
      setSuccessMsg(getApiMessage(res?.data) || 'Sent successfully');
      resetForm();
    } catch (error) {
      console.error('Send failed:', error);
      setErrorMsg(
        getApiMessage(error.response?.data) ||
          error.message ||
          'Failed to send. Please try again.'
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const staffView = () => (
    <div className="chfi-root">
      <div className="field-row">
        <label className="form-label mb-1">
          <span className="label-dot" />
          Staff Group
        </label>
        <div className="icon-field">
          <span className="icon">
            <Icon icon="solar:users-group-rounded-bold-duotone" width="16" />
          </span>
          <Field as="select" name="staffGroup" className="form-select">
            <option value="">Select Staff Group</option>
            {staffGroupOptions.map((g) => (
              <option key={g?.id} value={g?.id ?? ''}>
                {g?.group_name ?? g?.name}
              </option>
            ))}
          </Field>
        </div>
      </div>
    </div>
  );

  const MultiChipSelect = ({
    label,
    fieldName,
    options,
    optionLabel,
    values,
    setFieldValue,
    disabled = false,
    onSelectionChange,
    icon,
  }) => {
    const selected = (values[fieldName] || []).filter(Boolean).map(String);
    const available = options.filter(
      (o) => !selected.includes(String(getOptionId(o)))
    );

    const handleAdd = (e) => {
      const val = e.target.value;
      if (!val || selected.includes(String(val))) return;
      const nextSelected = [...selected, String(val)];
      setFieldValue(fieldName, nextSelected);
      e.target.value = '';
      onSelectionChange?.(nextSelected);
    };

    const handleRemove = (val) => {
      const nextSelected = selected.filter((v) => v !== val);
      setFieldValue(fieldName, nextSelected);
      onSelectionChange?.(nextSelected);
    };

    const getLabel = (id) => {
      const opt = options.find((o) => String(getOptionId(o)) === String(id));
      return opt ? optionLabel(opt) : id;
    };

    return (
      <div className="field-row">
        <label className="form-label mb-1">
          <span className="label-dot" />
          {label}
        </label>
        <div className={`chip-select-box${icon ? ' has-icon' : ''}`}>
          {icon && (
            <span className="chip-select-icon">
              <Icon icon={icon} width="16" />
            </span>
          )}
          {selected.map((val) => (
            <span className="chip-item" key={val}>
              {getLabel(val)}
              <button type="button" className="chip-remove" onClick={() => handleRemove(val)}>
                <Icon icon="solar:close-square-bold" width="14" />
              </button>
            </span>
          ))}
          <select
            className="chip-select-input"
            onChange={handleAdd}
            value=""
            disabled={disabled}
          >
            <option value="">+ Select {label}</option>
            {available.map((o) => (
              <option key={getOptionId(o)} value={getOptionId(o)}>
                {optionLabel(o)}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const studentView = (values, setFieldValue) => {
    const selectedClassKeys = (values.classes || []).filter(Boolean).map(String);
    const filteredDivisionOptions = selectedClassKeys.length
      ? divisionOptions.filter((d) =>
          selectedClassKeys.includes(`${d.batchId}-${d.classId}`)
        )
      : [];

    const handleClassChange = (nextClassKeys) => {
      const classKeys = (nextClassKeys || []).map(String);
      const validDivisions = (values.divisions || [])
        .filter(Boolean)
        .map(String)
        .filter((divKey) => {
          const div = divisionOptions.find(
            (d) => String(getOptionId(d)) === divKey
          );
          return div && classKeys.includes(`${div.batchId}-${div.classId}`);
        });
      setFieldValue('divisions', validDivisions);
      if (isSubject) {
        fetchClassSubjects(classKeys, setFieldValue);
      }
    };

    return (
    <div className="chfi-root">
      <MultiChipSelect
        label="Batch"
        fieldName="batches"
        options={batchOptions}
        optionLabel={(b) => b?.batch_name ?? b?.name ?? b?.title}
        values={values}
        setFieldValue={setFieldValue}
        onSelectionChange={(batchIds) => fetchBatchRelations(batchIds, setFieldValue)}
        icon="solar:diploma-bold-duotone"
      />
      <MultiChipSelect
        label="Class"
        fieldName="classes"
        options={classOptions}
        optionLabel={(c) => {
          const batchName = c?.batch_name ?? '';
          const className = c?.class_name ?? c?.name ?? '';
          return batchName ? `${batchName} - ${className}` : className;
        }}
        values={values}
        setFieldValue={setFieldValue}
        disabled={!values.batches?.length}
        onSelectionChange={handleClassChange}
        icon="solar:square-academic-cap-bold-duotone"
      />
      <MultiChipSelect
        label="Division"
        fieldName="divisions"
        options={filteredDivisionOptions}
        optionLabel={(d) => {
          const className = d?.class_name ?? '';
          const divisionName = d?.division_name ?? d?.name ?? '';
          return className ? `${className} - ${divisionName}` : divisionName;
        }}
        values={values}
        setFieldValue={setFieldValue}
        disabled={!selectedClassKeys.length}
        icon="solar:widget-bold-duotone"
      />
      {isSubject && (
        <div className="field-row">
          <label className="form-label mb-1">
            <span className="label-dot" />
            Subject
          </label>
          <div className="icon-field">
            <span className="icon">
              <Icon icon="solar:book-bold-duotone" width="16" />
            </span>
            <Field
              as="select"
              name="subject"
              className="form-select"
              disabled={!selectedClassKeys.length}
            >
              <option value="">Select Subject</option>
              {subjectOptions.map((s) => (
                <option key={s?.id} value={s?.id ?? ''}>
                  {s?.subject_name ?? s?.name ?? s?.value}
                </option>
              ))}
            </Field>
          </div>
        </div>
      )}
    </div>
    );
  };

  return (
    <div className="chfi-wrapper mb-3">
      <div className="chfi-card">
        <div className="card-header">
          <div className="header-row">
            <span className="header-icon">
              <Icon icon="solar:bell-bold-duotone" width="24" />
            </span>
            <div>
              <h5 className="card-title">Send {formType}</h5>
            </div>
          </div>
        </div>

        <div className="card-body">
          {successMsg && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {successMsg}
              <button type="button" className="btn-close" onClick={() => setSuccessMsg('')} />
            </div>
          )}
          {errorMsg && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {errorMsg}
              <button type="button" className="btn-close" onClick={() => setErrorMsg('')} />
            </div>
          )}
          <div className="form-area">
          <div className="chfi-root d-flex gap-2 mb-3">
            {!isSubject && <button
              type="button"
              className={activeTab === 'student' ? 'btn-submit' : 'btn-reset'}
              onClick={() => setActiveTab('student')}
            >
              <Icon icon="solar:user-bold-duotone" width="15" />
              Student
            </button>}
            {!isSubject &&<button
              type="button"
              className={activeTab === 'staff' ? 'btn-submit' : 'btn-reset'}
              onClick={() => setActiveTab('staff')}
            >
              <Icon icon="solar:user-id-bold-duotone" width="15" />
              Staff
            </button>}
          </div>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values, resetForm }) => (
              <Form className="chfi-root">
                {loading && <Loader message="Sending..." />}

                <div>
                  {activeTab === 'student' ? studentView(values, setFieldValue) : staffView()}
                </div>

                <div className="field-row">
                  <label className="form-label mb-1">
                    <span className="label-dot" />
                    Message <span className="text-danger">*</span>
                  </label>
                  <div>
                    <Field
                      as="textarea"
                      name="message"
                      rows={5}
                      className="form-control"
                      placeholder="Enter notification message..."
                    />
                    <div style={{ minHeight: '1.25rem' }}>
                      <ErrorMessage
                        name="message"
                        component="div"
                        className="text-danger small mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="field-row">
                  <label className="form-label mb-1">
                    <span className="label-dot" />
                    Document <span className="text-muted fw-normal">( Upload PDF or JPG. Maximum file size: 1 MB. )</span>
                  </label>
                  <div>
                    <input
                      type="file"
                      name="document"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg"
                      onChange={(e) =>
                        setFieldValue('document', e.currentTarget.files[0] || null)
                      }
                    />
                    <div style={{ minHeight: '1.25rem' }}>
                      <ErrorMessage
                        name="document"
                        component="div"
                        className="text-danger small mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-submit d-inline-flex align-items-center gap-2"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting ? (
                      <>
                        <Icon icon="line-md:loading-loop" width="16" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:plain-bold-duotone" width="18" />
                        Send
                      </>
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDiaryCommon;
