# Cafe Akasa - Documentation

## Table of Contents

1. Overview
2. System Architecture
3. Design Decisions
4. Database Design
5. API Documentation
6. How to Run
7. Configuration
8. Security Features
9. Troubleshooting

---

## 1. Overview

Cafe Akasa is a food ordering platform I built using React for the frontend and Express.js for the backend. Users can browse food items, add them to a cart, and place orders. The app handles inventory management in real-time, so you won't accidentally sell items that are out of stock.

### Key Features

- **User Authentication**: JWT-based auth system - pretty standard stuff
- **Product Browsing**: Browse items by category (Fruit, Vegetable, Non-veg, Breads, Beverages, Snacks)
- **Shopping Cart**: Cart is stored in the database, so it persists across devices and sessions
- **Order Management**: Place orders with real-time inventory validation
- **Order Tracking**: Each order gets a unique tracking ID (format: CA-timestamp-UUID)
- **Order History**: Users can view all their past orders

### Technology Stack

**Backend:**
- Node.js with Express.js
- MySQL for the database
- JWT for authentication
- bcryptjs for password hashing
- Standard stuff: CORS, dotenv for environment variables

**Frontend:**
- React 18.2.0
- React Router for navigation
- Axios for API calls
- React Icons and Framer Motion for UI
- Create React App (didn't want to deal with Webpack config)

---

## 2. System Architecture

The app follows a pretty standard three-tier architecture:

1. **Frontend**: React app running in the browser
2. **Backend**: Express.js REST API server
3. **Database**: MySQL database

**How it works:**
- Frontend makes HTTP requests to the backend API
- Backend processes requests and queries MySQL
- Backend sends back JSON responses
- Frontend updates the UI based on responses

### Architecture Patterns

I used MVC pattern here:
- **Models**: Database schema and queries
- **Views**: React components
- **Controllers**: Express route handlers

**RESTful API:**
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs (e.g., `/api/cart`, `/api/orders`)
- JSON for request/response format

**State Management:**
- React Context API for global state
- Separate contexts for Auth and Cart (keeps things simple)
- Local state for component-specific stuff

**Middleware:**
- Auth middleware for protected routes
- Error handling middleware
- CORS middleware (needed for local dev)

---

## 3. Design Decisions

### 3.1 Authentication Strategy

I went with JWT-based stateless authentication. Here's why:

**Why JWT?**
- No need for server-side session storage (scales better)
- Works well with distributed systems
- Token validation doesn't require database lookups
- Easy to implement in mobile apps later if needed

**How it works:**
- Tokens expire after 2 days (configurable)
- Tokens stored in localStorage on the frontend
- Bearer token in Authorization header: `Authorization: Bearer <token>`

**Trade-offs:**
- Can't revoke tokens before expiration (would need a blacklist)
- Token size is larger than session IDs
- But for this use case, it works fine

### 3.2 Database Connection Pooling

Using connection pooling with mysql2. This prevents connection exhaustion and improves performance.

**Configuration:**
- Connection limit: 10 (should be enough for most cases)
- Queue limit: 0 (unlimited queue)

**Why pooling?**
- Reuses connections instead of creating new ones
- Prevents "too many connections" errors
- Better performance under load

### 3.3 Transaction Management

I use database transactions for the checkout process. This ensures data consistency - either everything succeeds or everything fails.

**Why transactions?**
- Prevents partial order creation
- Ensures inventory updates are synchronized
- If something fails, everything rolls back

**Implementation:**
- Checkout endpoint uses transactions
- If any error occurs, everything rolls back
- Inventory deduction happens within the transaction

**Example scenario:**
If a user tries to checkout but one item is out of stock, the entire transaction rolls back. No partial orders, no inventory issues.

### 3.4 Cart Persistence

Cart is stored server-side in the database. This was a deliberate choice.

**Why server-side?**
- Cart persists across devices (user logs in on phone, sees same cart)
- Cart survives browser sessions
- Multiple users can have separate carts
- Can validate stock in real-time

**Alternative considered:**
- LocalStorage would be simpler but wouldn't sync across devices
- For a food ordering app, cross-device sync is important

### 3.5 Inventory Management

Real-time stock checking during checkout. This prevents overselling.

**How it works:**
- When user adds to cart, we check stock
- During checkout, we check stock again (in case it changed)
- If stock is insufficient, checkout fails
- Inventory is only deducted on successful checkout

**Why this approach?**
- Prevents overselling
- Accurate inventory tracking
- Better user experience (immediate feedback)
- Transaction-based ensures consistency

---

## 4. Database Design

### 4.1 Database Schema

The database has 6 main tables:

1. **users**: User accounts (email, hashed password)
2. **categories**: Food categories (Fruit, Vegetable, etc.)
3. **items**: Food items (name, price, stock, category)
4. **cart_items**: User's shopping cart items
5. **orders**: Order records with tracking IDs
6. **order_items**: Items in each order (stores price at time of order)

### 4.2 Table Structures

**users Table:**
- `id` - Primary key, auto increment
- `email` - Unique, not null
- `password_hash` - Bcrypt hashed password
- `created_at` - Timestamp

**categories Table:**
- `id` - Primary key
- `name` - Unique category name

**items Table:**
- `id` - Primary key
- `name` - Item name
- `description` - Item description (optional)
- `price` - Decimal(10,2) for currency
- `stock` - Integer, default 0
- `category_id` - Foreign key to categories
- `image_url` - URL to item image
- `created_at` - Timestamp

**cart_items Table:**
- `id` - Primary key
- `user_id` - Foreign key to users
- `item_id` - Foreign key to items
- `quantity` - Integer, default 1
- `created_at` - Timestamp
- `updated_at` - Auto-updates on change
- Unique constraint on (user_id, item_id) - prevents duplicate cart entries

**orders Table:**
- `id` - Primary key
- `user_id` - Foreign key to users
- `order_date` - Timestamp
- `total_amount` - Decimal(10,2)
- `status` - VARCHAR(50), default 'Pending'
- `tracking_id` - Unique, format: CA-timestamp-UUID
- `created_at` - Timestamp

**order_items Table:**
- `id` - Primary key
- `order_id` - Foreign key to orders
- `item_id` - Foreign key to items
- `quantity` - Integer
- `price` - Decimal(10,2) - stores price at time of order

**Why store price in order_items?**
- Item prices might change over time
- We want to preserve the price the user paid
- Historical accuracy for order records

### 4.3 Relationships

- One user → many cart items
- One user → many orders
- One category → many items
- One item → many cart items (different users)
- One item → many order items (different orders)
- One order → many order items

### 4.4 Constraints

- All foreign keys have CASCADE delete (if user deleted, their cart/orders are deleted)
- Unique constraint on `users.email` (one account per email)
- Unique constraint on `categories.name`
- Unique constraint on `cart_items(user_id, item_id)` (one cart entry per user-item combo)
- Unique constraint on `orders.tracking_id`

---

## 5. API Documentation

### 5.1 Base URL

```
http://localhost:5000/api
```

### 5.2 Authentication

Protected endpoints need a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is sent automatically by the frontend (Axios interceptors handle this).

### 5.3 Endpoints

#### Authentication Endpoints

**POST /api/auth/register**

Register a new user.

Request:
```json
{
  "email": "user@gmail.com",
  "password": "password123"
}
```

Response (201):
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@gmail.com"
  }
}
```

Errors:
- 400: Email/password missing or user already exists
- 500: Server error

**POST /api/auth/login**

Login and get JWT token.

Request:
```json
{
  "email": "user@gmail.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@gmail.com"
  }
}
```

Errors:
- 400: Email/password missing
- 401: Invalid credentials
- 500: Server error

#### Items Endpoints

**GET /api/items/categories**

Get all categories. No auth required.

Response (200):
```json
[
  { "id": 1, "name": "All" },
  { "id": 2, "name": "Fruit" },
  { "id": 3, "name": "Vegetable" }
]
```

**GET /api/items**

Get all items, optionally filtered by category.

Query params:
- `category` (optional): Category ID

Example: `GET /api/items?category=2`

Response (200):
```json
[
  {
    "id": 1,
    "name": "Apple",
    "description": "Fresh red apples",
    "price": 50.00,
    "stock": 100,
    "category_id": 2,
    "image_url": "https://..."
  }
]
```

#### Cart Endpoints (Protected)

**GET /api/cart**

Get current user's cart. Requires auth.

Response (200):
```json
[
  {
    "id": 1,
    "item_id": 1,
    "quantity": 2,
    "name": "Apple",
    "price": 50.00,
    "stock": 100,
    "image_url": "https://..."
  }
]
```

**POST /api/cart**

Add item to cart. If item already exists, updates quantity.

Request:
```json
{
  "itemId": 1,
  "quantity": 2
}
```

Response (200):
```json
{
  "message": "Item added to cart successfully"
}
```

Errors:
- 400: Missing itemId/quantity or insufficient stock
- 404: Item not found
- 401: Not authenticated

**PUT /api/cart/:itemId**

Update cart item quantity.

Request:
```json
{
  "quantity": 3
}
```

**DELETE /api/cart/:itemId**

Remove item from cart.

#### Orders Endpoints (Protected)

**POST /api/orders/checkout**

Place order from cart. This is where the transaction magic happens.

Response (201):
```json
{
  "message": "Order placed successfully",
  "order": {
    "id": 1,
    "trackingId": "CA-1704067200000-ABC12345",
    "totalAmount": 150.00,
    "status": "Pending"
  }
}
```

Errors:
- 400: Cart is empty or items unavailable
- 401: Not authenticated
- 500: Server error

**GET /api/orders**

Get user's order history.

Response (200):
```json
[
  {
    "id": 1,
    "tracking_id": "CA-1704067200000-ABC12345",
    "total_amount": 150.00,
    "status": "Pending",
    "order_date": "2024-01-01T00:00:00.000Z"
  }
]
```

**GET /api/orders/:orderId**

Get detailed order information.

Response (200):
```json
{
  "id": 1,
  "tracking_id": "CA-1704067200000-ABC12345",
  "total_amount": 150.00,
  "status": "Pending",
  "items": [
    {
      "item_id": 1,
      "quantity": 2,
      "price": 50.00,
      "name": "Apple"
    }
  ]
}
```

---

## 6. How to Run

### 6.1 Prerequisites

You'll need:

1. **Node.js** (v14 or higher)
   - Download from https://nodejs.org/
   - Check version: `node --version`

2. **MySQL** (v5.7 or higher)
   - Download from https://dev.mysql.com/downloads/
   - Check version: `mysql --version`

3. **npm** (comes with Node.js)
   - Check version: `npm --version`

### 6.2 Database Setup

First, set up the database. You have two options:

**Option 1: Command Line**

```bash
mysql -u root -p < Backend/database/schema.sql
```

Enter your MySQL password when prompted.

**Option 2: MySQL Workbench**

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open `Backend/database/schema.sql`
4. Execute the entire script (Ctrl+Shift+Enter)

**Verify it worked:**

```sql
USE cafe_akasa;
SHOW TABLES;
```

You should see: users, categories, items, cart_items, orders, order_items

### 6.3 Backend Setup

1. **Navigate to Backend folder:**
```bash
cd Backend
```

2. **Install dependencies:**
```bash
npm install
```

This might take a minute. Grab a coffee.

3. **Create .env file** in the Backend directory:

Create a new file called `.env` (no extension) and add:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=cafe_akasa
JWT_SECRET=your_secret_key_here_change_in_production
NODE_ENV=development
```

