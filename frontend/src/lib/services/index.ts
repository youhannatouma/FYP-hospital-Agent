/**
 * Services Index
 * Centralized exports for all services, repositories, and utilities
 * Follows: Single point of truth for imports — no deep path imports from consumers
 */

// Auth Service
export type { IAuthService } from "./auth-service";
export {
  ClerkAuthService,
  getAuthService,
  setAuthService,
} from "./auth-service";

// HTTP Client
export type { IHttpClient } from "./http-client";
export {
  AxiosHttpClient,
  getHttpClient,
  setHttpClient,
} from "./http-client";
export type { RequestConfig, HttpResponse } from "./http-client";

// API Request Helper
export {
  ApiRequestHelper,
  getApiRequestHelper,
  setApiRequestHelper,
} from "./api-request-helper";

// ─── Repositories ─────────────────────────────────────────────────────────────

export {
  getUserRepository,
  setUserRepository,
} from "./repositories/user-repository";
export {
  getAppointmentRepository,
  setAppointmentRepository,
} from "./repositories/appointment-repository";
export {
  getDoctorRepository,
  setDoctorRepository,
} from "./repositories/doctor-repository";
export {
  getStatsRepository,
  setStatsRepository,
} from "./repositories/stats-repository";
export {
  getNotificationRepository,
  setNotificationRepository,
} from "./repositories/notification-repository";
export {
  getMedicalRecordRepository,
  setMedicalRecordRepository,
} from "./repositories/medical-record-repository";
export {
  getPrescriptionRepository,
  setPrescriptionRepository,
} from "./repositories/prescription-repository";
export {
  getMessageRepository,
  setMessageRepository,
} from "./repositories/message-repository";
export {
  getAiRepository,
  setAiRepository,
} from "./repositories/ai-repository";

// ─── Repository Types ──────────────────────────────────────────────────────────

export type {
  IUserRepository,
  UserProfile,
} from "./repositories/user-repository";
export type {
  IAppointmentRepository,
  Appointment,
} from "./repositories/appointment-repository";
export type {
  IDoctorRepository,
  Doctor,
  TimeSlot,
  RecentPatient,
} from "./repositories/doctor-repository";
export type {
  IStatsRepository,
  StatsData,
  DoctorStatsData,
  PatientStatsData,
} from "./repositories/stats-repository";
export type {
  INotificationRepository,
  Notification,
} from "./repositories/notification-repository";
export type {
  IMedicalRecordRepository,
  MedicalRecord,
  CreateMedicalRecordDto,
} from "./repositories/medical-record-repository";
export type {
  IPrescriptionRepository,
  Prescription,
  CreatePrescriptionDto,
} from "./repositories/prescription-repository";
export type {
  IAiRepository,
  ChatRequestDto,
  ChatResponseDto,
} from "./repositories/ai-repository";

// ─── Service Container (Main DI) ───────────────────────────────────────────────

export { getServiceContainer, setServiceContainer } from "./service-container";
export type { ServiceContainer } from "./service-container";

// ─── Formatters ────────────────────────────────────────────────────────────────

export {
  UserProfileFormatter,
  formatUserProfile,
} from "./user-profile-formatter";
export type { FormattedUserProfile } from "./user-profile-formatter";
