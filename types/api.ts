export type MembershipTier =
  | "QUINZE_STANDARD"
  | "QUINZE_PREMIUM"
  | "QUINZE_SELECT";

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "RESCHEDULE_REQUESTED"
  | "COMPLETED"
  | "CANCELED";

export type AppointmentTier =
  | "QUINZE_STANDARD"
  | "QUINZE_PREMIUM"
  | "QUINZE_SELECT";

export type UserRole =
  | "CLUB_STANDARD"
  | "CLUB_SELECT"
  | "CLUB_EMPLOYE"
  | "CLUB_ADMIN";

export interface PlanSummary {
  id: number;
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
}

export interface PlanRequest {
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
}

export interface PlanResponse extends PlanSummary {}

export interface UpdateUserRequest {
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  membershipTier: MembershipTier;
  planId?: number;
  profilePictureUrl?: string | null;
  profilePictureBase64?: string | null;
  gallery?: GalleryItem[];
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  birthDate?: string | null;
  membershipTier: MembershipTier;
  role: UserRole;
  plan?: PlanSummary | null;
  createdAt: string;
  lastLogin?: string;
  nextAppointment?: AppointmentResponse | null;
  preferences: PreferenceResponse[];
  profilePictureUrl?: string | null;
  profilePictureBase64?: string | null;
  gallery?: GalleryItem[];
}

export interface UserSummary {
  id: number;
  name?: string | null;
  email: string;
  phone?: string | null;
  birthDate?: string | null;
  membershipTier?: MembershipTier | null;
  role?: UserRole | null;
  plan?: PlanSummary | null;
  createdAt: string;
  lastLogin?: string | null;
}

export interface PreferenceRequest {
  key: string;
  value: string;
}

export interface PreferenceResponse {
  id: number;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRequest {
  clientId: number;
  scheduledAt: string;
  appointmentTier: AppointmentTier;
  serviceType?: string;
  notes?: string;
  durationMinutes?: number;
  recurring?: boolean;
  recurrencePeriod?: string;
  recurrenceMonths?: number;
}

export interface AppointmentStatusUpdateRequest {
  status: AppointmentStatus;
  notes?: string;
}

export interface AppointmentRescheduleRequest {
  newDate: string;
  notes?: string;
}

export interface AppointmentResponse {
  id: number;
  clientId: number;
  scheduledAt: string;
  appointmentTier: AppointmentTier;
  status: AppointmentStatus;
  serviceType?: string;
  notes?: string | null;
  durationMinutes?: number;
  recurrenceGroupId?: string;
  recurrencePeriod?: string;
  /** Quando foi confirmado (cliente ou admin). */
  confirmedAt?: string | null;
  /** Novo horário proposto pelo cliente (status RESCHEDULE_REQUESTED). */
  proposedAt?: string | null;
}

/** Aprovação de uma proposta de remarcação (admin). Ambos opcionais. */
export interface AppointmentRescheduleApprovalRequest {
  /** Aprova em outro horário (útil quando há conflito no proposto). */
  newDate?: string;
  /** Duração do atendimento (múltiplo de 15, 15–480). */
  durationMinutes?: number;
}

/** Links para salvar o agendamento na agenda do cliente. */
export interface CalendarLinksResponse {
  googleCalendarUrl: string;
  icsUrl: string;
}

export type GoogleIntegrationState =
  | "NOT_CONFIGURED"
  | "DISCONNECTED"
  | "NEEDS_CALENDAR"
  | "READY"
  | "REVOKED";

export interface GoogleIntegrationStatus {
  configured: boolean;
  status: GoogleIntegrationState;
  googleEmail?: string | null;
  calendarId?: string | null;
  calendarSummary?: string | null;
}

export interface GoogleCalendarOption {
  id: string;
  summary: string;
  primary: boolean;
}

export interface ChooseCalendarRequest {
  mode: "CREATE" | "EXISTING";
  calendarId?: string;
  name?: string;
}

/** Parâmetros do fluxo de confirmação (todos os prazos em minutos ANTES do atendimento). */
export interface AppointmentConfirmationSettings {
  enabled: boolean;
  confirmationRequestOffset: number;
  adminAlertOffset: number;
  clientReminderOffsets: number[];
  skipRemindersWhenConfirmed: number[];
}

export interface AvailableSlotResponse {
  date: string;
  membershipTier: MembershipTier;
  availableSlots: string[];
}

export interface FeedbackRequest {
  appointmentId: number;
  rating?: number;
  comment?: string;
}

export interface FeedbackResponse {
  id: number;
  appointmentId: number;
  userId: number;
  rating?: number;
  comment?: string;
  createdAt: string;
}

export interface FeedbackAverageResponse {
  target: string;
  average: number;
}

export interface MediaAsset {
  id?: number;
  position: number;
  imageUrl?: string | null;
  imageBase64?: string | null;
}

export interface GalleryItem {
  id?: number;
  position: number;
  imageUrl?: string | null;
  imageBase64?: string | null;
}

export interface PostRequest {
  title: string;
  content: string;
  media?: MediaAsset[];
}

export interface CommentRequest {
  content: string;
}

export interface PostResponse {
  id: number;
  authorId: number;
  title: string;
  content: string;
  media?: MediaAsset[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  comments: CommentResponse[];
}

export interface CommentResponse {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface LikeResponse {
  id: number;
  postId: number;
  userId: number;
  createdAt: string;
}

export type NotificationType = "REMINDER" | "PLAN" | "NEWS" | "GENERAL";

export interface NotificationResponse {
  id: number;
  userId: number | null;
  title?: string;
  message?: string;
  type: NotificationType;
  read: boolean;
  sentAt: string;
}

export interface PaymentRenewalResponse {
  userId: number;
  userName: string;
  membershipTier: MembershipTier;
  plan: PlanSummary;
  planRenewalDate: string;
  planEndDate: string;
  allowedDurations: number[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: string;
  membershipTier: MembershipTier;
  planId?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface UserPerformanceSummary {
  averageRating: number;
  completedAppointments: number;
  upcomingAppointments: number;
  lastFeedbackAt?: string | null;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  unit?: string;
  trend?: number;
}

export interface DashboardServiceRating {
  service: string;
  average: number;
}

export interface AdminDashboardResponse {
  totalMembers: number;
  activePlans: number;
  upcomingAppointments: number;
  pendingFeedback: number;
  satisfactionScore: number;
  metrics: DashboardMetric[];
  topServices: DashboardServiceRating[];
  recentAppointments: AppointmentResponse[];
}