**Important:** 
- Replace `your_mysql_password_here` with your actual MySQL password
- Replace `your_secret_key_here_change_in_production` with a random string (you can use `openssl rand -base64 32` or just make something up)

4. **Start the backend:**

For production:
```bash
npm start
```

For development (auto-reload on changes):
```bash
npm run dev
```

You should see: `Server is running on port 5000`

**Test it:**
Open http://localhost:5000/api/health in your browser. You should see:
```json
{"message":"Cafe Akasa API is running!"}
```

### 6.4 Frontend Setup

1. **Open a new terminal** (keep the backend running in the first terminal)

2. **Navigate to Frontend folder:**
```bash
cd Frontend
```

3. **Install dependencies:**
```bash
npm install
```



4. **Create .env file** in the Frontend directory:

Create a new file called `.env` and add:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Note:** If your backend is on a different port, update this URL.

5. **Start the frontend:**
```bash
npm start
```

This will:
- Start the dev server on http://localhost:3000
- Automatically open in your browser
- Hot-reload when you make changes

### 6.5 Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

### 6.6 Quick Start (TL;DR)

```bash
# Terminal 1: Set up database (one-time)
mysql -u root -p < Backend/database/schema.sql

# Terminal 2: Backend
cd Backend
npm install
# Create .env file with your MySQL credentials
npm start

# Terminal 3: Frontend
cd Frontend
npm install
# Create .env file with API URL
npm start
```

