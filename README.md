# Cafe Akasa - Food Ordering Platform

A full-stack food ordering platform built with React for the frontend and Express/Node.js for the backend, using MySQL as the database.

## Features

- User Authentication: JWT-based authentication system
- Product Browsing: Browse items by category (Fruit, Vegetable, Non-veg, Breads, Beverages, Snacks)
- Shopping Cart: Persistent cart that syncs across devices
- Order Management: Place orders with real-time inventory validation
- Order Tracking: Unique tracking IDs for each order
- Order History: View past orders with detailed information

## Tech Stack

Backend:
- Node.js, Express.js
- MySQL
- JWT, bcryptjs

Frontend:
- React 18.2.0
- React Router DOM
- Axios

## Prerequisites

You'll need:
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm

## Detailed Setup Instructions

### Step 1: Install Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: Open terminal and run `node --version`
   - You should see something like: `v18.17.0`

2. **MySQL** (v5.7 or higher)
   - Download from: https://dev.mysql.com/downloads/
   - Verify installation: Run `mysql --version`
   - You should see something like: `mysql Ver 8.0.33`

3. **npm** (comes with Node.js)
   - Verify installation: Run `npm --version`
   - You should see something like: `9.6.7`

4. **Git** (optional, for cloning the repository)
   - Download from: https://git-scm.com/downloads

### Step 2: Database Setup

#### Option A: Using MySQL Command Line

1. Open your terminal/command prompt
2. Navigate to the project root directory
3. Run the following command:

```bash
mysql -u root -p < Backend/database/schema.sql
```

4. Enter your MySQL root password when prompted
5. The database `cafe_akasa` and all tables will be created automatically

#### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server (usually localhost:3306)
3. Click on "File" → "Open SQL Script"
4. Navigate to `Backend/database/schema.sql` and open it
5. Click the execute button (lightning bolt icon) or press `Ctrl+Shift+Enter`
6. Wait for the script to complete successfully

#### Verify Database Setup

To verify the database was created correctly, run:

```sql
USE cafe_akasa;
SHOW TABLES;
```

You should see 6 tables:
- users
- categories
- items
- cart_items
- orders
- order_items

### Step 3: Backend Setup

1. **Navigate to Backend directory:**

```bash
cd Backend
```

2. **Install dependencies:**

```bash
npm install
```

This will install all required packages:
- express
- mysql2
- jsonwebtoken
- bcryptjs
- dotenv
- cors
- nodemon (dev dependency)

Wait for the installation to complete (may take 1-2 minutes).

3. **Create `.env` file:**

Create a new file named `.env` (no extension) in the `Backend` directory.

**Windows:**
- Right-click in the Backend folder → New → Text Document
- Name it `.env` (remove .txt extension)
- If Windows doesn't allow `.env`, create it as `env.txt` then rename it

**Mac/Linux:**
```bash
touch .env
```

4. **Add environment variables to `.env`:**

Open the `.env` file and add the following:

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
- Replace `your_mysql_password_here` with your actual MySQL root password
- Replace `your_secret_key_here_change_in_production` with a random string (e.g., `mySecretKey123!@#` or use `openssl rand -base64 32`)

**Example `.env` file:**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mypassword123
DB_NAME=cafe_akasa
JWT_SECRET=mySecretJWTKey2024!@#
NODE_ENV=development
```

5. **Start the backend server:**

For production mode:
```bash
npm start
```

For development mode (with auto-reload):
```bash
npm run dev
```

You should see output like:
```
Server is running on port 5000
Testing database connection...
Database connection successful!
Health check: http://localhost:5000/api/health
API base URL: http://localhost:5000/api
Waiting for requests...
```

6. **Test the backend:**

Open your browser and visit: `http://localhost:5000/api/health`

You should see:
```json
{"message":"Cafe Akasa API is running!"}
```

If you see this, the backend is running correctly!

**Keep this terminal window open** - the backend needs to keep running.

### Step 4: Frontend Setup

1. **Open a new terminal window** (keep the backend terminal running)

2. **Navigate to Frontend directory:**

```bash
cd Frontend
```

3. **Install dependencies:**

```bash
npm install
```

This will install all required packages:
- react
- react-dom
- react-router-dom
- axios
- react-icons
- framer-motion
- react-scripts

Wait for the installation to complete (may take 2-3 minutes).

4. **Create `.env` file:**

Create a new file named `.env` in the `Frontend` directory.

5. **Add environment variables to `.env`:**

