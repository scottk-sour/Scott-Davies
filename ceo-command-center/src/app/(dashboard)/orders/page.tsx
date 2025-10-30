'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RefreshCw, Search, Package, DollarSign, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
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
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage your Etsy orders and fulfillment</p>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync from Etsy'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by number, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('ALL')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('PENDING')}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'SHIPPED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('SHIPPED')}
              >
                Shipped
              </Button>
              <Button
                variant={statusFilter === 'DELIVERED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('DELIVERED')}
              >
                Delivered
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm text-muted-foreground">
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
    PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    PROCESSING: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
    SHIPPED: { color: 'bg-purple-100 text-purple-800', icon: Truck },
    DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    CANCELED: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    REFUNDED: { color: 'bg-red-100 text-red-800', icon: XCircle },
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
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
              <Badge className={config.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {order.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {order.buyerName || order.buyerEmail || 'Anonymous'}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(order.orderDate), { addSuffix: true })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
            {profit > 0 && (
              <p className="text-sm text-green-600">+${profit.toFixed(2)} profit</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Items</p>
            <p className="font-medium">{order.items.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Subtotal</p>
            <p className="font-medium">${order.subtotal.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Shipping</p>
            <p className="font-medium">${order.shippingCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tax</p>
            <p className="font-medium">${order.taxAmount.toFixed(2)}</p>
          </div>
        </div>

        {order.trackingNumber && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Tracking: <span className="font-mono font-medium text-foreground">{order.trackingNumber}</span>
              {order.shippingCarrier && ` (${order.shippingCarrier})`}
            </p>
          </div>
        )}
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
  const [isEditing, setIsEditing] = useState(false);

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
          <DialogTitle>Order #{order.orderNumber}</DialogTitle>
          <DialogDescription>
            Placed {formatDistanceToNow(new Date(order.orderDate), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-2">Customer</h3>
            <p>{order.buyerName || 'Anonymous'}</p>
            {order.buyerEmail && (
              <p className="text-sm text-muted-foreground">{order.buyerEmail}</p>
            )}
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-2">Items ({order.items.length})</h3>
            <div className="space-y-2">
              {order.items.map((item) => {
                const itemProfit = item.costPerUnit
                  ? (item.pricePerUnit - item.costPerUnit) * item.quantity
                  : null;

                return (
                  <div key={item.id} className="flex justify-between items-start p-3 bg-muted rounded-md">
                    <div className="flex-1">
                      <p className="font-medium">{item.productTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${item.pricePerUnit.toFixed(2)}
                      </p>
                      {item.costPerUnit && (
                        <p className="text-xs text-muted-foreground">
                          Cost: ${item.costPerUnit.toFixed(2)} each
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                      {itemProfit !== null && (
                        <p className="text-sm text-green-600">+${itemProfit.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>${order.taxAmount.toFixed(2)}</span>
              </div>
              {order.etsyFees && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Etsy Fees:</span>
                  <span>-${order.etsyFees.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              {totalProfit > 0 && (
                <div className="flex justify-between font-semibold text-green-600">
                  <span>Estimated Profit:</span>
                  <span>+${totalProfit.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Info */}
          {order.status === 'PENDING' || order.status === 'PROCESSING' ? (
            <div className="space-y-4">
              <h3 className="font-semibold">Mark as Shipped</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tracking Number</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="1Z999AA10123456784"
                  />
                </div>
                <div>
                  <Label>Carrier</Label>
                  <Input
                    value={shippingCarrier}
                    onChange={(e) => setShippingCarrier(e.target.value)}
                    placeholder="UPS, USPS, FedEx..."
                  />
                </div>
              </div>
              <Button onClick={handleMarkShipped} className="w-full">
                <Truck className="h-4 w-4 mr-2" />
                Mark as Shipped
              </Button>
            </div>
          ) : (
            order.trackingNumber && (
              <div>
                <h3 className="font-semibold mb-2">Shipping</h3>
                <p className="text-sm">
                  <span className="text-muted-foreground">Tracking:</span>{' '}
                  <span className="font-mono">{order.trackingNumber}</span>
                </p>
                {order.shippingCarrier && (
                  <p className="text-sm text-muted-foreground">Carrier: {order.shippingCarrier}</p>
                )}
                {order.shippedAt && (
                  <p className="text-sm text-muted-foreground">
                    Shipped {formatDistanceToNow(new Date(order.shippedAt), { addSuffix: true })}
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
