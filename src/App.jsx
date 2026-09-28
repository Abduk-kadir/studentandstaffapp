import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RouteScrollToTop from "./helper/RouteScrollToTop";

const StaffLayout = lazy(() => import("./staffLayout/StaffLayout"));
const StaffDashboardPage = lazy(() => import("./pages/staffPages/StaffDashboardPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const LoginPageSecond = lazy(() => import("./pages/LoginPageSecond"));



const TakeInAndOutAttendancePage = lazy(() =>
  import("./pages/AdminPages/academic/TakeInAndOutAttendancePage")
);
const StaffAttendancePage=lazy(() => import("./pages/AdminPages/academic/StaffAttendancePage"));
const StaffMyAttendancePage=lazy(() => import("./pages/AdminPages/academic/StaffMyAttendance"));
const StaffProfilePage=lazy(() => import("./pages/AdminPages/academic/StaffProfile"));

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


const StudentListPage = lazy(() => import("./pages/AdminPages/academic/StudentListPage"));

const StudentLayout = lazy(() => import("./studentLayout/StudentLayout"));
const StudentDashboard = lazy(() =>
  import("./pages/studentPages/StudentDashboardPage")
);
const StudentFee = lazy(() => import("./components/child/student/StudentFee"));
const StudentDiaryPage = lazy(() => import("./pages/studentPages/StudentDiaryPage"));
const StudentNotesPage = lazy(() => import("./pages/studentPages/StudentNotesPage"));
const StudentEventPage = lazy(() => import("./pages/studentPages/StudentEventPage"));
const HolidayPage = lazy(() => import("./pages/studentPages/HolidayPage"));
const PreodicTestPage = lazy(() => import("./components/child/student/PreodicTest"));
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
            
            <Route path="/login-second" element={<LoginPageSecond/>}/>
            
           

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
              <Route path="periodic-test" element={<PreodicTestPage />} />
              <Route path="about-school" element={<AboutSchoolPage />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="emergency-contact" element={<EmergencyContactPage />} />
              <Route path="profile" element={<StudentProfilePage />} />
              <Route path=":slug" element={<StudentDiaryPage />} />
            </Route>

            {/*staff route start*/}

            <Route path="staffdashboard" element={<StaffLayout />}>
              <Route index element={<StaffDashboardPage />} />
              <Route path="staff-attendance" element={<StaffAttendancePage />} />
              <Route path="my-attendance" element={<StaffMyAttendancePage />} />
              <Route
                path="student-attendance"
                element={<TakeInAndOutAttendancePage />}
              />
              <Route path="profile" element={<StaffProfilePage />} />
              <Route path="diary" element={<DiaryPage />} />
              <Route path="notification" element={<NotificationPage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="assignment" element={<AssignmentPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="about-school" element={<AboutSchoolPage />} />
              <Route path="student-list" element={<StudentListPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
