/**
 * Audit Log Modal
 * View complete audit trail for compliance and debugging
 * Supports filtering by entity type, action, and date range
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Card } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { 
  FileText, 
  Receipt, 
  DollarSign, 
  Users, 
  Building,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Search,
  Calendar,
  Filter
} from 'lucide-react';
import { AuditLog } from '@/types';
import { getAuditLogs, exportAuditLogs } from '@/services/audit.service';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
  entityType?: AuditLog['entityType'];
  entityId?: string;
}

export function AuditLogModal({ open, onClose, entityType: initialEntityType, entityId: initialEntityId }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>(initialEntityType || 'all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState(initialEntityId || '');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    if (open) {
      loadLogs();
    }
  }, [open]);

  useEffect(() => {
    applyFilters();
  }, [logs, entityTypeFilter, actionFilter, searchQuery, dateFilter]);

  const loadLogs = () => {
    setIsLoading(true);
    try {
      const allLogs = getAuditLogs();
      setLogs(allLogs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Entity type filter
    if (entityTypeFilter !== 'all') {
      filtered = filtered.filter(log => log.entityType === entityTypeFilter);
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Search filter (entity ID or performed by)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.entityId.toLowerCase().includes(query) ||
        log.performedBy.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter(log => {
        const logDate = new Date(log.performedAt);
        if (dateFilter === 'today') return logDate >= startOfToday;
        if (dateFilter === 'week') return logDate >= startOfWeek;
        if (dateFilter === 'month') return logDate >= startOfMonth;
        return true;
      });
    }

    setFilteredLogs(filtered);
  };

  const handleExport = () => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      
      const exported = exportAuditLogs(
        startDate.toISOString(),
        new Date().toISOString()
      );

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Audit logs exported');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export logs');
    }
  };

  const getEntityIcon = (entityType: AuditLog['entityType']) => {
    const icons = {
      invoice: FileText,
      transaction: Receipt,
      ledger: DollarSign,
      payment: DollarSign,
      business: Building,
      user: Users,
    };
    return icons[entityType] || FileText;
  };

  const getActionIcon = (action: AuditLog['action']) => {
    const icons = {
      create: Plus,
      update: Edit,
      delete: Trash2,
      post: CheckCircle,
      reverse: RefreshCw,
      void: AlertCircle,
      sync: RefreshCw,
    };
    return icons[action] || Edit;
  };

  const getActionColor = (action: AuditLog['action']) => {
    const colors = {
      create: 'text-green-600',
      update: 'text-blue-600',
      delete: 'text-red-600',
      post: 'text-purple-600',
      reverse: 'text-orange-600',
      void: 'text-gray-600',
      sync: 'text-indigo-600',
    };
    return colors[action] || 'text-gray-600';
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Audit Log
          </DialogTitle>
          <DialogDescription>
            Complete audit trail of all system activities
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4" />
              <p className="font-medium">Filters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Entity Type */}
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="invoice">Invoices</SelectItem>
                  <SelectItem value="transaction">Transactions</SelectItem>
                  <SelectItem value="ledger">Ledger</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                </SelectContent>
              </Select>

              {/* Action */}
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="reverse">Reverse</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                  <SelectItem value="sync">Sync</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range */}
              <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search ID or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </Card>

          {/* Summary */}
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} logs
            </p>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>

          {/* Logs List */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">No audit logs found</p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const EntityIcon = getEntityIcon(log.entityType);
                const ActionIcon = getActionIcon(log.action);
                const actionColor = getActionColor(log.action);

                return (
                  <Card key={log.id} className="p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 p-2 bg-gray-100 rounded">
                        <EntityIcon className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <ActionIcon className={`w-4 h-4 ${actionColor}`} />
                            <p className="font-medium capitalize">
                              {log.action} {log.entityType}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(log.performedAt), 'MMM d, h:mm a')}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p className="font-mono text-xs truncate">
                            ID: {log.entityId}
                          </p>
                          <p>
                            By: <span className="font-medium">{log.performedBy}</span>
                          </p>
                          {log.metadata?.reason && (
                            <p className="text-xs">{log.metadata.reason}</p>
                          )}
                        </div>

                        {/* Before/After (collapsed by default) */}
                        {(log.before || log.after) && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                              View details
                            </summary>
                            <div className="mt-2 text-xs space-y-2">
                              {log.before && (
                                <div>
                                  <p className="font-medium mb-1">Before:</p>
                                  <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(log.before, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.after && (
                                <div>
                                  <p className="font-medium mb-1">After:</p>
                                  <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(log.after, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
