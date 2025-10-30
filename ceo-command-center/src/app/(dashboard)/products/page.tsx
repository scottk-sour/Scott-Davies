'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Package, AlertCircle, TrendingUp, Eye, Heart } from 'lucide-react';
import Image from 'next/image';

type Product = {
  id: string;
  etsyListingId: string;
  title: string;
  description: string | null;
  quantity: number;
  price: number;
  currency: string;
  costPerUnit: number | null;
  state: string;
  mainImageUrl: string | null;
  views: number;
  favorites: number;
  lastSyncedAt: Date | null;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Etsy sync
  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/etsy/sync', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        await fetchProducts(); // Refresh products after sync
        alert(`Synced ${data.data.products} products!`);
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

  // Update cost per unit
  const handleUpdateCost = async (productId: string, costPerUnit: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ costPerUnit }),
      });
      if (response.ok) {
        // Update local state
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, costPerUnit } : p
          )
        );
      }
    } catch (error) {
      console.error('Failed to update cost:', error);
    }
  };

  // Filter and search products
  const filteredProducts = products.filter((product) => {
    // Search filter
    if (
      searchTerm &&
      !product.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Stock filter
    if (filter === 'low' && product.quantity > 5) return false;
    if (filter === 'out' && product.quantity > 0) return false;

    return true;
  });

  // Calculate stats
  const stats = {
    total: products.length,
    lowStock: products.filter((p) => p.quantity > 0 && p.quantity <= 5).length,
    outOfStock: products.filter((p) => p.quantity === 0).length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
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
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your Etsy inventory and track stock levels
          </p>
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
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Stock filters */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'low' ? 'default' : 'outline'}
                onClick={() => setFilter('low')}
              >
                Low Stock
              </Button>
              <Button
                variant={filter === 'out' ? 'default' : 'outline'}
                onClick={() => setFilter('out')}
              >
                Out of Stock
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm text-muted-foreground">
              {products.length === 0
                ? 'Connect your Etsy shop and sync to see your products'
                : 'Try adjusting your search or filters'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onUpdateCost={handleUpdateCost}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({
  product,
  onUpdateCost,
}: {
  product: Product;
  onUpdateCost: (id: string, cost: number) => void;
}) {
  const [costInput, setCostInput] = useState(
    product.costPerUnit?.toString() || ''
  );
  const [isEditingCost, setIsEditingCost] = useState(false);

  const stockColor =
    product.quantity === 0
      ? 'text-red-600 bg-red-50'
      : product.quantity <= 5
      ? 'text-yellow-600 bg-yellow-50'
      : 'text-green-600 bg-green-50';

  const profit =
    product.costPerUnit ? product.price - product.costPerUnit : null;

  const handleSaveCost = () => {
    const cost = parseFloat(costInput);
    if (!isNaN(cost) && cost >= 0) {
      onUpdateCost(product.id, cost);
    }
    setIsEditingCost(false);
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Product Image */}
        <div className="relative aspect-square mb-3 bg-gray-100 rounded-md overflow-hidden">
          {product.mainImageUrl ? (
            <Image
              src={product.mainImageUrl}
              alt={product.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}
          {/* Stock Badge */}
          <div className="absolute top-2 right-2">
            <Badge className={stockColor}>
              {product.quantity === 0
                ? 'Out of Stock'
                : `${product.quantity} in stock`}
            </Badge>
          </div>
        </div>

        {/* Product Title */}
        <h3 className="font-semibold line-clamp-2 mb-2">{product.title}</h3>

        {/* Stats Row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {product.views}
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {product.favorites}
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">
              ${product.price.toFixed(2)} {product.currency}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Cost:</span>
            {isEditingCost ? (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  step="0.01"
                  value={costInput}
                  onChange={(e) => setCostInput(e.target.value)}
                  className="h-7 w-20 text-right"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={handleSaveCost}
                >
                  Save
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingCost(true)}
                className="font-medium hover:underline"
              >
                {product.costPerUnit
                  ? `$${product.costPerUnit.toFixed(2)}`
                  : 'Add cost'}
              </button>
            )}
          </div>

          {profit !== null && (
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium">Profit:</span>
              <span
                className={`font-bold ${
                  profit > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                ${profit.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
