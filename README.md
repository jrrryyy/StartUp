# StartUp — Commercial MERN Business Management & POS System

> **Tagline:** *"Start Smart. Sell Better. Grow Faster."*

**StartUp** is a modern, full-stack MERN business operations platform tailored for coffee shops, cafés, restaurants, food stalls, retail stores, and growing startup enterprises.

It combines an ultra-fast digital cashier Point of Sale (POS) register, atomic inventory management, operating expense tracking, real-time P&L analytics, and professional multi-sheet Excel report exports in one centralized application.

---

## 🌟 Key Capabilities

- **Digital Cashier POS:** Rapid product search, category filtering, live order basket, Dine-in/Takeout toggle, cash change calculator, digital wallet reference recording (GCash, Maya), and 58mm/80mm thermal receipt printing.
- **True Profitability Accounting:** Accurately separates revenue from profits. Calculates Gross Sales, Discounts, Refunds, Net Sales, Cost of Goods Sold (COGS), Gross Profit, Operating Expenses, and Estimated Net Profit.
- **Atomic Stock Management:** Prevents overselling with server-side stock validations, automatic post-checkout inventory deductions, low-stock threshold alerts, and an immutable inventory movement audit log.
- **Enterprise Multi-Sheet Excel Reports:** Generates stylized `.xlsx` workbooks via ExcelJS containing an Executive Summary, Transaction Journal, Inventory Stock Valuations, and Operating Expenses.
- **Multi-Tenant Data Isolation:** Enforces strict per-business scoping across all endpoints and database queries (`businessId`).
- **Role-Based Access Control (RBAC):**
  - **Business Owner:** Full administrative access, financial analytics, operating expenses, employee management, and settings.
  - **Cashier:** Streamlined access to Point of Sale operations and order entry.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, TanStack Query, React Hook Form, Zod, Sonner.
- **Backend:** Node.js, Express.js, MongoDB Atlas (Mongoose), JWT (HttpOnly Cookie & Bearer auth), bcryptjs, Helmet, CORS, Express Rate Limit.
- **Exports & Reporting:** ExcelJS, date-fns.

---

## 🚀 Running the Project (Windows PowerShell)

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas cluster connection string or local MongoDB instance

### 1. Server Configuration
```powershell
cd d:\TheStartUp\server
npm install
```

Configure `server\.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://StartUp:<db_password>@cluster0.nf81p2y.mongodb.net/startup?retryWrites=true&w=majority&appName=Cluster0
JWT_ACCESS_SECRET=startup_access_secret_super_secure_key_2026_xyz987
JWT_REFRESH_SECRET=startup_refresh_secret_super_secure_key_2026_abc123
CLIENT_ORIGIN=http://localhost:5173
COOKIE_SECRET=startup_cookie_secret_2026
```
*(Note: If `<db_password>` is left as placeholder or Atlas is offline, the backend server automatically initiates an in-memory MongoDB fallback so you can test and explore immediately without database configuration hurdles!)*

Start the backend:
```powershell
npm run dev
# Or: node server.js
```
The backend API will run at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

---

### 2. Client Configuration
In a separate PowerShell terminal:
```powershell
cd d:\TheStartUp\client
npm install
npm run dev
```
Open your browser at: **`http://localhost:5173`**

---

## 🔑 Quick Demo Credentials

For instantaneous demonstration and evaluation, you can click the **"Fill Sample Credentials"** button on the Login page or use:
- **Email:** `owner@startupcafe.ph`
- **Password:** `StartUp2026!`

Or click **"Get Started Free"** on the landing page to register your own custom business and follow the 3-step Onboarding Wizard!

---

## 📊 Available Modules
1. `/` — Modern SaaS Landing Page
2. `/dashboard` — Executive KPIs & 6 Recharts performance visualizations
3. `/pos` — Fast Point of Sale register with cash change calculator & thermal printing
4. `/products` — Product catalog management with SKU enforcement & categories
5. `/inventory` — Stock monitor, valuation metrics, and movement audit trail
6. `/transactions` — Sales transaction log with receipt re-printing & refund processing
7. `/analytics` — Deep-dive P&L waterfall breakdown & sales distribution
8. `/expenses` — Operating expense ledger for commercial overhead
9. `/reports` — Excel (.xlsx) export hub
10. `/employees` — Staff directory & cashier access management
11. `/settings` — Business profile, currency, VAT configuration, and thermal receipt headers
