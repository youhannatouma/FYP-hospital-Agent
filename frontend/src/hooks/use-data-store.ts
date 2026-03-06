'use client'

import { useState, useEffect, useCallback } from 'react'
import { db, type User, type Appointment } from '@/lib/hospital-core/MockDatabase'
import type { Message, MedicalRecord, Prescription, Invoice, LabResult, AuditLog } from '@/lib/hospital-data-manifest'

/**
 * useDataStore Hook
 * Provides reactive access to the centralized MockDatabase.
 * Safely falls back if MockDatabase methods are partially implemented.
 */
export function useDataStore() {
  const [version, setVersion] = useState(0)
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    setHasHydrated(true)
    const unsubscribe = (db as any).events?.subscribe?.('change', () => {
      setVersion(v => v + 1)
    })
    return unsubscribe || (() => {})
  }, [])

  const safeList = (method: string) => {
    const fn = (db as any)[method];
    return typeof fn === 'function' ? fn.bind(db)() : [];
  };

  const getUsers = useCallback(() => safeList('getUsers'), [version])
  const getAppointments = useCallback(() => safeList('getAppointments'), [version])
  const getMessages = useCallback(() => safeList('getMessages'), [version])
  const getRecords = useCallback(() => safeList('getRecords'), [version])
  const getPrescriptions = useCallback(() => safeList('getPrescriptions'), [version])
  const getInvoices = useCallback(() => safeList('getInvoices'), [version])
  const getLabResults = useCallback(() => safeList('getLabResults'), [version])
  const getAuditLogs = useCallback(() => safeList('getAuditLogs'), [version])
  
  const getStats = useCallback(() => {
    const fn = (db as any).getStats;
    return typeof fn === 'function' ? fn.bind(db)() : { totalUsers: 0, activeUsers: 0, appointmentsToday: 0, revenue: 0 };
  }, [version])

  const getEmptyStats = () => ({ totalUsers: 0, activeUsers: 0, appointmentsToday: 0, revenue: 0 });

  const isServer = typeof window === 'undefined'
  const isHydrating = !hasHydrated && !isServer

  const safeBind = (method: string) => {
    const fn = (db as any)[method];
    return typeof fn === 'function' ? fn.bind(db) : (method.startsWith('get') ? () => [] : () => null);
  };

  return {
    hasHydrated,
    isHydrating,
    
    getUsers,
    getAppointments,
    getMessages,
    getRecords,
    getPrescriptions,
    getInvoices,
    getLabResults,
    getAuditLogs,
    getStats,

    users: isHydrating ? [] : getUsers(),
    appointments: isHydrating ? [] : getAppointments(),
    messages: isHydrating ? [] : getMessages(),
    records: isHydrating ? [] : getRecords(),
    prescriptions: isHydrating ? [] : getPrescriptions(),
    invoices: isHydrating ? [] : getInvoices(),
    labResults: isHydrating ? [] : getLabResults(),
    auditLogs: isHydrating ? [] : getAuditLogs(),
    stats: isHydrating ? getEmptyStats() : getStats(),

    getUserById: safeBind('getUserById'),
    getUsersByRole: safeBind('getUsersByRole'),
    getDoctors: safeBind('getDoctors'),
    getPendingDoctors: safeBind('getPendingDoctors'),
    getAppointmentsByPatient: safeBind('getAppointmentsByPatient'),
    getAppointmentsByDoctor: safeBind('getAppointmentsByDoctor'),
    getUpcomingAppointments: safeBind('getUpcomingAppointments'),
    getMessagesByUser: safeBind('getMessagesByUser'),
    getInboxMessages: safeBind('getInboxMessages'),
    getUnreadCount: safeBind('getUnreadCount'),
    getRecordsByPatient: safeBind('getRecordsByPatient'),
    getRecordsByDoctor: safeBind('getRecordsByDoctor'),
    getPrescriptionsByPatient: safeBind('getPrescriptionsByPatient'),
    getPrescriptionsByDoctor: safeBind('getPrescriptionsByDoctor'),
    getInvoicesByPatient: safeBind('getInvoicesByPatient'),
    getLabResultsByPatient: safeBind('getLabResultsByPatient'),
    getDoctorStats: safeBind('getDoctorStats'),
    getPatientStats: safeBind('getPatientStats'),

    addUser: safeBind('addUser'),
    updateUser: safeBind('updateUser'),
    updateUserStatus: safeBind('updateUserStatus'),
    verifyDoctor: safeBind('verifyDoctor'),
    deleteUser: safeBind('deleteUser'),

    addAppointment: safeBind('addAppointment'),
    updateAppointmentStatus: safeBind('updateAppointmentStatus'),
    rescheduleAppointment: safeBind('rescheduleAppointment'),

    addMessage: safeBind('addMessage'),
    markMessageRead: safeBind('markMessageRead'),
    toggleMessageStar: safeBind('toggleMessageStar'),

    addRecord: safeBind('addRecord'),
    updateRecord: safeBind('updateRecord'),
    deleteRecord: safeBind('deleteRecord'),
    addPrescription: safeBind('addPrescription'),
    addInvoice: safeBind('addInvoice'),
    payInvoice: safeBind('payInvoice'),
    addLabResult: safeBind('addLabResult'),
    addAuditLog: safeBind('addAuditLog'),
    
    resetData: safeBind('resetData'),
  }
}

export type { User, Appointment, Message, MedicalRecord, Prescription, Invoice, LabResult, AuditLog }
