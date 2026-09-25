import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  TrendingUp,
  DollarSign,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { supabase, type Product, type Order, type Profile, type OrderItem } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice, formatDate } from '@/lib/format';

type Tab = 'overview' | 'products' | 'orders' | 'users';

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-blue-50 text-blue-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

type OrderWithItemsAndProfile = Order & {
  order_items: OrderItem[];
  profiles: { full_name: string; email: string } | null;
};

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderWithItemsAndProfile[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadData = useCallback(async () => {
    const [productsRes, ordersRes, usersRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase
        .from('orders')
        .select('*, order_items(*), profiles!orders_user_id_fkey(full_name, email)')
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ]);
    setProducts((productsRes.data as Product[]) ?? []);
    setOrders((ordersRes.data as OrderWithItemsAndProfile[]) ?? []);
    setUsers((usersRes.data as Profile[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      return;
    }
    if (isAdmin) loadData();
  }, [isAdmin, authLoading, navigate, loadData]);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Product deleted');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Order status updated');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('User role updated');
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const lowStock = products.filter((p) => p.stock <= 10).length;

  const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage products, track orders, and oversee users.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-gray-50 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
              { label: 'Pending Orders', value: pendingOrders, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
              { label: 'Low Stock Items', value: lowStock, icon: Package, color: 'text-red-600 bg-red-50' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Recent Orders</h2>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.profiles?.full_name || order.profiles?.email || 'Unknown'} · {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatPrice(Number(order.total))}
                    </span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-400">No orders yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      {tab === 'products' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">{products.length} products</p>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowProductModal(true);
              }}
              className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(Number(product.price))}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.stock <= 10 ? 'text-amber-600' : 'text-gray-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowProductModal(true);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.profiles?.full_name || order.profiles?.email || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.order_items?.length || 0} items
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {formatPrice(Number(order.total))}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className={`rounded-full border-0 px-3 py-1 text-xs font-semibold capitalize cursor-pointer ${STATUS_STYLES[order.status]}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                        {(u.full_name || u.email || 'U')[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{u.full_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                      className={`rounded-full border-0 px-3 py-1 text-xs font-semibold capitalize cursor-pointer ${
                        u.role === 'admin' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showProductModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => setShowProductModal(false)}
          onSaved={() => {
            setShowProductModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    image_url: product?.image_url || '',
    category: product?.category || 'General',
    stock: product?.stock?.toString() || '0',
    featured: product?.featured || false,
    rating: product?.rating?.toString() || '4.0',
    original_price: product?.original_price?.toString() || '',
    discount: product?.discount?.toString() || '0',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      image_url: form.image_url,
      category: form.category,
      stock: parseInt(form.stock) || 0,
      featured: form.featured,
      rating: parseFloat(form.rating) || 4.0,
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      discount: parseInt(form.discount) || 0,
    };

    let error;
    if (product) {
      ({ error } = await supabase.from('products').update(payload).eq('id', product.id));
    } else {
      ({ error } = await supabase.from('products').insert(payload));
    }

    setSaving(false);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast(product ? 'Product updated' : 'Product created');
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Rating</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Orig. Price</label>
              <input
                type="number"
                step="0.01"
                value={form.original_price}
                onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Discount %</label>
              <input
                type="number"
                min="0"
                max="90"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option>General</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Beauty</option>
              <option>Footwear</option>
              <option>Home & Kitchen</option>
              <option>Home</option>
              <option>Accessories</option>
              <option>Grocery</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="https://..."
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <span className="text-sm font-medium text-gray-700">Featured product</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
