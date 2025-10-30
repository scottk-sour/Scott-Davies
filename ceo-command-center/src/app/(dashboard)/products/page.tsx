'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Package, AlertCircle, TrendingUp, Eye, Heart, DollarSign } from 'lucide-react';
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
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Manage your Etsy inventory and track stock levels
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
        <Card className="border-none shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Products</CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">In your shop</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Low Stock</CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Out of Stock</CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-red-600">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of inventory</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Value</CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">
              £{stats.totalValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11"
              />
            </div>

            {/* Stock filters */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className="h-11"
              >
                All
              </Button>
              <Button
                variant={filter === 'low' ? 'default' : 'outline'}
                onClick={() => setFilter('low')}
                className="h-11 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Low Stock</span>
                <span className="sm:hidden">Low</span>
              </Button>
              <Button
                variant={filter === 'out' ? 'default' : 'outline'}
                onClick={() => setFilter('out')}
                className="h-11 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Out of Stock</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <Card className="border-none shadow-md">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm text-muted-foreground mt-2">
              {products.length === 0
                ? 'Connect your Etsy shop and sync to see your products'
                : 'Try adjusting your search or filters'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

  const stockBadgeVariant =
    product.quantity === 0
      ? 'destructive'
      : product.quantity <= 5
      ? 'secondary'
      : 'default';

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
    <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {product.mainImageUrl ? (
            <Image
              src={product.mainImageUrl}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
          {/* Stock Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant={stockBadgeVariant} className="shadow-md">
              {product.quantity === 0
                ? 'Out of Stock'
                : `${product.quantity} in stock`}
            </Badge>
          </div>
          {/* Engagement Stats Overlay */}
          <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg p-2 flex items-center justify-between text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{product.views} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{product.favorites} favs</span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-5">
          {/* Product Title */}
          <h3 className="font-semibold line-clamp-2 mb-4 text-lg">{product.title}</h3>

          {/* Pricing */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Price</span>
              <span className="font-semibold text-lg">
                £{product.price.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Cost</span>
              {isEditingCost ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value)}
                    className="h-8 w-24 text-right"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="default"
                    className="h-8 px-3"
                    onClick={handleSaveCost}
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingCost(true)}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {product.costPerUnit
                    ? `£${product.costPerUnit.toFixed(2)}`
                    : '+ Add cost'}
                </button>
              )}
            </div>

            {profit !== null && (
              <div className="flex justify-between items-center pt-3 bg-gradient-to-r from-green-50 to-emerald-50 -mx-5 -mb-5 p-5 mt-3">
                <span className="font-medium text-gray-700">Profit</span>
                <span
                  className={`font-bold text-xl ${
                    profit > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  £{profit.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
