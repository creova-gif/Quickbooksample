/**
 * Audit Log Service
 * 
 * RULES:
 * 1. NEVER delete accounting records - only reverse/void
 * 2. Log every state change
 * 3. Track who, what, when, why
 * 4. Support regulatory audits
 */

import { AuditLog } from '@/types';

/**
 * Create audit log entry
 */
export function logAudit(params: {
  entityType: AuditLog['entityType'];
  entityId: string;
  action: AuditLog['action'];
  before?: any;
  after?: any;
  performedBy: string;
  metadata?: AuditLog['metadata'];
}): AuditLog {
  const log: AuditLog = {
    id: crypto.randomUUID(),
    performedAt: new Date().toISOString(),
    ...params,
  };
  
  // Save to storage
  saveAuditLog(log);
  
  return log;
}

/**
 * Log invoice creation
 */
export function logInvoiceCreated(
  invoiceId: string,
  invoiceData: any,
  performedBy: string
): void {
  logAudit({
    entityType: 'invoice',
    entityId: invoiceId,
    action: 'create',
    after: invoiceData,
    performedBy,
    metadata: {
      reason: 'Invoice created',
    },
  });
}

/**
 * Log invoice update
 */
export function logInvoiceUpdated(
  invoiceId: string,
  before: any,
  after: any,
  performedBy: string
): void {
  logAudit({
    entityType: 'invoice',
    entityId: invoiceId,
    action: 'update',
    before,
    after,
    performedBy,
    metadata: {
      reason: 'Invoice updated',
    },
  });
}

/**
 * Log invoice posting
 */
export function logInvoicePosted(
  invoiceId: string,
  invoiceData: any,
  performedBy: string
): void {
  logAudit({
    entityType: 'invoice',
    entityId: invoiceId,
    action: 'post',
    after: invoiceData,
    performedBy,
    metadata: {
      reason: 'Invoice posted and locked',
    },
  });
}

/**
 * Log invoice reversal
 */
export function logInvoiceReversed(
  invoiceId: string,
  reversalInvoiceId: string,
  reason: string,
  performedBy: string
): void {
  logAudit({
    entityType: 'invoice',
    entityId: invoiceId,
    action: 'reverse',
    performedBy,
    metadata: {
      reason,
      reversalInvoiceId,
    },
  });
}

/**
 * Log invoice voided
 */
export function logInvoiceVoided(
  invoiceId: string,
  reason: string,
  performedBy: string
): void {
  logAudit({
    entityType: 'invoice',
    entityId: invoiceId,
    action: 'void',
    performedBy,
    metadata: {
      reason,
    },
  });
}

/**
 * Log transaction created
 */
export function logTransactionCreated(
  transactionId: string,
  transactionData: any,
  performedBy: string
): void {
  logAudit({
    entityType: 'transaction',
    entityId: transactionId,
    action: 'create',
    after: transactionData,
    performedBy,
  });
}

/**
 * Log transaction posted
 */
export function logTransactionPosted(
  transactionId: string,
  performedBy: string
): void {
  logAudit({
    entityType: 'transaction',
    entityId: transactionId,
    action: 'post',
    performedBy,
    metadata: {
      reason: 'Transaction posted to ledger',
    },
  });
}

/**
 * Log ledger entry created
 */
export function logLedgerEntryCreated(
  ledgerEntryId: string,
  ledgerData: any,
  performedBy: string
): void {
  logAudit({
    entityType: 'ledger',
    entityId: ledgerEntryId,
    action: 'create',
    after: ledgerData,
    performedBy,
  });
}

/**
 * Log ledger reversal
 */
export function logLedgerReversed(
  originalEntryId: string,
  reversalEntryId: string,
  reason: string,
  performedBy: string
): void {
  logAudit({
    entityType: 'ledger',
    entityId: originalEntryId,
    action: 'reverse',
    performedBy,
    metadata: {
      reason,
      reversalEntryId,
    },
  });
}

/**
 * Log tax authority sync
 */
export function logTaxSync(
  entityType: 'invoice' | 'transaction',
  entityId: string,
  authority: string,
  status: 'success' | 'failed',
  performedBy: string
): void {
  logAudit({
    entityType,
    entityId,
    action: 'sync',
    performedBy,
    metadata: {
      reason: `Tax authority sync to ${authority}: ${status}`,
    },
  });
}

/**
 * Get audit logs for an entity
 */
export function getAuditLogs(
  entityType?: AuditLog['entityType'],
  entityId?: string
): AuditLog[] {
  const all = getAllAuditLogs();
  
  if (!entityType) return all;
  
  let filtered = all.filter(log => log.entityType === entityType);
  
  if (entityId) {
    filtered = filtered.filter(log => log.entityId === entityId);
  }
  
  return filtered.sort((a, b) => 
    new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
  );
}

