# 🛍 ShopWise — Full-Stack E-Commerce Platform

A production-grade e-commerce web application with **React** frontend and **Spring Boot** backend, featuring **JWT authentication**, **OAuth2/OpenID Connect SSO** (Google & GitHub), and **Role-Based Access Control (RBAC)**.

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Demo Credentials](#demo-credentials)
- [API Reference](#api-reference)
- [SSO Configuration](#sso-configuration)
- [RBAC Overview](#rbac-overview)
- [Project Structure](#project-structure)

---

## ✨ Features

| Feature | Details |
|---|---|
| **Local Auth** | Username + password with BCrypt hashing and JWT tokens |
| **SSO Login** | OAuth2 / OpenID Connect via Google and GitHub |
| **RBAC** | Admin (full CRUD) and User (read-only) roles |
| **Product Catalog** | 16 seeded products across 6 categories with search, filter, and pagination |
| **Admin Dashboard** | Create, edit, and delete products with instant UI feedback |
| **User Profiles** | View and update personal info, change password, account settings tab |
| **Responsive UI** | Works on desktop, tablet, and mobile |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend (port 3000)               │
│                                                                 │
│  LoginPage ──► AuthContext ──► JWT stored in localStorage       │
│  Dashboard ──► productApi  ──► Axios (Bearer token header)      │
│  Profile   ──► userApi                                          │
│  OAuth2Callback ◄── SSO redirect from Spring                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP (REST + CORS)
┌──────────────────────────▼──────────────────────────────────────┐
│                    Spring Boot Backend (port 8080)              │
│                                                                 │
│  AuthController  ──► AuthService   ──► UserRepository           │
│  ProductController─► ProductService─► ProductRepository         │
│  UserController  ──► UserService                                │
│                                                                 │
│  Security Layer:                                                │
│  AuthTokenFilter (JWT) ──► UserDetailsServiceImpl               │
│  OAuth2SuccessHandler  ──► issues JWT after SSO                 │
│  SecurityConfig        ──► RBAC rules (@PreAuthorize)           │
│                                                                 │
│  H2 In-Memory DB  (auto-seeded on startup)                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.2**
- **Spring Security 6** — stateless JWT + OAuth2 Login
- **Spring Data JPA** + **H2** (in-memory, auto-seeded)
- **jjwt 0.11.5** — JWT generation and validation
- **Lombok** — boilerplate reduction
- **Maven** — build tool

### Frontend
- **React 18** + **React Router 6**
- **Axios** with request interceptors (JWT attach, 401 redirect)
- **react-hot-toast** — toast notifications
- **Google Fonts** (Plus Jakarta Sans + Instrument Serif)
- **CSS Variables** design system (no external UI library)

---

## ✅ Prerequisites

| Tool | Version |
|---|---|
| Java JDK | 17 or higher |
| Maven | 3.8+ |
| Node.js | 18+ |
| npm | 9+ |
| Git | any |

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/shopwise.git
cd shopwise
```

### 2. Start the Backend

```bash
cd backend

# Build and run
mvn spring-boot:run
```

The API will start at **http://localhost:8080**.

On startup it automatically:
- Creates the H2 in-memory database schema
- Seeds **2 users** (admin + user)
- Seeds **16 products** across 6 categories

> **H2 Console** (dev only): http://localhost:8080/h2-console  
> JDBC URL: `jdbc:h2:mem:shopwisedb` | Username: `sa` | Password: *(empty)*

### 3. Start the Frontend

```bash
cd frontend
npm install
npm start
```

React dev server starts at **http://localhost:3000** and proxies `/api/**` to the Spring Boot backend.

---

## 🔑 Demo Credentials

| Role | Username | Password | Access |
|---|---|---|---|
| **Admin** | `admin` | `Admin@123` | View + Create + Edit + Delete products, View all users |
| **User** | `user` | `User@123` | View products only (no create/edit/delete) |

> Click the demo credential cards on the Login page to auto-fill the form.

---

## 📡 API Reference

All endpoints require `Authorization: Bearer <token>` except auth routes.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login with username + password |
| POST | `/api/auth/register` | Public | Register a new USER-role account |
| GET | `/oauth2/authorize/google` | Public | Initiate Google SSO login |
| GET | `/oauth2/authorize/github` | Public | Initiate GitHub SSO login |

**Login request:**
```json
{ "username": "admin", "password": "Admin@123" }
```

**Login response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9…",
  "type": "Bearer",
  "id": 1,
  "username": "admin",
  "email": "admin@shopwise.com",
  "fullName": "Admin User",
  "role": "ROLE_ADMIN",
  "avatarUrl": "https://…"
}
```

### Products

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/products` | Any | List products (paginated, filterable) |
| GET | `/api/products/{id}` | Any | Get single product |
| GET | `/api/products/featured` | Any | Get featured products |
| GET | `/api/products/categories` | Any | Get all category names |
| GET | `/api/products/search?keyword=` | Any | Full-text search |
| POST | `/api/products` | **ADMIN** | Create product |
| PUT | `/api/products/{id}` | **ADMIN** | Update product |
| DELETE | `/api/products/{id}` | **ADMIN** | Delete product |

**Query params for GET /api/products:**
- `page` (default: 0)
- `size` (default: 12)
- `sortBy` (name | price | rating | createdAt)
- `direction` (asc | desc)
- `category` (filter by category name)

### Users

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/users/me` | Any | Get own profile |
| PUT | `/api/users/me` | Any | Update own profile |
| POST | `/api/users/me/password` | Any | Change own password |
| GET | `/api/users` | **ADMIN** | List all users |

---

## 🔐 SSO Configuration

To enable Google and GitHub login, you need to register OAuth2 applications and add your credentials.

### Google

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new **OAuth 2.0 Client ID** (Web application)
3. Add **Authorized redirect URI**: `http://localhost:8080/login/oauth2/code/google`
4. Set environment variables before running Spring Boot:

```bash
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret
mvn spring-boot:run
```

### GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Set **Authorization callback URL**: `http://localhost:8080/login/oauth2/code/github`
3. Set environment variables:

```bash
export GITHUB_CLIENT_ID=your-github-client-id
export GITHUB_CLIENT_SECRET=your-github-client-secret
mvn spring-boot:run
```

**SSO Flow:**
```
User clicks "Continue with Google"
  → React sends to /oauth2/authorize/google
    → Spring redirects to Google consent screen
      → Google redirects to /login/oauth2/code/google
        → OAuth2AuthenticationSuccessHandler:
          - Finds or creates User in DB
          - Issues JWT token
          - Redirects to http://localhost:3000/oauth2/callback?token=...
            → React stores JWT and navigates to /dashboard
```

---

## 🛡 RBAC Overview

Role-Based Access Control is enforced at two levels:

### 1. Spring Security Layer (`SecurityConfig.java`)

```java
.requestMatchers(HttpMethod.GET, "/api/products/**").authenticated()   // ADMIN + USER
.requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN") // ADMIN only
.requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")  // ADMIN only
.requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN") // ADMIN only
```

### 2. Method-Level (`@PreAuthorize` in controllers)

```java
@DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Void> delete(@PathVariable Long id) { … }
```

### 3. React UI Layer (`useAuth` context)

```jsx
{isAdmin && <button onClick={() => setShowCreate(true)}>Add Product</button>}
{isAdmin
  ? <AdminActions onEdit onDelete />   // Edit + Delete buttons
  : <button>Add to Cart</button>       // Read-only action
}
```

---

## 📁 Project Structure

```
shopwise/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/shopwise/
│       │   ├── ShopWiseApplication.java
│       │   ├── config/
│       │   │   ├── SecurityConfig.java          # CORS, RBAC, OAuth2, JWT
│       │   │   ├── DataSeeder.java              # Seeds users + products on startup
│       │   │   └── GlobalExceptionHandler.java  # JSON error responses
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── ProductController.java
│       │   │   └── UserController.java
│       │   ├── dto/
│       │   │   ├── AuthDto.java
│       │   │   ├── ProductDto.java
│       │   │   └── UserDto.java
│       │   ├── entity/
│       │   │   ├── User.java
│       │   │   └── Product.java
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   └── ProductRepository.java
│       │   ├── security/
│       │   │   ├── JwtUtils.java
│       │   │   ├── AuthTokenFilter.java
│       │   │   ├── UserDetailsServiceImpl.java
│       │   │   └── OAuth2AuthenticationSuccessHandler.java
│       │   └── service/
│       │       ├── AuthService.java
│       │       ├── ProductService.java
│       │       └── UserService.java
│       └── resources/
│           └── application.properties
│
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── index.js                             # React entry point
        ├── App.js                               # Routes + ProtectedRoute
        ├── App.css                              # Design system (CSS variables)
        ├── context/
        │   └── AuthContext.js                  # Global auth state + JWT
        ├── services/
        │   └── api.js                          # Axios instance + all API calls
        ├── components/
        │   ├── Navbar.js / .css                # Top navigation + search
        │   ├── ProductCard.js / .css           # Product display card
        │   ├── ProductModal.js / .css          # Admin create/edit form
        │   └── ConfirmDialog.js                # Delete confirmation
        └── pages/
            ├── LoginPage.js / AuthPages.css    # Login + SSO buttons
            ├── RegisterPage.js                 # Registration form
            ├── OAuth2Callback.js               # Handles SSO token redirect
            ├── DashboardPage.js / .css         # Main product catalog
            └── ProfilePage.js / .css           # User profile management
```

---

## 🔒 Security Notes

- Passwords are hashed with **BCrypt** (strength factor 12)
- JWT secret should be at least 256-bit in production — set via environment variable
- CORS is configured to allow only `http://localhost:3000`
- H2 console is enabled for development only — disable in production
- OAuth2 users get `ROLE_USER` by default; promote to admin manually via DB if needed

---

## 📝 License

MIT — built for the BusyBrains assessment.
