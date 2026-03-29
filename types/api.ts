export type MembershipTier =
  | "QUINZE_STANDARD"
  | "QUINZE_PREMIUM"
  | "QUINZE_SELECT";

export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELED";

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

export interface NotificationResponse {
  id: number;
  title?: string;
  body?: string;
  createdAt: string;
  readAt?: string | null;
  data?: Record<string, string | number | boolean | null>;
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