---

## 7. Configuration

### 7.1 Backend Environment Variables

Create `.env` file in `Backend/` directory:

| Variable | What it does | Example |
|----------|--------------|---------|
| PORT | Server port | 5000 |
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | your_password |
| DB_NAME | Database name | cafe_akasa |
| JWT_SECRET | Secret for JWT tokens | any_random_string |
| NODE_ENV | Environment | development |

### 7.2 Frontend Environment Variables

Create `.env` file in `Frontend/` directory:

| Variable | What it does | Example |
|----------|--------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:5000/api |

**Important:** React environment variables MUST start with `REACT_APP_` to work. This is a Create React App thing.

### 7.3 Database Configuration

Database connection is configured in `Backend/src/config/database.js`:

- Connection pool: 10 connections
- Queue limit: Unlimited
- Wait for connections: Enabled

You probably don't need to change this unless you're expecting high traffic.

### 7.4 CORS Configuration

Currently set to allow all origins (for development). This is fine for local dev.

**For production**, update `Backend/src/server.js`:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

## 8. Security Features

### 8.1 Password Security

- Passwords are hashed with bcryptjs
- Salt rounds: 10 (good balance between security and performance)
- Only hashed passwords stored in database
- Never store plain text passwords (obviously)

### 8.2 Authentication

