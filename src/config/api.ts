// API konfigurace
// V development módu se připojuje na staging, v produkci na production URL

import { Platform } from 'react-native';

// Android emulátor používá 10.0.2.2 pro localhost
const DEV_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3001'
  : 'http://localhost:3001';

// Production URL
const PROD_URL = 'https://app.bedr.cz';

export const API_BASE = __DEV__ ? DEV_URL : PROD_URL;

// Endpoint mapa
export const endpoints = {
  // Auth
  login:           '/api/auth/login',
  register:        '/api/auth/register',
  googleLogin:     '/api/auth/google',
  metaLogin:       '/api/auth/meta',
  forgotPassword:  '/api/auth/forgot-password',
  resetPassword:   '/api/auth/reset-password',

  // Users / Profile
  profile:         '/api/users/profile',
  updateProfile:   '/api/users/profile',
  uploadAvatar:    '/api/users/avatar',
  pushToken:       '/api/users/push-token',
  myOffers:        '/api/users/offers',
  referral:        '/api/users/referral',
  badges:          '/api/users/badges',
  gdprConsent:     '/api/users/consent',

  // Reservations
  myReservations:  '/api/reservations/my',
  bookReservation: '/api/reservations/book',
  moveReservation: (id: number) => `/api/reservations/${id}/move`,
  cancelReservation: (id: number) => `/api/reservations/${id}/cancel`,

  // Packages
  packages:        '/api/packages',

  // Purchases
  myPurchases:     '/api/purchases/my',
  createPurchase:  '/api/purchases',

  // Slots
  slots:           '/api/slots',

  // Studios
  studios:         '/api/studios',
  myActiveStudios: '/api/studios/my-active',

  // CRM
  validatePromo:   '/api/crm/validate-promo',
} as const;
