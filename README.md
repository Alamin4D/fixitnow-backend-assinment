# FixItNow 🔧

**Your Trusted Home Service Platform**

A comprehensive backend API for a home services marketplace where customers can browse services, book technicians, make payments via Stripe, and leave reviews. Built with Node.js, Express, TypeScript, PostgreSQL, and Prisma.

## 🔗 Live Links

- **Backend Repo:** [GitHub Repository](https://github.com/Alamin4D/fixitnow-backend-assinment)
- **Live API:** [Live Server URL](https://fixitnow-backend-assinment.vercel.app/)
- **API Docs:** [Postman Documentation](file:///D:/next-level-web-development/fixitnow-backend-assinment/FixItNow%20API.postman_collection.json)
- **Demo Video:** [Video Link](https://drive.google.com/file/d/16oORT53-SonwT4ZvWL__aL9Cc3wfygiQ/view?usp=sharing)

## 👤 Admin Credentials
Email: admin@fixitnow.com
Password: admin123

text


## 🛠️ Tech Stack

| Technology   | Purpose              |
| ------------ | -------------------- |
| Node.js      | Runtime Environment  |
| Express.js   | Web Framework        |
| TypeScript   | Type Safety          |
| PostgreSQL   | Database             |
| Prisma       | ORM                  |
| JWT          | Authentication       |
| Stripe       | Payment Integration  |
| bcryptjs     | Password Hashing     |

## 📦 Features

### 🔐 Authentication
- User registration with role selection (Customer/Technician)
- JWT-based login with access token
- Protected routes with role-based access control
- Password hashing with bcrypt

### 👤 Customer Features
- Browse all services and technicians
- Search and filter by category, price, location, rating
- Book technicians for specific services and time slots
- Make payments via Stripe Checkout (redirect to Stripe payment page)
- View payment history and booking status
- Leave reviews after job completion
- Cancel bookings before work starts

### 🔧 Technician Features
- Create and update professional profile
- Set availability time slots
- Create, update, and delete services
- View incoming bookings
- Accept or decline bookings
- Mark jobs as in-progress or completed

### 🛡️ Admin Features
- View all users (customers and technicians)
- Ban/unban users
- View all bookings across the platform
- Manage service categories (CRUD)

### 💳 Payment Integration
- Stripe Checkout Session with redirect to payment page
- Payment verification after successful payment
- Direct payment via Payment Intent (for API testing)
- Payment history and transaction tracking
- Stripe Webhook for real-time payment status updates

### ⭐ Review System
- Customers can review after booking completion
- 1-5 star rating with optional comments
- Automatic technician rating recalculation

## 📊 Database Schema

### Models

| Model              | Description                                    |
| ------------------ | ---------------------------------------------- |
| User               | Stores user info, auth details, and role       |
| TechnicianProfile  | Technician-specific info (linked to User)      |
| Category           | Service categories (plumbing, electrical, etc) |
| Service            | Specific services offered by technicians       |
| Availability       | Technician availability time slots             |
| Booking            | Job bookings between customers and technicians |
| Payment            | Payment transactions with Stripe               |
| Review             | Customer reviews for technicians               |

### Booking Status Flow
REQUESTED → ACCEPTED → PAID → IN_PROGRESS → COMPLETED
↓ ↓
DECLINED CANCELLED

text


## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account (for payment integration)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/fixitnow-backend.git
cd fixitnow-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start development server
npm run dev