'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RefreshCw, Search, Package, DollarSign, Clock, CheckCircle, XCircle, Truck, TrendingUp, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED' | 'REFUNDED';

type OrderItem = {
  id: string;
  productTitle: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  costPerUnit: number | null;
};

type Order = {
  id: string;
  etsyOrderId: string;
  orderNumber: string;
  buyerName: string | null;
  buyerEmail: string | null;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  etsyFees: number | null;
  status: OrderStatus;
  orderDate: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  trackingNumber: string | null;
  shippingCarrier: string | null;
  items: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/etsy/sync', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        await fetchOrders();
        alert(`Synced ${data.data.orders} orders!`);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        await fetchOrders();
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(search) ||
        order.buyerName?.toLowerCase().includes(search) ||
        order.buyerEmail?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING').length,
    shipped: orders.filter((o) => o.status === 'SHIPPED').length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Manage your Etsy orders and fulfillment
          </p>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncing}
          size="lg"
          className="shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync from Etsy'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-yellow-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to ship</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">£{stats.revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total sales</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Avg Order Value</CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">£{stats.avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('ALL')}
                className="h-11"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('PENDING')}
                className="h-11"
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'SHIPPED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('SHIPPED')}
                className="h-11"
              >
                Shipped
              </Button>
              <Button
                variant={statusFilter === 'DELIVERED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('DELIVERED')}
                className="h-11"
              >
                Delivered
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="border-none shadow-md">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm text-muted-foreground mt-2">
              {orders.length === 0
                ? 'Connect your Etsy shop and sync to see your orders'
                : 'Try adjusting your search or filters'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => setSelectedOrder(order)}
            />
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleUpdateOrder}
        />
      )}
    </div>
  );
}

// Order Card Component
function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    PROCESSING: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: RefreshCw },
    SHIPPED: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
    DELIVERED: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    CANCELED: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
    REFUNDED: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  };

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  const profit = order.items.reduce((sum, item) => {
    if (item.costPerUnit) {
      return sum + (item.pricePerUnit - item.costPerUnit) * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <Card
      className="cursor-pointer border-none shadow-md hover:shadow-xl transition-all duration-300 group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-xl">#{order.orderNumber}</h3>
              <Badge className={`${config.color} border`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {order.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{order.buyerName || order.buyerEmail || 'Anonymous'}</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(order.orderDate), { addSuffix: true })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">£{order.total.toFixed(2)}</p>
            {profit > 0 && (
              <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
                +£{profit.toFixed(2)} profit
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Items</p>
            <p className="font-semibold">{order.items.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Subtotal</p>
            <p className="font-semibold">£{order.subtotal.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Shipping</p>
            <p className="font-semibold">£{order.shippingCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Tax</p>
            <p className="font-semibold">£{order.taxAmount.toFixed(2)}</p>
          </div>
        </div>

        {order.trackingNumber && (
          <div className="mt-4 pt-4 border-t flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Tracking: <span className="font-mono font-medium text-foreground">{order.trackingNumber}</span>
              {order.shippingCarrier && ` via ${order.shippingCarrier}`}
            </p>
          </div>
        )}

        <div className="mt-2 text-xs text-muted-foreground text-center group-hover:text-primary transition-colors">
          Click to view details →
        </div>
      </CardContent>
    </Card>
  );
}

// Order Details Modal
function OrderDetailsModal({
  order,
  onClose,
  onUpdate,
}: {
  order: Order;
  onClose: () => void;
  onUpdate: (orderId: string, updates: Partial<Order>) => void;
}) {
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [shippingCarrier, setShippingCarrier] = useState(order.shippingCarrier || '');

  const handleMarkShipped = () => {
    onUpdate(order.id, {
      status: 'SHIPPED',
      shippedAt: new Date().toISOString(),
      trackingNumber: trackingNumber || null,
      shippingCarrier: shippingCarrier || null,
    });
  };

  const totalProfit = order.items.reduce((sum, item) => {
    if (item.costPerUnit) {
      return sum + (item.pricePerUnit - item.costPerUnit) * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Order #{order.orderNumber}</DialogTitle>
          <DialogDescription className="text-base">
            Placed {formatDistanceToNow(new Date(order.orderDate), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">{order.buyerName || 'Anonymous'}</p>
                  {order.buyerEmail && (
                    <p className="text-sm text-muted-foreground">{order.buyerEmail}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Items ({order.items.length})</h3>
            <div className="space-y-3">
              {order.items.map((item) => {
                const itemProfit = item.costPerUnit
                  ? (item.pricePerUnit - item.costPerUnit) * item.quantity
                  : null;

                return (
                  <Card key={item.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold">{item.productTitle}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Quantity: {item.quantity} × £{item.pricePerUnit.toFixed(2)}
                          </p>
                          {item.costPerUnit && (
                            <p className="text-xs text-muted-foreground">
                              Cost: £{item.costPerUnit.toFixed(2)} each
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">£{item.totalPrice.toFixed(2)}</p>
                          {itemProfit !== null && (
                            <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
                              +£{itemProfit.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <Card className="border-2 bg-gradient-to-br from-gray-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">£{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span className="font-medium">£{order.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span className="font-medium">£{order.taxAmount.toFixed(2)}</span>
                </div>
                {order.etsyFees && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Etsy Fees:</span>
                    <span>-£{order.etsyFees.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xl pt-3 border-t-2">
                  <span>Total:</span>
                  <span>£{order.total.toFixed(2)}</span>
                </div>
                {totalProfit > 0 && (
                  <div className="flex justify-between font-bold text-lg text-green-600 bg-green-50 p-3 rounded-lg">
                    <span>Estimated Profit:</span>
                    <span>+£{totalProfit.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          {order.status === 'PENDING' || order.status === 'PROCESSING' ? (
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Mark as Shipped
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Tracking Number</Label>
                    <Input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="1Z999AA10123456784"
                      className="mt-1.5 h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Carrier</Label>
                    <Input
                      value={shippingCarrier}
                      onChange={(e) => setShippingCarrier(e.target.value)}
                      placeholder="UPS, USPS, FedEx..."
                      className="mt-1.5 h-11"
                    />
                  </div>
                </div>
                <Button onClick={handleMarkShipped} className="w-full h-11 shadow-md hover:shadow-lg transition-all" size="lg">
                  <Truck className="h-4 w-4 mr-2" />
                  Mark as Shipped
                </Button>
              </CardContent>
            </Card>
          ) : (
            order.trackingNumber && (
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold min-w-20">Tracking:</span>
                    <span className="font-mono text-sm">{order.trackingNumber}</span>
                  </div>
                  {order.shippingCarrier && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-semibold min-w-20">Carrier:</span>
                      <span className="text-sm">{order.shippingCarrier}</span>
                    </div>
                  )}
                  {order.shippedAt && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-semibold min-w-20">Shipped:</span>
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(order.shippedAt), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
