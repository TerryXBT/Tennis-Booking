export type StudentType = "kid" | "adult";

export interface Booking {
  id: string;
  coach_id: string;
  student_name: string;
  student_type: StudentType;
  group_size: number;
  contact_phone: string;
  contact_email: string | null;
  start_time: string;
  end_time: string;
  status: string;
  created_at?: string;
}

export interface BookingInput {
  student_name: string;
  student_type: StudentType;
  group_size: number;
  contact_phone: string;
  contact_email?: string | null;
  start_time: string;
}

export interface SlotResponse {
  date: string;
  timezone: string;
  slots: string[];
}