- JWT tokens for stateless auth
- Token expiration: 2 days (you can change this)
- Tokens stored in localStorage (frontend)
- Token validation on protected routes
- Auto-logout when token expires

### 8.3 API Security

- Protected routes require auth middleware
- Token extracted from Authorization header
- Error messages don't leak sensitive info
- Input validation on all endpoints

### 8.4 Database Security

- Parameterized queries (prevents SQL injection)
- Foreign key constraints (data integrity)
- Cascade deletes (cleanup)
- Unique constraints (prevents duplicates)

### 8.5 Frontend Security

- Axios interceptors handle tokens automatically
- Auto-redirect on 401 errors
- React escapes user input (XSS prevention)
- Ready for HTTPS (just need SSL cert)

### 8.6 Security Best Practices

What I implemented:
- Password hashing with bcrypt
- JWT token-based auth
- Protected API routes
- Input validation
- SQL injection prevention
- Parameterized queries
- CORS configuration
- Secure error handling

### 8.7 Production Security Recommendations

Before deploying to production, consider:

1. Use HTTPS (SSL/TLS certificates)
2. Use a strong, random JWT_SECRET (not "your_secret_key_here")
3. Add rate limiting on auth endpoints (prevent brute force)
4. Never commit .env files (add to .gitignore)
5. Limit CORS to specific domains
6. Add input sanitization middleware
7. Use Helmet.js for security headers
8. Consider refresh tokens (better security)
9. Enforce strong password requirements
10. Log security events

---

## 9. Troubleshooting

### 9.1 Common Issues

**Database Connection Error**

Error: `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Fix:**
- Make sure MySQL is running: `mysql -u root -p`
- Check your `.env` file credentials
- Verify database exists: `SHOW DATABASES;`
- Check MySQL port (default is 3306)

**Port Already in Use**

Error: `Error: listen EADDRINUSE: address already in use :::5000`

**Fix:**
- Change PORT in Backend `.env` file
- Update `REACT_APP_API_URL` in Frontend `.env` to match
- Or kill the process using the port:
  - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`
  - Linux/Mac: `lsof -ti:5000 | xargs kill`

**CORS Issues**

Error: `Access to XMLHttpRequest has been blocked by CORS policy`

**Fix:**
- Make sure backend CORS is enabled (it should be)
- Check `REACT_APP_API_URL` matches backend URL exactly
- For production, configure specific CORS origins

**JWT Token Errors**

Error: `Token is not valid` or `No token, authorization denied`

**Fix:**
- Check token is being sent in Authorization header
- Verify JWT_SECRET matches (check both .env files)
- Token might be expired (2 days default)
- Clear localStorage and login again

**Module Not Found**

Error: `Cannot find module 'xyz'`

**Fix:**
- Run `npm install` in Backend or Frontend directory
- If that doesn't work, delete `node_modules` and `package-lock.json`, then `npm install` again
- Make sure Node.js version is v14 or higher

**Database Schema Errors**

Error: `Table 'cafe_akasa.users' doesn't exist`

**Fix:**
- Run the schema file again: `mysql -u root -p < Backend/database/schema.sql`
- Check database name in `.env` matches schema
- Make sure MySQL user has CREATE privileges

**Environment Variables Not Loading**

Error: `undefined` for environment variables

**Fix:**
- Check `.env` file is in the correct directory
- Frontend variables must start with `REACT_APP_`
- Restart dev server after changing `.env`
- Check for typos in variable names

### 9.2 Debugging Tips

1. **Backend:** Check console output for error messages
2. **Frontend:** Open browser DevTools (F12) and check Console tab
3. **Network:** Check Network tab in DevTools to see API requests/responses
4. **Database:** Enable query logging in MySQL if needed
5. **Tokens:** Decode JWT tokens at https://jwt.io to see what's inside

### 9.3 Still Having Issues?

