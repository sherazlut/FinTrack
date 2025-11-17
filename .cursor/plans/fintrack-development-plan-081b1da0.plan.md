<!-- 081b1da0-207d-426a-8789-b7c4156145cc cfc25628-0b4d-4357-b5c2-8af02a543d4c -->
# FinTrack Development Plan

## Project Overview

FinTrack is a full-stack personal finance management application that helps users track income, expenses, set budgets, and visualize spending patterns through charts and analytics.

## Technology Stack

- **Frontend**: React.js, Chart.js, React Router, Zustand (state management)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt for password hashing
- **Additional**: Axios for API calls, dotenv for environment variables

## Project Structure

```
fintrack/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Transaction.js
│   │   │   └── Budget.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── transactions.js
│   │   │   ├── budgets.js
│   │   │   └── categories.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── transactionController.js
│   │   │   ├── budgetController.js
│   │   │   └── categoryController.js
│   │   ├── utils/
│   │   │   └── validators.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── transactions/
│   │   │   │   ├── TransactionForm.jsx
│   │   │   │   ├── TransactionList.jsx
│   │   │   │   └── TransactionItem.jsx
│   │   │   ├── budgets/
│   │   │   │   ├── BudgetForm.jsx
│   │   │   │   ├── BudgetList.jsx
│   │   │   │   └── BudgetProgress.jsx
│   │   │   ├── charts/
│   │   │   │   ├── ExpenseChart.jsx
│   │   │   │   ├── CategoryChart.jsx
│   │   │   │   └── BudgetChart.jsx
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── FilterBar.jsx
│   │   │   └── dashboard/
│   │   │       └── Dashboard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── index.css
│   ├── package.json
│   └── public/
├── .gitignore
└── README.md
```

## Implementation Phases

### Phase 1: Project Setup & Backend Foundation

1. Initialize backend project with Express.js
2. Set up MongoDB connection and configuration
3. Create database models (User, Transaction, Budget)
4. Set up environment variables and configuration files
5. Create basic Express server with middleware setup

### Phase 2: Authentication System

1. Implement user registration with password hashing (bcrypt)
2. Implement user login with JWT token generation
3. Create authentication middleware for protected routes
4. Set up password validation and error handling
5. Create auth routes and controllers

### Phase 3: Transaction Management API

1. Create transaction CRUD endpoints (Create, Read, Update, Delete)
2. Implement transaction filtering (by date, category, type)
3. Add transaction validation and error handling
4. Create category management endpoints
5. Implement transaction history with pagination

### Phase 4: Budget Management API

1. Create budget CRUD endpoints
2. Implement budget progress calculation logic
3. Add budget validation (monthly limits, category budgets)
4. Create endpoints for budget analytics
5. Implement recurring bill reminders logic

### Phase 5: Frontend Setup & Authentication UI

1. Initialize React project with Vite or Create React App
2. Set up React Router for navigation
3. Install and configure Chart.js
4. Create authentication context and API service layer
5. Build Login and Register components with form validation
6. Implement protected route wrapper

### Phase 6: Transaction Management UI

1. Create transaction form component (income/expense)
2. Build transaction list with filtering capabilities
3. Implement transaction edit and delete functionality
4. Add category selection and management UI
5. Create transaction history with date filters

### Phase 7: Budget Management UI

1. Create budget form component
2. Build budget list and display component
3. Implement budget progress indicators
4. Add visual budget tracking with progress bars
5. Create budget alerts and notifications

### Phase 8: Analytics & Charts

1. Integrate Chart.js for data visualization
2. Create expense pie chart by category
3. Build spending trend bar chart (monthly/weekly)
4. Implement budget vs actual comparison chart
5. Create dashboard with summary statistics

### Phase 9: Additional Features

1. Implement recurring bill reminders UI
2. Add transaction export functionality (optional)
3. Create responsive design for mobile devices
4. Add loading states and error handling throughout
5. Implement search functionality for transactions

### Phase 10: Testing & Deployment

1. Test all API endpoints
2. Test frontend components and user flows
3. Set up MongoDB Atlas connection
4. Deploy backend to hosting service (Heroku/Railway/Render)
5. Deploy frontend to hosting service (Vercel/Netlify)
6. Update environment variables for production

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String (enum: ['income', 'expense'], required),
  amount: Number (required, min: 0),
  category: String (required),
  description: String,
  date: Date (required, default: Date.now),
  createdAt: Date,
  updatedAt: Date
}
```

### Budget Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  category: String (required),
  monthlyLimit: Number (required, min: 0),
  month: Number (1-12, required),
  year: Number (required),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Transactions

- `GET /api/transactions` - Get all user transactions (with filters)
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get single transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get transaction summary/analytics

### Budgets

- `GET /api/budgets` - Get all user budgets
- `POST /api/budgets` - Create new budget
- `GET /api/budgets/:id` - Get single budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/progress` - Get budget progress for current month

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create custom category (optional)

## Key Features Implementation Details

### Authentication Flow

- User registers with username, email, and password
- Password is hashed using bcrypt before storing
- On login, JWT token is generated and sent to client
- Token is stored in localStorage or httpOnly cookie
- Protected routes verify token on each request

### Transaction Management

- Users can add income or expense transactions
- Each transaction requires: type, amount, category, date
- Transactions can be filtered by date range, category, type
- Transaction history shows all past transactions with pagination

### Budget Tracking

- Users set monthly budget limits per category
- System calculates current month spending per category
- Progress indicators show percentage of budget used
- Alerts when budget is approaching or exceeded

### Analytics & Charts

- Pie chart: Expense distribution by category
- Bar chart: Monthly spending trends
- Line chart: Budget vs actual spending comparison
- Dashboard shows: total income, total expenses, net balance, top spending categories

## Environment Variables

### Backend (.env)

```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Success Criteria

- User can register and log in securely
- User can add, edit, and delete transactions
- Transactions can be categorized
- User can set monthly budgets per category
- User can view spending patterns through charts
- Budget progress is tracked and displayed in real-time
- Application is responsive and works on mobile devices