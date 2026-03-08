# Food Ordering Application (Slooze Assignment)

## 1. Project Overview
A full-stack, role-based food ordering platform built with a 3-tier architecture:
- **Frontend**: React.js (Vite) + Tailwind CSS + React Router v6
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Database**: PostgreSQL (Relational schema with country scoping)

The platform supports three distinct roles (ADMIN, MANAGER, MEMBER) and implements **Country-Based Scoping** — meaning non-admin users can only view restaurants and orders within their designated country (e.g. India vs America).

## 2. Tech Stack Setup
| Tier | Technology | Use Case |
|------|------------|----------|
| **Frontend** | React 18, Vite, TypeScript | Single Page Application (SPA) |
| **Styling** | Tailwind CSS, Lucide React | Utility-first CSS & Icons |
| **Backend** | NestJS (Node.js), TypeScript | REST API Architecture |
| **ORM** | TypeORM | Data modeling and database access |
| **Database** | PostgreSQL 15 | Relational data persistence |
| **Auth** | Passport JWT, bcrypt | Stateless Authentication & Hashing |

## 3. Prerequisites
- Node.js >= 18.x
- PostgreSQL >= 14.x (or Docker Desktop to use the included `docker-compose.yml`)
- npm or yarn

## 4. Environment Setup

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` root directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=food_ordering
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=24h
PORT=3001
```

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` root directory:
```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

## 5. Step-by-Step Run Instructions

### 5.1 Database Setup (Using Docker)
If you don't have local Postgres, start the included database container from the root directory:
```sh
docker-compose up -d
```

### 5.2 Backend Setup & Execution
Open a terminal and navigate to the backend folder:
```sh
cd backend
npm install
```

**Sync Database & Run Seed script:**
TypeORM is set to `synchronize: true` for development. Start the server once to create tables automatically, or just run the seed script directly which initializes TypeORM:
```sh
npm run build
npx ts-node src/database/seeds/seed.ts
```
*(You should see "Seeding complete & connection closed" in the console)*

**Start the NestJS API:**
```sh
npm run start:dev
```
*API runs at `http://localhost:3001/api/v1`*

### 5.3 Frontend Setup & Execution
Open a second terminal and navigate to the frontend folder:
```sh
cd frontend
npm install
```

**Start the Vite Dev Server:**
```sh
npm run dev
```
*App runs at `http://localhost:3000`*

## 6. Test Credentials (Seed Data)
| Name | Email | Password | Role | Country Scope |
|------|-------|----------|------|---------------|
| Nick Fury | `nick@shield.com` | `admin123` | **ADMIN** | **Global** (Any) |
| Captain Marvel | `marvel@shield.com` | `manager123` | **MANAGER** | India |
| Captain America | `america@shield.com` | `manager123` | **MANAGER** | America |
| Thanos | `thanos@shield.com` | `member123` | **MEMBER** | India |
| Thor | `thor@shield.com` | `member123` | **MEMBER** | India |
| Travis | `travis@shield.com` | `member123` | **MEMBER** | America |

## 7. RBAC & Country Scoping Matrix
- **Country Scoping**: All routes requesting `Restaurants`, `Menu Items`, or `Orders` automatically append a `countryId` SQL filter if the user is `MANAGER` or `MEMBER`.
- **Role Permissions**:

| Feature / Resource | ADMIN | MANAGER | MEMBER |
|--------------------|-------|---------|--------|
| View Restaurants | All | Own Country | Own Country|
| View Orders | All | Own Country | Own Orders |
| Add item to Cart | Yes | Yes | Yes |
| Place Order (Checkout)| Yes | Yes | **Hidden/Denied**|
| Cancel Order | Yes | Yes | **Hidden/Denied**|
| Manage Payments | Yes | Denied | Denied |

## 8. Directory Structure
```
food-ordering-app/
├── docker-compose.yml       # DB infrastructure
├── README.md                # Documentation
├── docs/
│   └── API_Collection.json  # Postman v2.1 exports
│
├── backend/                 # NestJS Application
│   ├── src/
│   │   ├── auth/            # JWT strategies & login 
│   │   ├── common/          # Global decorators & RBAC Guards
│   │   ├── database/        # TypeORM entities & seeding config
│   │   ├── orders/          # Draft, Places, Items functionality
│   │   ├── payments/        # Payment CRUD logic
│   │   ├── restaurants/     # Restaurants & Menus view layer
│   │   └── users/           # User Context
│   └── package.json
│
└── frontend/                # React.js (Vite) Application
    ├── src/
    │   ├── api/             # Axios REST client integrations
    │   ├── components/      # UI components & Loaders
    │   ├── context/         # React Context (Auth State Manager)
    │   ├── pages/           # Features (Restaurants, Detail, Orders, etc.)
    │   ├── router/          # AppRouter & Protected Route Logic
    │   └── types/           # TS Interfaces
    └── package.json
```
