export type MessageMode = 'SMS' | 'WHATSAPP' | 'CALL';
export type EventStatus = 'pending' | 'scheduled' | 'sending' | 'sent' | 'partial' | 'failed';
export type ContactStatus = 'pending' | 'sent' | 'failed';

export interface Event {
  id: string;
  user_id: string;
  title: string;
  message: string;
  mode: MessageMode;
  scheduled_time: string;
  status: EventStatus;
  total_contacts: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  event_id: string;
  phone: string;
  status: ContactStatus;
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalEvents: number;
  pendingEvents: number;
  sentMessages: number;
  failedMessages: number;
}
