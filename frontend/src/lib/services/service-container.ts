/**
 * Service Container
 * Centralizes dependency injection and service initialization
 * Follows: Dependency Inversion Principle (DIP)
 * Follows: Inversion of Control (IoC)
 */

import { IAuthService, getAuthService } from './auth-service';
import { IHttpClient, getHttpClient } from './http-client';
import { ApiRequestHelper, getApiRequestHelper } from './api-request-helper';
import { IUserRepository, getUserRepository } from './repositories/user-repository';
import { IAppointmentRepository, getAppointmentRepository } from './repositories/appointment-repository';
import { IDoctorRepository, getDoctorRepository } from './repositories/doctor-repository';
import { IStatsRepository, getStatsRepository } from './repositories/stats-repository';
import { INotificationRepository, getNotificationRepository } from './repositories/notification-repository';
import { IMedicalRecordRepository, getMedicalRecordRepository } from './repositories/medical-record-repository';
import { IPrescriptionRepository, getPrescriptionRepository } from './repositories/prescription-repository';
import { IMessageRepository, getMessageRepository } from './repositories/message-repository';
import { IAiRepository, getAiRepository } from './repositories/ai-repository';

export interface ServiceContainer {
  auth: IAuthService;
  httpClient: IHttpClient;
  api: ApiRequestHelper;
  user: IUserRepository;
  appointment: IAppointmentRepository;
  doctor: IDoctorRepository;
  stats: IStatsRepository;
  notification: INotificationRepository;
  medicalRecord: IMedicalRecordRepository;
  prescription: IPrescriptionRepository;
  message: IMessageRepository;
  ai: IAiRepository;
}

class DefaultServiceContainer implements ServiceContainer {
  auth: IAuthService;
  httpClient: IHttpClient;
  api: ApiRequestHelper;
  user: IUserRepository;
  appointment: IAppointmentRepository;
  doctor: IDoctorRepository;
  stats: IStatsRepository;
  notification: INotificationRepository;
  medicalRecord: IMedicalRecordRepository;
  prescription: IPrescriptionRepository;
  message: IMessageRepository;
  ai: IAiRepository;

  constructor() {
    // Initialize services in dependency order
    this.auth = getAuthService();
    this.httpClient = getHttpClient(this.auth);
    this.api = getApiRequestHelper(this.httpClient);

    // Initialize repositories with the API helper
    this.user = getUserRepository(this.api);
    this.appointment = getAppointmentRepository(this.api);
    this.doctor = getDoctorRepository(this.api);
    this.stats = getStatsRepository(this.api);
    this.notification = getNotificationRepository(this.api);
    this.medicalRecord = getMedicalRecordRepository(this.api);
    this.prescription = getPrescriptionRepository(this.api);
    this.message = getMessageRepository(this.api);
    this.ai = getAiRepository(this.httpClient);
  }
}

let containerInstance: ServiceContainer | null = null;

export function getServiceContainer(): ServiceContainer {
  if (!containerInstance) {
    containerInstance = new DefaultServiceContainer();
  }
  return containerInstance;
}

export function setServiceContainer(container: ServiceContainer): void {
  containerInstance = container;
}
