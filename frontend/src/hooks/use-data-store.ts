'use client'

import { useState, useEffect, useCallback } from 'react'
import { db, type User, type Appointment, type Message, type MedicalRecord, type Prescription, type Invoice, type LabResult, type AuditLog } from '@/lib/hospital-core/MockDatabase'

/**
 * useDataStore Hook
 * Provides reactive access to the centralized MockDatabase.
 * Components that use this hook will re-render automatically when data changes.
 */
export function useDataStore() {
  const [version, setVersion] = useState(0)
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    setHasHydrated(true)
    const unsubscribe = db.events.subscribe('change', () => {
      setVersion(v => v + 1)
    })
    return unsubscribe
  }, [])

  // Force re-read from DB on each version change
  const getUsers = useCallback(() => db.getUsers(), [version])
  const getAppointments = useCallback(() => db.getAppointments(), [version])
  const getMessages = useCallback(() => db.getMessages(), [version])
  const getRecords = useCallback(() => db.getRecords(), [version])
  const getPrescriptions = useCallback(() => db.getPrescriptions(), [version])
  const getInvoices = useCallback(() => db.getInvoices(), [version])
  const getLabResults = useCallback(() => db.getLabResults(), [version])
  const getAuditLogs = useCallback(() => db.getAuditLogs(), [version])
  const getStats = useCallback(() => db.getStats(), [version])

  // Stability for SSR/Hydration
  // If not hydrated, we return "stable" empty values or the raw DB values (which will be seed values on server)
  // However, on client, the first render will be with seed values if we don't handle this, or mismatch if we load localStorage.
  // The MockDatabase getInstance loads from storage immediately.
  // To fix hydration, the FIRST render on client MUST match the server.
  // Server has seed data. Client first render MUST have seed data.
  // Subsequent client render can have localStorage data.

  const isServer = typeof window === 'undefined'
  const isHydrating = !hasHydrated && !isServer

  return {
    hasHydrated,
    isHydrating,
    
    // Higher-level getters (reactive functions)
    getUsers,
    getAppointments,
    getMessages,
    getRecords,
    getPrescriptions,
    getInvoices,
    getLabResults,
    getAuditLogs,
    getStats,

    // Read operations (reactive data)
    // On first client render, these will match server (seed data) if we handle it in MockDatabase
    // But MockDatabase singleton is shared. 
    // Best approach: If isHydrating, return empty or seed-safe values.
    users: isHydrating ? [] : getUsers(),
    appointments: isHydrating ? [] : getAppointments(),
    messages: isHydrating ? [] : getMessages(),
    records: isHydrating ? [] : getRecords(),
    prescriptions: isHydrating ? [] : getPrescriptions(),
    invoices: isHydrating ? [] : getInvoices(),
    labResults: isHydrating ? [] : getLabResults(),
    auditLogs: isHydrating ? [] : getAuditLogs(),
    stats: isHydrating ? db.getEmptyStats() : getStats(),

    // Filtered reads
    getUserById: db.getUserById.bind(db),
    getUsersByRole: db.getUsersByRole.bind(db),
    getDoctors: db.getDoctors.bind(db),
    getPendingDoctors: db.getPendingDoctors.bind(db),
    getAppointmentsByPatient: db.getAppointmentsByPatient.bind(db),
    getAppointmentsByDoctor: db.getAppointmentsByDoctor.bind(db),
    getUpcomingAppointments: db.getUpcomingAppointments.bind(db),
    getMessagesByUser: db.getMessagesByUser.bind(db),
    getInboxMessages: db.getInboxMessages.bind(db),
    getUnreadCount: db.getUnreadCount.bind(db),
    getRecordsByPatient: db.getRecordsByPatient.bind(db),
    getRecordsByDoctor: db.getRecordsByDoctor.bind(db),
    getPrescriptionsByPatient: db.getPrescriptionsByPatient.bind(db),
    getPrescriptionsByDoctor: db.getPrescriptionsByDoctor.bind(db),
    getInvoicesByPatient: db.getInvoicesByPatient.bind(db),
    getLabResultsByPatient: db.getLabResultsByPatient.bind(db),
    getDoctorStats: db.getDoctorStats.bind(db),
    getPatientStats: db.getPatientStats.bind(db),

    // Write operations (trigger re-renders via events)
    addUser: db.addUser.bind(db),
    updateUser: db.updateUser.bind(db),
    updateUserStatus: db.updateUserStatus.bind(db),
    verifyDoctor: db.verifyDoctor.bind(db),
    deleteUser: db.deleteUser.bind(db),

    addAppointment: db.addAppointment.bind(db),
    updateAppointmentStatus: db.updateAppointmentStatus.bind(db),
    rescheduleAppointment: db.rescheduleAppointment.bind(db),

    addMessage: db.addMessage.bind(db),
    markMessageRead: db.markMessageRead.bind(db),
    toggleMessageStar: db.toggleMessageStar.bind(db),

    addRecord: db.addRecord.bind(db),
    updateRecord: db.updateRecord.bind(db),
    deleteRecord: db.deleteRecord.bind(db),
    addPrescription: db.addPrescription.bind(db),
    addInvoice: db.addInvoice.bind(db),
    payInvoice: db.payInvoice.bind(db),
    addLabResult: db.addLabResult.bind(db),
    addAuditLog: db.addAuditLog.bind(db),
    
    resetData: db.resetData.bind(db),
  }
}

// Re-export types for convenience
export type { User, Appointment, Message, MedicalRecord, Prescription, Invoice, LabResult, AuditLog }
