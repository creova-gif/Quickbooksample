/**
 * Branch Selector Modal
 * Allows users to switch between different business branches
 * Logs all branch switches for audit compliance
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card } from '@/app/components/ui/card';
import { Building2, MapPin, DollarSign, Check, Loader2 } from 'lucide-react';
import { logAudit } from '@/services/audit.service';
import { toast } from 'sonner';

export interface Branch {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  currency: string;
  address?: string;
  isActive: boolean;
  employeeCount?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  branches: Branch[];
  currentBranchId: string;
  onBranchChange: (branch: Branch) => void;
}

export function BranchSelectorModal({ 
  open, 
  onClose, 
  branches, 
  currentBranchId,
  onBranchChange 
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(currentBranchId);

  const currentBranch = branches.find(b => b.id === currentBranchId);
  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  const handleBranchSwitch = async () => {
    if (!selectedBranch || selectedBranchId === currentBranchId) {
      onClose();
      return;
    }

    setIsLoading(true);

    try {
      // Log audit trail for branch switch
      logAudit({
        entityType: 'business',
        entityId: selectedBranch.id,
        action: 'update',
        before: currentBranch,
        after: selectedBranch,
        performedBy: 'current-user',
        metadata: {
          reason: 'Branch switched',
          fromBranch: currentBranch?.name,
          toBranch: selectedBranch.name,
        },
      });

      // Update current branch
      onBranchChange(selectedBranch);

      // Save to localStorage
      localStorage.setItem('current_branch_id', selectedBranch.id);

      toast.success(`Switched to ${selectedBranch.name}`);
      onClose();
    } catch (error: any) {
      console.error('Failed to switch branch:', error);
      toast.error(error.message || 'Failed to switch branch');
    } finally {
      setIsLoading(false);
    }
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'KE': '🇰🇪',
      'TZ': '🇹🇿',
      'UG': '🇺🇬',
      'RW': '🇷🇼',
      'BI': '🇧🇮',
    };
    return flags[countryCode] || '🌍';
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Select Branch
          </DialogTitle>
          <DialogDescription>
            Switch between your business branches. All data will be filtered to the selected branch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Current Branch Info */}
          {currentBranch && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">Currently Active</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCountryFlag(currentBranch.countryCode)}</span>
                <div>
                  <p className="font-semibold">{currentBranch.name}</p>
                  <p className="text-sm text-muted-foreground">{currentBranch.country}</p>
                </div>
              </div>
            </div>
          )}

          {/* Branch List */}
          <div className="space-y-3">
            {branches.map((branch) => {
              const isSelected = selectedBranchId === branch.id;
              const isCurrent = currentBranchId === branch.id;

              return (
                <Card
                  key={branch.id}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                      : 'hover:border-gray-400'
                  } ${!branch.isActive ? 'opacity-50' : ''}`}
                  onClick={() => branch.isActive && setSelectedBranchId(branch.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Flag */}
                      <span className="text-3xl">{getCountryFlag(branch.countryCode)}</span>

                      {/* Branch Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{branch.name}</h3>
                          {isCurrent && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                          {!branch.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{branch.country}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="w-4 h-4" />
                            <span>{branch.currency}</span>
                          </div>

                          {branch.address && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {branch.address}
                            </p>
                          )}

                          {branch.employeeCount !== undefined && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {branch.employeeCount} employees
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* No branches message */}
          {branches.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No branches available</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBranchSwitch}
              disabled={isLoading || selectedBranchId === currentBranchId || !selectedBranch?.isActive}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Switching...
                </>
              ) : (
                'Switch Branch'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
