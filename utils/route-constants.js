const ROUTES = [
  '/dashboard',
  '/home',
  '/app',
  '/profile',
  '/account',
  '/settings',
  '/login',
  '/signup',
  '/register',
  '/forgot-password',
  '/reset-password',
];

const PROTECTED_ROUTES = [
  '/dashboard',
  '/home',
  '/app',
  '/profile',
  '/account',
  '/settings',
  '/admin',
  '/user',
  '/protected',
  '/manage',
];

const SIGNUP_ROUTES = [
  '/signup',
  '/register',
  '/sign-up',
  '/create-account',
];

const BASE_URL = 'https://tichi-app-webapp-stage.web.app';

module.exports = { ROUTES, PROTECTED_ROUTES, SIGNUP_ROUTES, BASE_URL };