/**
 * Get audit trail for a specific entity (formatted for display)
 */
export function getAuditTrail(
  entityType: AuditLog['entityType'],
  entityId: string
): Array<{
  timestamp: string;
  action: string;
  performedBy: string;
  description: string;
  metadata?: any;
}> {
  const logs = getAuditLogs(entityType, entityId);
  
  return logs.map(log => ({
    timestamp: log.performedAt,
    action: log.action,
    performedBy: log.performedBy,
    description: getActionDescription(log),
    metadata: log.metadata,
  }));
}

/**
 * Get human-readable description of an audit action
 */
function getActionDescription(log: AuditLog): string {
  const entity = log.entityType;
  const action = log.action;
  
  const descriptions: Record<string, Record<string, string>> = {
    invoice: {
      create: 'Invoice created',
      update: 'Invoice updated',
      post: 'Invoice issued and posted to ledger',
      reverse: 'Invoice reversed',
      void: 'Invoice voided',
      sync: 'Synced to tax authority',
    },
    transaction: {
      create: 'Transaction created',
      update: 'Transaction updated',
      post: 'Transaction posted to ledger',
      reverse: 'Transaction reversed',
      sync: 'Synced to tax authority',
    },
    ledger: {
      create: 'Ledger entry created',
      reverse: 'Ledger entry reversed',
    },
    payment: {
      create: 'Payment recorded',
      reverse: 'Payment reversed',
    },
  };
  
  return descriptions[entity]?.[action] || `${action} on ${entity}`;
}

/**
 * Get compliance report (for auditors)
 */
export function getComplianceReport(
  startDate: string,
  endDate: string
): {
  totalInvoices: number;
  totalTransactions: number;
  totalReversals: number;
  deletions: number; // Should always be 0!
  suspiciousActivities: Array<{
    type: string;
    description: string;
    entityId: string;
    timestamp: string;
  }>;
} {
  const logs = getAllAuditLogs().filter(log => {
    const timestamp = new Date(log.performedAt);
    return timestamp >= new Date(startDate) && timestamp <= new Date(endDate);
  });
  
  const invoices = logs.filter(l => l.entityType === 'invoice' && l.action === 'create').length;
  const transactions = logs.filter(l => l.entityType === 'transaction' && l.action === 'create').length;
  const reversals = logs.filter(l => l.action === 'reverse').length;
  const deletions = logs.filter(l => l.action === 'delete').length; // Should be 0!
  
  // Check for suspicious activities
  const suspicious: any[] = [];
  
  // Flag any deletions (should never happen in accounting!)
  logs.filter(l => l.action === 'delete').forEach(log => {
    suspicious.push({
      type: 'illegal_deletion',
      description: `CRITICAL: ${log.entityType} was deleted (ID: ${log.entityId})`,
      entityId: log.entityId,
      timestamp: log.performedAt,
    });
  });
  
  // Flag excessive reversals by same user
  const reversalsByUser = logs.filter(l => l.action === 'reverse')
    .reduce((acc, log) => {
      acc[log.performedBy] = (acc[log.performedBy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  Object.entries(reversalsByUser).forEach(([user, count]) => {
    if (count > 10) {
      suspicious.push({
        type: 'excessive_reversals',
        description: `User ${user} performed ${count} reversals`,
        entityId: user,
        timestamp: new Date().toISOString(),
      });
    }
  });
  
  return {
    totalInvoices: invoices,
    totalTransactions: transactions,
    totalReversals: reversals,
    deletions,
    suspiciousActivities: suspicious,
  };
}

/**
 * Save audit log to storage
 */
function saveAuditLog(log: AuditLog): void {
  const existing = getAllAuditLogs();
  existing.push(log);
  localStorage.setItem('audit_logs', JSON.stringify(existing));
}

/**
 * Get all audit logs
 */
function getAllAuditLogs(): AuditLog[] {
  const stored = localStorage.getItem('audit_logs');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Export audit logs (for regulators)
 */
export function exportAuditLogs(
  startDate: string,
  endDate: string
): {
  generatedAt: string;
  period: { start: string; end: string };
  logs: AuditLog[];
  summary: {
    totalEvents: number;
    byEntityType: Record<string, number>;
    byAction: Record<string, number>;
  };
} {
  const logs = getAllAuditLogs().filter(log => {
    const timestamp = new Date(log.performedAt);
    return timestamp >= new Date(startDate) && timestamp <= new Date(endDate);
  });
  
  // Calculate summary
  const byEntityType = logs.reduce((acc, log) => {
    acc[log.entityType] = (acc[log.entityType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byAction = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    generatedAt: new Date().toISOString(),
    period: { start: startDate, end: endDate },
    logs,
    summary: {
      totalEvents: logs.length,
      byEntityType,
      byAction,
    },
  };
}
