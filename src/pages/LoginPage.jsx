// LoginPage.jsx
import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Formik, Field, ErrorMessage, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams()


  useEffect(() => {
    getFCMToken().then(setFcmToken);
  }, []);

  //for fully login use effect
  useEffect(() => {
    const email = searchParams.get('email');
    const password = searchParams.get('password');
    const token = searchParams.get('fcmToken') || fcmToken;
    const userRole = searchParams.get('userRole');
    const reg_no = searchParams.get('reg_no')
    if (!email || !password || !userRole) return;

    const forceLogin = async () => {
      try {
        if (userRole == 'Teacher') {

          const res = await axios.post(`${baseUrl}/api/staff/login`, {
            email,
            password,
            fcmToken: token,
          });
          localStorage.setItem('token', res?.data?.token);
          navigate('/staffdashboard');
        }
        if (userRole == "Parent") {
          const { data } = await axios.post(
            `${baseUrl}/api/parmanent-personal-information/login`,
            {
              email: email,
              password: password,
              reg_no: reg_no,
              fcmToken: token,
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
      <div className="d-flex justify-content-center align-items-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
