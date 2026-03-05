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
  name: string;
  lessons: number;
  price: number;
  validity_days: number;
  lesson_type_id: number;
  studio_id: number;
  is_happy_hours: number;
  happy_hours_start: string | null;
  happy_hours_end: string | null;
  allowed_times: string | null;
  show_on_create: number;
}

export interface Purchase {
  id: number;
  user_id: number;
  package_id: number;
  package_name: string;
  lessons_total: number;
  lessons_remaining: number;
  price: number;
  payment_status: 'unpaid' | 'partially_paid' | 'paid';
  purchased_at: string;
  valid_until: string;
  studio_id: number;
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
  icon: string;
  earned: boolean;
  progress: number;
  target: number;
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  discount_percent: number;
  valid_until: string;
  redeemed: boolean;
}

export interface ReferralStats {
  code: string;
  total_referred: number;
  successful: number;
  pending: number;
  rewards_earned: number;
}

export interface PromoCodeResult {
  valid: boolean;
  discount_percent?: number;
  message?: string;
}
