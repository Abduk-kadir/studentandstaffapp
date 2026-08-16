// LoginPage.jsx
import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Formik, Field, ErrorMessage, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import { useNavigate,useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import '../assets/css/loginPage.css';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';


import { getFCMToken } from '../services/fcmService';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email / Username is required'),
  password: Yup.string()
    .min(5, 'Password must be at least 5 characters')
    .required('Password is required'),
  academicYear: Yup.string()
    .required('Please select an academic year'),
  loginAs: Yup.string()
    .oneOf(['Parent', 'Staff'], 'Please select who you are logging in as')
    .required('Login role is required'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const [fcmToken, setFcmToken] = useState(null);
  const [searchParams]=useSearchParams()
  
 
  useEffect(() => {
    getFCMToken().then(setFcmToken);
  }, []);

  //for fully login use effect
  useEffect(() => {
    const email = searchParams.get('email');
    const password = searchParams.get('password');
    const token = searchParams.get('fcmToken') || fcmToken;
    const userRole = searchParams.get('userRole');
    const reg_no=searchParams.get('reg_no')
    if(!email || !password ||!userRole) return;
   
    const forceLogin = async () => {
      try {
       if(userRole=='Teacher'){
        
        const res = await axios.post(`${baseUrl}/api/staff/login`, {
        email,
        password,
        fcmToken: token,
       });
        localStorage.setItem('token', res?.data?.token);
        navigate('/staffdashboard');
       }
       if(userRole=="Parent"){
        const { data } = await axios.post(
          `${baseUrl}/api/parmanent-personal-information/login`,
          {
            email:email,
            password: password,
            reg_no:reg_no,
            fcmToken:token,
          }
        );
  
        localStorage.setItem('token', data?.token);
        localStorage.setItem('reg_no', data?.reg_no);
       
        navigate(`/studentdashboard`);
       }
        
      } catch (err) {
        console.error('Auto-login failed', err);
        alert(err?.response?.data?.message || 'Auto-login failed');
      }
    };

    forceLogin();
  }, []);


  const loginParent = async (values) => {
    let permanentRecords = [];

    try {
      const permanentRes = await axios.get(
        `${baseUrl}/api/parmanent-personal-information/email/${values.email}`
      );
      permanentRecords = permanentRes.data?.data ?? [];
    } catch {
      permanentRecords = [];
    }

    if (permanentRecords.length > 0) {
      const reg_no = permanentRecords[0]?.reg_no;
      const { data } = await axios.post(
        `${baseUrl}/api/parmanent-personal-information/login`,
        {
          email: values.email,
          password: values.password,
          reg_no,
          fcmToken,
        }
      );

      localStorage.setItem('token', data?.token);
      localStorage.setItem('reg_no', data?.reg_no);
      alert('Login successfully');
      navigate(`/studentdashboard`);
      return;
    }
    
  };

  return (
    <div className="login-container">
      <div className="login-panel">
        <div className="login-card">
          <div className="login-card__header">
            <div className="login-card__logo">
              <Icon icon="solar:buildings-2-bold-duotone" aria-hidden />
            </div>
            <p className="login-card__badge">Institute Portal</p>
            <h1 className="login-card__title">Welcome Back</h1>
            <p className="login-card__subtitle">
              Sign in to access your dashboard
            </p>
          </div>

          <Formik
              initialValues={{
                email: '',
                password: '',
                academicYear: '',
                loginAs: '',
              }}
              validationSchema={loginSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  if (values.loginAs === 'Parent') {
                    await loginParent(values);
                  } else if (values.loginAs === 'Staff') {
                    const res = await axios.post(`${baseUrl}/api/staff/login`, {
                      email: values.email,
                      password: values.password,
                      fcmToken,
                    });
                    localStorage.setItem('token', res?.data?.token);
                    navigate('/staffdashboard');
                  }
                } catch (err) {
                  alert(err?.response?.data?.message || 'Login failed');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, touched, errors, values, setFieldValue }) => (
                <FormikForm noValidate className="login-form">
                  <div className="login-form__grid">
                    <div className="login-field">
                      <label className="login-field__label" htmlFor="email">
                        <Icon icon="solar:letter-bold-duotone" aria-hidden />
                        Email
                      </label>
                      <Field
                        as={Form.Control}
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        className={`login-field__input${
                          touched.email && errors.email ? ' is-invalid' : ''
                        }`}
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="login-field__error"
                      />
                    </div>

                    <div className="login-field">
                      <label className="login-field__label" htmlFor="password">
                        <Icon icon="solar:lock-password-bold-duotone" aria-hidden />
                        Password
                      </label>
                      <Field
                        as={Form.Control}
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        className={`login-field__input${
                          touched.password && errors.password ? ' is-invalid' : ''
                        }`}
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="login-field__error"
                      />
                    </div>

                    <div className="login-field login-field--full">
                      <label className="login-field__label" htmlFor="academicYear">
                        <Icon icon="solar:calendar-mark-bold-duotone" aria-hidden />
                        Academic Year
                      </label>
                      <Field
                        as={Form.Select}
                        id="academicYear"
                        name="academicYear"
                        className={`login-field__input${
                          touched.academicYear && errors.academicYear
                            ? ' is-invalid'
                            : ''
                        }`}
                      >
                        <option value="">Select academic year</option>
                        <option value="2025-2026">2025-2026</option>
                        <option value="2024-2025">2024-2025</option>
                        <option value="2023-2024">2023-2024</option>
                        <option value="2022-2023">2022-2023</option>
                        <option value="2021-2022">2021-2022</option>
                      </Field>
                      <ErrorMessage
                        name="academicYear"
                        component="div"
                        className="login-field__error"
                      />
                    </div>

                    <div className="login-field login-field--full">
                      <span className="login-field__label">
                        <Icon icon="solar:user-id-bold-duotone" aria-hidden />
                        Login As
                      </span>
                      <div className="login-role">
                        <button
                          type="button"
                          className={`login-role__btn${
                            values.loginAs === 'Parent'
                              ? ' login-role__btn--active'
                              : ''
                          }`}
                          onClick={() => setFieldValue('loginAs', 'Parent')}
                        >
                          <Icon
                            icon="solar:users-group-rounded-bold-duotone"
                            aria-hidden
                          />
                          Parent
                        </button>
                        <button
                          type="button"
                          className={`login-role__btn${
                            values.loginAs === 'Staff'
                              ? ' login-role__btn--active'
                              : ''
                          }`}
                          onClick={() => setFieldValue('loginAs', 'Staff')}
                        >
                          <Icon
                            icon="solar:user-check-rounded-bold-duotone"
                            aria-hidden
                          />
                          Staff
                        </button>
                      </div>
                      <Field type="hidden" name="loginAs" />
                      <ErrorMessage
                        name="loginAs"
                        component="div"
                        className="login-field__error"
                      />
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    type="submit"
                    className="login-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="login-submit__spinner" aria-hidden />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <Icon icon="solar:arrow-right-linear" aria-hidden />
                      </>
                    )}
                  </Button>

                  <p className="login-footer">
                    Forgot password?{' '}
                    <a href="#" className="login-footer__link">
                      Reset here
                    </a>
                  </p>
                </FormikForm>
              )}
            </Formik>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