If nothing above helps:
1. Check error messages in console/logs (they usually tell you what's wrong)
2. Verify all prerequisites are installed correctly
3. Double-check all environment variables are set correctly
4. Make sure database connection works: `mysql -u root -p`
5. Review this documentation again (sometimes you miss something)

---

## 10. Future Improvements

If I had more time, here are some features and improvements I'd consider:

### 10.1 Admin Panel

**Why:** Currently there's no way to manage items, categories, or orders through the UI.

**What I'd add:**
- Admin dashboard for managing inventory
- Add/edit/delete items and categories
- View and update order status
- User management (if needed)
- Sales analytics and reports

**Implementation:**
- Separate admin routes and middleware
- Admin role in users table
- Admin-only API endpoints
- React admin dashboard



### 10.3 Payment Integration

**Why:** Currently orders are placed but there's no payment processing.

**What I'd add:**
- Payment gateway integration (Stripe, Razorpay, etc.)
- Multiple payment methods
- Payment status tracking
- Order confirmation emails

**Implementation:**
- Payment API endpoints
- Webhook handling for payment callbacks
- Update order status based on payment
- Email service integration

### 10.4 Order Status Updates

**Why:** Orders just show "Pending" or "Delivered", no intermediate states.

**What I'd add:**
- Order status workflow (Pending → Confirmed → Preparing → Out for Delivery → Delivered)
- Real-time status updates (WebSockets or polling)
- Email/SMS notifications for status changes
- Estimated delivery time

**Implementation:**
- Status enum in orders table
- WebSocket server for real-time updates
- Notification service (email/SMS)
- Status update endpoints

### 10.5 User Profile Management

**Why:** Users can only register/login, no profile management.

**What I'd add:**
- User profile page (name, phone, address)
- Delivery address management
- Order preferences
- Password change functionality

**Implementation:**
- Update users table with profile fields
- Profile API endpoints
- Profile page component
- Address management

### 10.6 Reviews and Ratings

**Why:** No way for users to review items or orders.

**What I'd add:**
- Item reviews and ratings
- Order reviews
- Average rating display
- Review moderation (admin)

**Implementation:**
- Reviews table linked to items/orders
- Rating calculation
- Review API endpoints
- Review components in frontend



### 10.8 Performance Optimizations

**Why:** Could be faster with some optimizations.

**What I'd add:**
- Database indexing on frequently queried columns
- API response caching (Redis)
- Image lazy loading
- Code splitting in React
- Pagination for items/orders

**Implementation:**
- Add indexes to database schema
- Redis for caching
- React lazy loading
- Pagination in API endpoints




### 10.11 Mobile Responsiveness

**Why:** While it works on mobile, could be better optimized.

**What I'd add:**
- Better mobile UI/UX
- Touch-friendly interactions
- Mobile-first design improvements
- PWA support (offline capability)

**Implementation:**
- Responsive CSS improvements
- Touch event handlers
- Service worker for PWA
- Mobile testing

### 10.12 Analytics

**Why:** No way to track user behavior or sales.

**What I'd add:**
- User analytics (page views, clicks)
- Sales analytics (revenue, popular items)
- Order analytics (average order value, trends)
- Admin dashboard with charts

**Implementation:**
- Analytics tracking (Google Analytics or custom)
- Analytics API endpoints
- Chart library (Chart.js, Recharts)
- Analytics dashboard

### Priority Order

If I had to prioritize, I'd focus on:
1. **Admin Panel** - Essential for managing the app
2. **Payment Integration** - Critical for a real ordering system
3. **Search Functionality** - Improves user experience significantly
4. **Order Status Updates** - Important for user trust
5. **Testing** - Ensures reliability

The rest would be nice-to-haves depending on requirements.

---

## Project Structure

```
Cafe Akasa/
├── Backend/
│   ├── database/
│   │   └── schema.sql              # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # Database connection
│   │   ├── controllers/
│   │   │   ├── authController.js   # Auth logic
│   │   │   ├── cartController.js   # Cart operations
│   │   │   ├── itemController.js   # Item operations
│   │   │   └── orderController.js  # Order operations
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT auth middleware
│   │   ├── routes/
│   │   │   ├── auth.js             # Auth routes
│   │   │   ├── cart.js             # Cart routes
│   │   │   ├── items.js            # Item routes
│   │   │   └── orders.js           # Order routes
│   │   └── server.js               # Express server
│   ├── package.json
│   └── .env                         # Environment variables (create this)
├── Frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   ├── pages/                  # Page components
│   │   ├── context/                # React Context
│   │   ├── services/               # API calls
│   │   ├── utils/                  # Utilities
│   │   ├── App.jsx                 # Main app
│   │   └── index.js                # Entry point
│   ├── package.json
│   └── .env                         # Environment variables (create this)
├── README.md
└── DOCUMENTATION.md                 # This file
```

---

