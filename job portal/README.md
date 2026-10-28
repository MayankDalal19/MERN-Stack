# CareerNest Job Portal

A full-stack, role-tailored job application portal built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend). Supports **Applicant**, **Recruiter**, and **Admin** workspaces with high-fidelity, responsive UI conforming to CareerNest design tokens.

---

## Features

1. **Find Your Next Opportunity (`/jobs`)**: Filter open roles by keyword (title, company, skill), location, and employment type. Features company logo tile initials, timestamps, and applicant "Viewed" tracking badges.
2. **Job Details (`/jobs/:id`)**: Comprehensive role breakdown with skill tags and company details.
3. **"Make Your Move" Application Panel**: In-place expanding application drawer with client-side file type (PDF, DOC, DOCX) and size (max 5 MB) validation, duplicate check prevention, and real-time status.
4. **Recruiter Job Management (`/recruiter/jobs`)**: Side-by-side two-card layout to post new jobs and view live candidate submissions per role with inline status updater (`submitted`, `reviewing`, `shortlisted`, `rejected`, `hired`).
5. **Edit Job Post (`/recruiter/jobs/:id/edit`)**: Pre-populated job editor with cancellation link and active outline indication.
6. **Profile Workspace (`/profile`)**: Manage personal details with optional profile avatar upload (max 2 MB) that synchronizes across the application header.
7. **Workspace Dashboard (`/dashboard`)**: Role-specific dashboard displaying applicant application history and recruiter opening summaries.

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** running locally on `localhost:27017` or a MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
# Copy environment configuration
cp .env.example .env

# Install dependencies
npm install

# Start backend development server (defaults to port 5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
# Copy environment configuration if needed
cp .env.example .env

# Install dependencies
npm install

# Start Vite dev server (defaults to http://localhost:5173)
npm run dev
```

---

## Route Directory

### Frontend Routes
| Route | Page | Access |
|---|---|---|
| `/` | `HomePage` | Public |
| `/jobs` | `JobsPage` (Find your next opportunity) | Public |
| `/jobs/:id` | `JobDetailPage` + Make your move panel | Public (Apply requires login) |
| `/recruiter/jobs` | `RecruiterJobsPage` (Post a new role) | Recruiter, Admin |
| `/recruiter/jobs/:id/edit` | `RecruiterJobsPage` (Edit job post) | Recruiter, Admin |
| `/profile` | `ProfilePage` (Personal details) | Authenticated |
| `/dashboard` | `DashboardPage` (Workspaces) | Authenticated |
| `/login` | `AuthPage` (Sign in) | Public |
| `/register` | `AuthPage` (Create account) | Public |
| `*` | `NotFoundPage` (404 Error page) | Public |

### Backend API Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create applicant or recruiter account
- `POST /api/auth/login` - Authenticate user and issue JWT cookie
- `POST /api/auth/logout` - Clear session cookie
- `GET /api/auth/me` - Fetch authenticated user details and viewed jobs

#### Jobs (`/api/jobs`)
- `GET /api/jobs` - List open jobs with keyword, location, and type filters (Public)
- `GET /api/jobs/mine` - List jobs created by current recruiter (Recruiter, Admin)
- `GET /api/jobs/:id` - Fetch single job detail (Public)
- `POST /api/jobs` - Create new job posting (Recruiter, Admin)
- `PATCH /api/jobs/:id` - Update job posting with owner authorization (Owner, Admin)
- `DELETE /api/jobs/:id` - Remove job posting with owner authorization (Owner, Admin)
- `POST /api/jobs/:id/view` - Mark job as viewed by applicant

#### Applications (`/api/applications`)
- `POST /api/applications` - Submit application with resume (Applicant)
- `GET /api/applications/me` - Fetch current applicant's applications (Applicant)
- `GET /api/applications/job/:jobId` - Fetch all applicants for a specific role (Recruiter, Admin)
- `PATCH /api/applications/:id/status` - Update application status (Recruiter, Admin)
- `GET /api/applications` - List applications (Filtered by role)

#### Profile & Users (`/api/users`)
- `GET /api/users/profile` - Fetch current user profile
- `PATCH /api/users/profile` - Update name, email, and upload avatar (Max 2 MB)

---

## Design Tokens

- **Page Background**: `#F6F4EF` (warm off-white)
- **Cards**: `#FDFCF8` with `#DEDBD1` border and 8px border-radius
- **Primary Accent**: `#234B3A` (deep green)
- **Sage Tint**: `#E6EEE8` (search bars, tags, and apply drawer)
- **Rust Brown**: `#9A5B35` (eyebrow headers, links)
- **Typography**: `Playfair Display` (headings), `DM Sans` (body and UI), `DM Mono` (eyebrows and badges)
