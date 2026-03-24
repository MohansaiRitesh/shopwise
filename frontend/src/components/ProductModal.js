import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { productApi } from '../services/api';
import './ProductModal.css';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Automotive'];

const empty = {
  name: '', description: '', price: '', category: '',
  brand: '', imageUrl: '', stockQuantity: 0, featured: false
};

export default function ProductModal({ product, onClose, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState(isEdit ? {
    name: product.name || '',
    description: product.description || '',
    price: product.price || '',
    category: product.category || '',
    brand: product.brand || '',
    imageUrl: product.imageUrl || '',
    stockQuantity: product.stockQuantity || 0,
    featured: product.featured || false
  } : empty);
  const [loading, setLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.category) {
      toast.error('Name, price and category are required');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity) };
      if (isEdit) {
        await productApi.update(product.id, payload);
        toast.success('Product updated!');
      } else {
        await productApi.create(payload);
        toast.success('Product created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box fade-in-up">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-grid">
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                className="form-input" placeholder="e.g. Sony WH-1000XM5 Headphones" required />
            </div>

            <div className="form-group">
              <label>Price (₹) *</label>
              <input name="price" value={form.price} onChange={handleChange}
                type="number" min="0" step="0.01" className="form-input"
                placeholder="e.g. 29990" required />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="form-input" required>
                <option value="">Select category…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange}
                className="form-input" placeholder="e.g. Sony" />
            </div>

            <div className="form-group">
              <label>Stock Quantity</label>
              <input name="stockQuantity" value={form.stockQuantity} onChange={handleChange}
                type="number" min="0" className="form-input" />
            </div>

            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Image URL</label>
              <input name="imageUrl" value={form.imageUrl} onChange={handleChange}
                className="form-input" placeholder="https://…" />
            </div>

            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                className="form-input" rows={3} placeholder="Short product description…" />
            </div>

            <div className="form-group featured-check">
              <label className="check-label">
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
                <span>⭐ Mark as Featured</span>
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
              {loading ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
