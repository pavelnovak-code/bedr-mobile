// TypeScript interfaces pro API responses

export interface User {
  id: number;
  jmeno: string;
  prijmeni: string;
  email: string;
  telefon: string | null;
  avatar: string | null;
  role: 'zakaznik' | 'trener' | 'seftrener' | 'admin';
  gdpr_consent: number;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Studio {
  id: number;
  name: string;
  address: string | null;
  description: string | null;
}

export interface Package {
  id: number;
  code: string;
  name: string;
  lesson_count: number;
  price: number;
  lesson_type_id: number;
  is_active: number;
  validity_weeks: number;
  allowed_times: string | null;
  show_on_create: number;
}

export interface Purchase {
  id: number;
  user_id: number;
  package_id: number;
  package_name: string;
  package_code: string;
  lessons_total: number;
  lessons_remaining: number;
  package_price: number;
  original_price: number | null;
  discount_amount: number;
  payment_method: string;
  payment_status: 'unpaid' | 'partially_paid' | 'paid' | 'pending';
  created_at: string;
  first_lesson_at: string | null;
  validity_weeks: number;
  studio_id: number;
  studio_name: string;
  lesson_type_code: 'A' | 'B';
  is_active: number;
}

export interface Reservation {
  id: number;
  user_id: number;
  purchase_id: number;
  slot_datetime: string;
  lesson_type_id: number;
  lt_code: 'A' | 'B';
  studio_id: number;
  status: 'confirmed' | 'cancelled';
  completed: number;
  created_at: string;
  // Joined fields
  jmeno?: string;
  prijmeni?: string;
  package_name?: string;
  trainer_name?: string;
}

export interface Slot {
  time: string;
  date: string;
  reservations: number;
  max_capacity: number;
  is_closed: boolean;
  trainer?: { id: number; name: string; color: string };
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  emoji: string;
  condition_type: 'reservations' | 'months' | 'manual';
  condition_value: number;
  color: string;
  earned: boolean;
  earned_at: string | null;
  progress_current: number;
  progress_total: number;
}

export interface Offer {
  id: number;
  title: string;
  perex: string;
  body: string;
  discount_type: 'none' | 'percent' | 'fixed' | 'free_package';
  discount_value: number;
  valid_from: string | null;
  valid_to: string | null;
  package_name: string | null;
  promo_code: string | null;
  seen_at: string | null;
  redeemed_at: string | null;
}

export interface ReferralInfo {
  referral_code: string;
  share_texts: {
    link: string;
    facebook: string;
    whatsapp: string;
    x: string;
  };
}

export interface ReferralStats {
  invites_sent: number;
  completed: number;
  rewards: number;
}

export interface PromoCodeResult {
  valid: boolean;
  discount_percent?: number;
  message?: string;
}