Open the `.env` file and add:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Important:** 
- React environment variables MUST start with `REACT_APP_` to work
- If your backend is running on a different port, update the URL accordingly
- No trailing slash at the end

**Example `.env` file:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

6. **Start the frontend development server:**

```bash
npm start
```

The React development server will:
- Start on `http://localhost:3000`
- Automatically open in your default browser
- Hot-reload when you make code changes

You should see output like:
```
Compiled successfully!

You can now view cafe-akasa-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000
```

### Step 5: Access the Application

Once both servers are running:

- **Frontend Application:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

### Step 6: First Time Usage

1. **Register a new account:**
   - Click on "Register" or navigate to `/register`
   - Enter your email (e.g., `user@example.com`)
   - Enter a password (minimum 6 characters)
   - Confirm your password
   - Click "Register"

2. **Login:**
   - After registration, you'll be automatically logged in
   - Or click "Login" and enter your credentials

3. **Browse and order:**
   - Browse items by category
   - Add items to cart
   - View cart and checkout
   - View order history

## Quick Start Summary

If you're familiar with the process, here's the quick version:

```bash
# Terminal 1: Database setup (one-time)
mysql -u root -p < Backend/database/schema.sql

# Terminal 2: Backend
cd Backend
npm install
# Create .env file with MySQL credentials
npm start

# Terminal 3: Frontend
cd Frontend
npm install
# Create .env file with API URL
npm start
```

## Running the Application

### Starting the Application

1. **Start MySQL** (if not running as a service)
   - Windows: Check Services or start MySQL from XAMPP/WAMP
   - Mac: `brew services start mysql`
   - Linux: `sudo systemctl start mysql`

2. **Start Backend** (Terminal 1):
   ```bash
   cd Backend
   npm start
   ```

3. **Start Frontend** (Terminal 2):
   ```bash
   cd Frontend
   npm start
   ```

### Stopping the Application

- **Backend:** Press `Ctrl+C` in the backend terminal
- **Frontend:** Press `Ctrl+C` in the frontend terminal

### Development vs Production

**Development Mode:**
- Backend: Use `npm run dev` for auto-reload on code changes
- Frontend: `npm start` automatically hot-reloads on changes
- Both show detailed error messages

**Production Mode:**
- Backend: Use `npm start` (no auto-reload)
- Frontend: Build with `npm run build`, then serve the `build` folder
- Set `NODE_ENV=production` in `.env` files

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Items
- GET /api/items/categories - Get all categories
- GET /api/items - Get all items
- GET /api/items?category=:categoryId - Get items by category

### Cart (Protected)
- GET /api/cart - Get user's cart
- POST /api/cart - Add item to cart
- PUT /api/cart/:itemId - Update cart item quantity
- DELETE /api/cart/:itemId - Remove item from cart

### Orders (Protected)
- POST /api/orders/checkout - Place order
- GET /api/orders - Get order history
- GET /api/orders/:orderId - Get order details

## Database Schema

The database has 6 main tables:
- users: User accounts
- categories: Food categories
- items: Food items with price and stock
- cart_items: User's shopping cart
- orders: Order records with tracking IDs
- order_items: Items in each order

## Usage

Here's how to use the app:
1. Register or login to create an account
2. Browse items by category
3. Add items to cart
4. Manage cart (update quantities, remove items)
5. Checkout to place order
6. View order history

## Project Structure

```
Cafe Akasa/
├── Backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/       # Auth middleware
│   │   ├── routes/           # API routes
│   │   └── server.js         # Express server
│   ├── database/
│   │   └── schema.sql        # Database schema
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React Context
│   │   ├── services/         # API calls
│   │   └── App.jsx           # Main app
│   └── package.json
├── README.md
└── DOCUMENTATION.md
```

## Security Features

The app includes:
- Password hashing with bcryptjs
- JWT token-based authentication
- Protected API routes
- SQL injection prevention
- Input validation

## Troubleshooting

Database Connection Error:
- Make sure MySQL is running
- Check your credentials in the `.env` file
- Verify the database `cafe_akasa` exists

Port Already in Use:
- Change the PORT in Backend `.env` file
- Update REACT_APP_API_URL in Frontend `.env` to match

CORS Issues:
- Backend CORS is configured for development
- For production, update CORS settings in Backend/src/server.js

## Future Improvements

Some features I'd like to add if I had more time:
- Admin panel for inventory management
- Payment gateway integration
- Search functionality
- Order status updates
- User profile management
- Reviews and ratings

## License

This project is created for interview/educational purposes.



