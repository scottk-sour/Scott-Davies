'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

type EtsyShop = {
  id: string;
  shopName: string;
  etsyShopId: string;
  lastSyncedAt: Date | null;
  syncEnabled: boolean;
} | null;

type EtsyConnectionProps = {
  etsyShop: EtsyShop;
};

export function EtsyConnection({ etsyShop }: EtsyConnectionProps) {
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/etsy/connect');
      const data = await response.json();
      if (data.success) {
        // Redirect to Etsy OAuth
        window.location.href = data.data.url;
      } else {
        alert('Failed to initiate connection: ' + data.error);
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect to Etsy');
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/etsy/sync', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        alert(`Successfully synced ${data.data.products} products and ${data.data.orders} orders!`);
        window.location.reload(); // Refresh to show updated sync time
      } else {
        alert('Sync failed: ' + data.error);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync with Etsy');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Etsy Connection</CardTitle>
        <CardDescription>
          Connect your Etsy shop to sync products and orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {etsyShop ? (
          <>
            {/* Connected Status */}
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Connected to Etsy</span>
              <Badge variant="default" className="ml-2">
                Active
              </Badge>
            </div>

            {/* Shop Info */}
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Shop Name</p>
                <p className="text-sm text-muted-foreground">{etsyShop.shopName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Shop ID</p>
                <p className="text-sm text-muted-foreground">{etsyShop.etsyShopId}</p>
              </div>
              {etsyShop.lastSyncedAt && (
                <div>
                  <p className="text-sm font-medium">Last Synced</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(etsyShop.lastSyncedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Sync Button */}
            <Button onClick={handleSync} disabled={syncing || !etsyShop.syncEnabled}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>

            {!etsyShop.syncEnabled && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Sync is currently disabled. Contact support to enable automatic syncing.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Not Connected */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">No Etsy shop connected</p>
                <p>Connect your Etsy shop to start syncing products and orders automatically.</p>
              </div>
            </div>

            <Button onClick={handleConnect} disabled={connecting}>
              <RefreshCw className={`h-4 w-4 mr-2 ${connecting ? 'animate-spin' : ''}`} />
              {connecting ? 'Connecting...' : 'Connect Etsy Shop'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
