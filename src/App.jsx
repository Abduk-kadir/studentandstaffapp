import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RouteScrollToTop from "./helper/RouteScrollToTop";

const StaffLayout = lazy(() => import("./staffLayout/StaffLayout"));
const StaffDashboardPage = lazy(() => import("./pages/staffPages/StaffDashboardPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const LoginPageSecond = lazy(() => import("./pages/LoginPageSecond"));
const StaffRegistrationPage = lazy(() => import("./pages/AdminPages/staff/staffRegistrationPage"));
const PersonalInformationForm = lazy(() =>
  import("./components/child/PersonalInformationForm")
);
const Registration = lazy(() => import("./components/child/Registration"));
const SubjectStage = lazy(() => import("./components/child/SubjectStage"));
const DocumentStage = lazy(() => import("./components/child/DocumentStage"));
const DeclarationStage = lazy(() =>
  import("./components/child/DeclarationStage")
);
const ParentParticularStage = lazy(() =>
  import("./components/child/ParentParticularStage")
);
const EducationalDetailStage = lazy(() =>
  import("./components/child/EducationalDetailStage")
);
const TransportDetailStage = lazy(() =>
  import("./components/child/TransportDetailStage")
);
const OtherInformationStage = lazy(() =>
  import("./components/child/OtherInformationStage")
);
const CompletedStage = lazy(() => import("./components/child/CompletedStage"));

const TakeInAndOutAttendancePage = lazy(() =>
  import("./pages/AdminPages/academic/TakeInAndOutAttendancePage")
);
const NotificationPage = lazy(() =>
  import("./pages/AdminPages/academic/NotificationPage")
);
const DiaryPage = lazy(() => import("./pages/AdminPages/academic/DiaryPage"));
const NotesPage = lazy(() => import("./pages/AdminPages/academic/NotesPage"));
const AboutSchoolPage = lazy(() => import("./pages/studentPages/aboutSchoolPage"));
const AssignmentPage = lazy(() =>
  import("./pages/AdminPages/academic/AssignmentPage")
);
const TimetablePage = lazy(() =>
  import("./pages/AdminPages/academic/TimetablePage")
);

const StudentLayout = lazy(() => import("./studentLayout/StudentLayout"));
const StudentDashboard = lazy(() =>
  import("./pages/studentPages/StudentDashboardPage")
);
const StudentFee = lazy(() => import("./components/child/student/StudentFee"));
const StudentDiaryPage = lazy(() => import("./pages/studentPages/StudentDiaryPage"));
const StudentNotesPage = lazy(() => import("./pages/studentPages/StudentNotesPage"));
const StudentEventPage = lazy(() => import("./pages/studentPages/StudentEventPage"));
const HolidayPage = lazy(() => import("./pages/studentPages/HolidayPage"));
const StudentProfilePage=lazy(() => import("./pages/studentPages/StudentProfilePage"));
const StudentAttendancePage = lazy(() =>
  import("./pages/studentPages/StudentAttendancePage")
);
const EmergencyContactPage = lazy(() =>
  import("./pages/studentPages/EmergencyContactPage")
);
const StudentAdmissionStatus = lazy(() =>
  import("./components/child/student/StudentAdmissionStatus")
);

const routeFallback = (
  <div className="d-flex justify-content-center align-items-center p-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function App() {
  let user = true;
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Suspense fallback={routeFallback}>
        <Routes>
          <Route>
            <Route
              path="/"
              element={
                !user ? <Navigate to="/dashboard" replace /> : <LoginPage />
              }
            />
            <Route path="/registration" element={<Registration />} />
            <Route path="/staff-registration" element={<StaffRegistrationPage />} />
            <Route path="/login-second" element={<LoginPageSecond/>}/>
            <Route
              path="/personal-information"
              element={<PersonalInformationForm />}
            />
            <Route
              path="/educational-detail-stage"
              element={<EducationalDetailStage />}
            />
            <Route path="/subject-stage" element={<SubjectStage />} />
            <Route
              path="/parent-particular-stage"
              element={<ParentParticularStage />}
            />
            <Route
              path="/transport-detail-stage"
              element={<TransportDetailStage />}
            />
            <Route
              path="/other-information-stage"
              element={<OtherInformationStage />}
            />
            <Route path="/declaration-stage" element={<DeclarationStage />} />
            <Route path="/document-stage" element={<DocumentStage />} />
            <Route path="/complete-stage" element={<CompletedStage />} />

            {/*student route start*/}

            <Route path="studentdashboard" element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route
                path="admission-accept-status"
                element={<StudentAdmissionStatus />}
              />
              <Route path="dues-fees" element={<StudentFee />} />
              <Route path="notes" element={<StudentNotesPage />} />
              <Route path="event" element={<StudentEventPage />} />
              <Route path="holiday" element={<HolidayPage />} />
              <Route path="about-school" element={<AboutSchoolPage />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="emergency-contact" element={<EmergencyContactPage />} />
              <Route path="profile" element={<StudentProfilePage />} />
              <Route path=":slug" element={<StudentDiaryPage />} />
            </Route>

            {/*staff route start*/}

            <Route path="staffdashboard" element={<StaffLayout />}>
              <Route index element={<StaffDashboardPage />} />
              <Route
                path="student-attendance"
                element={<TakeInAndOutAttendancePage />}
              />
              <Route path="diary" element={<DiaryPage />} />
              <Route path="notification" element={<NotificationPage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="assignment" element={<AssignmentPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="about-school" element={<AboutSchoolPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
