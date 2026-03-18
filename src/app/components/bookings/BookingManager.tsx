import React, { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Plus,
  Eye,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

interface Booking {
  id: string;
  type: 'tour' | 'accommodation' | 'transport' | 'guide';
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  service_name: string;
  provider_id: string;
  provider_name: string;
  date_start: string;
  date_end: string;
  guests: number;
  price_amount: number;
  price_currency: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'deposit' | 'paid';
  payout_status: 'pending' | 'processing' | 'paid';
  created_at: string;
  notes?: string;
}

const mockBookings: Booking[] = [
  {
    id: 'BK001',
    type: 'tour',
    guest_name: 'Sarah Johnson',
    guest_email: 'sarah@example.com',
    guest_phone: '+1234567890',
    service_name: 'Serengeti Safari 3-Day Package',
    provider_id: 'PRV001',
    provider_name: 'Tanzania Wildlife Tours',
    date_start: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    date_end: format(addDays(new Date(), 8), 'yyyy-MM-dd'),
    guests: 4,
    price_amount: 2400,
    price_currency: 'USD',
    status: 'confirmed',
    payment_status: 'deposit',
    payout_status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'BK002',
    type: 'accommodation',
    guest_name: 'James Wilson',
    guest_email: 'james@example.com',
    guest_phone: '+1234567891',
    service_name: 'Lake Victoria Lakeside Villa',
    provider_id: 'PRV002',
    provider_name: 'Airbnb Uganda',
    date_start: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    date_end: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    guests: 2,
    price_amount: 500,
    price_currency: 'USD',
    status: 'pending',
    payment_status: 'unpaid',
    payout_status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'BK003',
    type: 'transport',
    guest_name: 'Maria Garcia',
    guest_email: 'maria@example.com',
    guest_phone: '+1234567892',
    service_name: 'Airport Transfer - Kigali',
    provider_id: 'PRV003',
    provider_name: 'Rwanda Express Drivers',
    date_start: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    date_end: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    guests: 3,
    price_amount: 45,
    price_currency: 'USD',
    status: 'confirmed',
    payment_status: 'paid',
    payout_status: 'processing',
    created_at: new Date().toISOString(),
  },
];

export function BookingManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    setLoading(true);
    const stored = localStorage.getItem('bookings');
    if (stored) {
      setBookings(JSON.parse(stored));
    } else {
      setBookings(mockBookings);
      localStorage.setItem('bookings', JSON.stringify(mockBookings));
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    const { color, icon: Icon } = variants[status] || variants.pending;
    return (
      <Badge className={`${color} gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const colors: Record<string, string> = {
      unpaid: 'bg-gray-100 text-gray-800',
      deposit: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
    };
    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      tour: MapPin,
      accommodation: Calendar,
      transport: Clock,
      guide: Users,
    };
    const Icon = icons[type] || MapPin;
    return <Icon className="w-4 h-4" />;
  };

  const handleConfirmBooking = (bookingId: string) => {
    const updated = bookings.map(b =>
      b.id === bookingId ? { ...b, status: 'confirmed' as const } : b
    );
    setBookings(updated);
    localStorage.setItem('bookings', JSON.stringify(updated));
    toast.success('Booking confirmed!');
  };

  const handleProcessPayout = (booking: Booking) => {
    // This would integrate with the wallet/payout system
    const updated = bookings.map(b =>
      b.id === booking.id ? { ...b, payout_status: 'processing' as const } : b
    );
    setBookings(updated);
    localStorage.setItem('bookings', JSON.stringify(updated));
    toast.success(`Payout processing for ${booking.provider_name}`);
  };

  const filteredBookings = bookings.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (filterType !== 'all' && b.type !== filterType) return false;
    return true;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    revenue: bookings
      .filter(b => b.payment_status === 'paid')
      .reduce((sum, b) => sum + b.price_amount, 0),
    pendingPayouts: bookings
      .filter(b => b.payout_status === 'pending' && b.payment_status === 'paid')
      .reduce((sum, b) => sum + b.price_amount * 0.85, 0), // 85% to provider
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
          <p className="text-gray-600">
            Manage tours, accommodations, transport, and guide bookings
          </p>
        </div>
        <Button onClick={() => setShowNewBooking(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total Bookings</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Confirmed</div>
              <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Revenue</div>
              <div className="text-2xl font-bold text-green-600">
                ${stats.revenue.toLocaleString()}
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Pending Payouts</div>
              <div className="text-2xl font-bold text-orange-600">
                ${stats.pendingPayouts.toLocaleString()}
              </div>
            </div>
            <Wallet className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label>Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label>Type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="tour">Tours</SelectItem>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="guide">Guides</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(booking.type)}
                      <span className="capitalize">{booking.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{booking.guest_name}</div>
                      <div className="text-gray-500">{booking.guest_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{booking.service_name}</div>
                      <div className="text-gray-500">{booking.provider_name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{format(new Date(booking.date_start), 'MMM d')}</div>
                    <div className="text-gray-500">
                      to {format(new Date(booking.date_end), 'MMM d')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">
                      {booking.price_currency} {booking.price_amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{booking.guests} guests</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>{getPaymentBadge(booking.payment_status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {booking.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleConfirmBooking(booking.id)}
                        >
                          Confirm
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details - {selectedBooking?.id}</DialogTitle>
            <DialogDescription>
              Full information about this booking
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Guest Information</h3>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span> {selectedBooking.guest_name}
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span> {selectedBooking.guest_email}
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span> {selectedBooking.guest_phone}
                    </div>
                    <div>
                      <span className="text-gray-600">Guests:</span> {selectedBooking.guests}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Service Details</h3>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>{' '}
                      <span className="capitalize">{selectedBooking.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Service:</span> {selectedBooking.service_name}
                    </div>
                    <div>
                      <span className="text-gray-600">Provider:</span> {selectedBooking.provider_name}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Booking Period</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Check-in:</span>{' '}
                    {format(new Date(selectedBooking.date_start), 'MMMM d, yyyy')}
                  </div>
                  <div>
                    <span className="text-gray-600">Check-out:</span>{' '}
                    {format(new Date(selectedBooking.date_end), 'MMMM d, yyyy')}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payment Information</h3>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-xl font-bold text-green-600">
                      {selectedBooking.price_currency} {selectedBooking.price_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Payment Status:</span>
                    {getPaymentBadge(selectedBooking.payment_status)}
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-600">Provider Payout (85%):</span>
                    <span className="font-semibold">
                      {selectedBooking.price_currency}{' '}
                      {(selectedBooking.price_amount * 0.85).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                {selectedBooking.status === 'pending' && (
                  <Button
                    onClick={() => {
                      handleConfirmBooking(selectedBooking.id);
                      setShowDetails(false);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </Button>
                )}
                {selectedBooking.payment_status === 'paid' &&
                  selectedBooking.payout_status === 'pending' && (
                    <Button
                      onClick={() => {
                        handleProcessPayout(selectedBooking);
                        setShowDetails(false);
                      }}
                      className="flex-1"
                      variant="outline"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Process Payout
                    </Button>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
