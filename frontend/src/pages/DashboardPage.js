import React, { useState, useEffect, useCallback } from 'react';
import { productApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';
import './DashboardPage.css';

export default function DashboardPage() {
  const { isAdmin, user } = useAuth();

  // Products state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [page, setPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const PAGE_SIZE = 12;

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await productApi.getCategories();
      setCategories(data);
    } catch {}
  }, []);

  const fetchFeatured = useCallback(async () => {
    try {
      const { data } = await productApi.getFeatured();
      setFeatured(data.slice(0, 4));
    } catch {}
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (searchKeyword) {
        res = await productApi.search(searchKeyword, page, PAGE_SIZE);
      } else if (selectedCategory) {
        res = await productApi.getAll({ page, size: PAGE_SIZE, category: selectedCategory });
      } else {
        res = await productApi.getAll({ page, size: PAGE_SIZE, sortBy, direction: sortDir });
      }
      setProducts(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, searchKeyword, sortBy, sortDir]);

  // useEffect(() => { fetchCategories(); fetchFeatured(); }, []);
  useEffect(() => {
  fetchCategories();
  fetchFeatured();
}, [fetchCategories, fetchFeatured]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSearch = useCallback((kw) => {
    setSearchKeyword(kw);
    setSelectedCategory('');
    setPage(0);
  }, []);

  const handleCategory = (cat) => {
    setSelectedCategory(cat);
    setSearchKeyword('');
    setPage(0);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await productApi.delete(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchProducts();
      fetchFeatured();
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const onSaved = () => { fetchProducts(); fetchFeatured(); };

  // ── Render ───────────────────────────────────────────────────────────────────

  const activeFilter = searchKeyword
    ? `Results for "${searchKeyword}"`
    : selectedCategory || 'All Products';

  return (
    <div className="dashboard">
      <Navbar onSearch={handleSearch} />

      <div className="dashboard-body container">
        {/* ── Welcome banner ─────────────────────────────────── */}
        <div className="welcome-banner fade-in">
          <div>
            <h1 className="welcome-title">
              Good day, <span>{user?.fullName?.split(' ')[0] || user?.username}</span> 👋
            </h1>
            <p className="welcome-sub">
              {isAdmin
                ? 'You have full admin access — manage products, add new listings, and control inventory.'
                : 'Browse our curated selection of products across every category.'}
            </p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary btn-lg" onClick={() => setShowCreate(true)}>
              ➕ Add Product
            </button>
          )}
        </div>

        {/* ── Featured strip (only on default view) ──────────── */}
        {!searchKeyword && !selectedCategory && page === 0 && featured.length > 0 && (
          <div className="featured-section fade-in">
            <h2 className="section-title">⭐ Featured Picks</h2>
            <div className="featured-grid">
              {featured.map(p => (
                <ProductCard key={p.id} product={p}
                  onEdit={setEditProduct} onDelete={setDeleteTarget} />
              ))}
            </div>
          </div>
        )}

        {/* ── Filters & Sort bar ─────────────────────────────── */}
        <div className="filters-bar fade-in">
          <div className="category-pills">
            <button
              className={`pill ${!selectedCategory ? 'pill-active' : ''}`}
              onClick={() => handleCategory('')}>All</button>
            {categories.map(c => (
              <button key={c}
                className={`pill ${selectedCategory === c ? 'pill-active' : ''}`}
                onClick={() => handleCategory(c)}>{c}</button>
            ))}
          </div>

          <div className="sort-controls">
            <select className="form-input sort-select" value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(0); }}>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="createdAt">Newest</option>
            </select>
            <button className="btn btn-outline btn-sm"
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
              {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>

        {/* ── Results header ─────────────────────────────────── */}
        <div className="results-header fade-in">
          <h2 className="section-title">{activeFilter}</h2>
          <span className="results-count">{totalElements} product{totalElements !== 1 ? 's' : ''}</span>
        </div>

        {/* ── Product Grid ───────────────────────────────────── */}
        {loading ? (
          <div className="products-loading">
            {[...Array(8)].map((_, i) => <div key={i} className="product-skeleton" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state fade-in">
            <span className="empty-icon">🔍</span>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn btn-outline" onClick={() => { handleSearch(''); handleCategory(''); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="products-grid fade-in">
            {products.map(p => (
              <ProductCard key={p.id} product={p}
                onEdit={setEditProduct}
                onDelete={setDeleteTarget} />
            ))}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="pagination fade-in">
            <button className="btn btn-outline btn-sm" disabled={page === 0}
              onClick={() => setPage(p => p - 1)}>← Previous</button>
            <div className="page-numbers">
              {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                const p = totalPages <= 7 ? i : Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
                return (
                  <button key={p}
                    className={`page-btn ${page === p ? 'page-btn-active' : ''}`}
                    onClick={() => setPage(p)}>{p + 1}</button>
                );
              })}
            </div>
            <button className="btn btn-outline btn-sm" disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      {showCreate && (
        <ProductModal onClose={() => setShowCreate(false)} onSaved={onSaved} />
      )}
      {editProduct && (
        <ProductModal product={editProduct}
          onClose={() => setEditProduct(null)} onSaved={onSaved} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          loading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
