import React from 'react';
import { useAuth } from '../context/AuthContext';
import './ProductCard.css';

export default function ProductCard({ product, onEdit, onDelete }) {
  const { isAdmin } = useAuth();

  const stars = (rating) => {
    const r = parseFloat(rating) || 0;
    return '★'.repeat(Math.floor(r)) + (r % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(r));
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const imgSrc = product.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=400&background=1e293b&color=6366f1`;

  return (
    <div className="product-card">
      <div className="product-img-wrap">
        <img src={imgSrc} alt={product.name} className="product-img"
          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=400&background=1e293b&color=6366f1`; }} />
        {product.featured && <span className="product-featured-badge">⭐ Featured</span>}
        <span className="product-category-badge">{product.category}</span>
      </div>

      <div className="product-body">
        {product.brand && <div className="product-brand">{product.brand}</div>}
        <h3 className="product-name">{product.name}</h3>

        <div className="product-rating">
          <span className="stars">{stars(product.rating)}</span>
          <span className="rating-val">{parseFloat(product.rating || 0).toFixed(1)}</span>
          <span className="rating-count">({(product.reviewCount || 0).toLocaleString()})</span>
        </div>

        <div className="product-footer">
          <div className="product-price">{formatPrice(product.price)}</div>
          <div className={`product-stock ${product.stockQuantity === 0 ? 'out' : product.stockQuantity < 10 ? 'low' : ''}`}>
            {product.stockQuantity === 0 ? 'Out of stock' :
             product.stockQuantity < 10 ? `Only ${product.stockQuantity} left` :
             `In stock`}
          </div>
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <div className="product-admin-actions">
            <button className="btn btn-outline btn-sm" onClick={() => onEdit(product)}>
              ✏️ Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(product)}>
              🗑 Delete
            </button>
          </div>
        )}

        {/* User action */}
        {!isAdmin && (
          <button className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 8 }}
            disabled={product.stockQuantity === 0}>
            {product.stockQuantity === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
}
