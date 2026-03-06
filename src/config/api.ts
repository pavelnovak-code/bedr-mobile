// API konfigurace
// V development módu se připojuje na staging, v produkci na production URL

import { Platform } from 'react-native';

// V developmentu: staging API (telefon v Expo Go nemá přístup na localhost)
// Pro iOS simulátor nebo Android emulátor lze přepnout na localhost:
// const DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';
const DEV_URL = 'https://staging.bedr.cz';

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
  completeProfile: '/api/auth/complete-profile',

  // Users / Profile
  profile:         '/api/users/profile',
  updateProfile:   '/api/users/profile',
  uploadAvatar:    '/api/users/profile/avatar/upload',
  updateAvatar:    '/api/users/profile/avatar',
  pushToken:       '/api/users/push-token',
  myOffers:        '/api/users/offers',
  offerSeen:       (id: number) => `/api/users/offers/${id}/seen`,
  offerRedeem:     (id: number) => `/api/users/offers/${id}/redeem`,
  referral:        '/api/users/referral',
  referralStats:   '/api/users/referral/stats',
  referralInvite:  '/api/users/referral/invite',
  badges:          '/api/users/badges',
  myLessons:       '/api/users/lessons',
  gdprConsent:     '/api/users/consent',
  myLessons:       '/api/users/lessons',

  // Reservations
  myReservations:  '/api/reservations',
  bookReservation: '/api/reservations',
  moveReservation: (id: number) => `/api/reservations/${id}/move`,
  cancelReservation: (id: number) => `/api/reservations/${id}`,

  // Packages
  packages:        '/api/packages',

  // Purchases
  myPurchases:     '/api/purchases',
  createPurchase:  '/api/purchases',

  // Slots
  slots:           '/api/slots',

  // Studios
  studios:         '/api/studios',
  myActiveStudios: '/api/studios/my-active',

  // CRM
  validatePromo:   '/api/crm/promo-codes/validate',
} as const;
