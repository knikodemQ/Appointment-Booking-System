# Medical Appointment Booking System

A comprehensive web application for managing medical appointments with multi-database support including JSON Server, Firebase, and MongoDB. Built with Angular 19 and modern web technologies.

[![Angular](https://img.shields.io/badge/Angular-19.x-red?style=for-the-badge&logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?style=for-the-badge&logo=bootstrap)](https://getbootstrap.com/)
[![Firebase](https://img.shields.io/badge/Firebase-11.x-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)

## Overview

The Medical Appointment Booking System is a modern, full-stack web application designed to streamline the process of scheduling and managing medical appointments. The system supports multiple data sources and provides comprehensive functionality for both healthcare providers and patients.

### Key Highlights:
- **Multi-Database Architecture**: Seamlessly switch between JSON Server, Firebase, and MongoDB
- **Role-Based Access**: Separate interfaces for doctors, patients, and administrators
- **Real-Time Updates**: Live synchronization across all connected clients
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI/UX**: Google Calendar-inspired design with intuitive navigation

## Features

###  For Healthcare Providers:
- **Professional Registration**: Complete doctor profile setup with specializations
- **Availability Management**: Define working hours, time slots, and schedules
- **Absence Tracking**: Manage vacations, sick days, and other unavailable periods
- **Appointment Overview**: Comprehensive dashboard for managing patient visits
- **Calendar Integration**: Google Calendar-style interface for easy scheduling

### For Patients:
- **Easy Registration**: Quick and secure patient account creation
- **Doctor Discovery**: Browse healthcare providers by specialization
- **Appointment Booking**: Intuitive booking system with real-time availability
- **Appointment History**: Track past and upcoming medical visits
- **Shopping Cart**: Multi-appointment booking with basket functionality

###  For Administrators:
- **Data Source Management**: Switch between different database backends
- **User Management**: Complete CRUD operations for all user types
- **System Monitoring**: Real-time database connection status

## Technology Stack

### Frontend Technologies:
- **Angular 19**: Modern web framework with TypeScript support
- **TypeScript 5.x**: Type-safe JavaScript with advanced features
- **Bootstrap 5.3**: Responsive CSS framework with modern components
- **RxJS**: Reactive programming with observables
- **Angular Fire**: Official Angular library for Firebase integration
- **CSS3**: Modern styling with flexbox and grid layouts

### Backend Technologies:
- **Node.js 18+**: JavaScript runtime for server-side applications
- **Express 5.x**: Fast, minimalist web framework
- **MongoDB 8.x**: NoSQL database with flexible document storage
- **Mongoose**: MongoDB object modeling for Node.js
- **JSON Server**: Mock REST API for development
- **Firebase**: Google's cloud platform for real-time applications

### Development Tools:
- **Angular CLI 19.x**: Command-line interface for Angular development
- **Webpack**: Module bundler for JavaScript applications
- **Karma & Jasmine**: Testing framework for Angular applications
- **ESLint**: Code linting and quality assurance
- **Prettier**: Code formatting and style consistency

##  Project Structure

```
appointment-booking-app/
├── 📂 src/                          # Angular source code
│   ├── 📂 app/                      # Main application module
│   │   ├── 📄 app.component.ts      # Root component
│   │   ├── 📄 app.component.html    # Root template
│   │   ├── 📄 app.component.css     # Root styles
│   │   ├── 📄 app.config.ts         # Application configuration
│   │   ├── 📄 app.routes.ts         # Routing configuration
│   │   │
│   │   ├── 📂 basket/               # Shopping cart functionality
│   │   │   ├── 📄 basket.component.ts
│   │   │   ├── 📄 basket.component.html
│   │   │   └── 📄 basket.component.css
│   │   │
│   │   ├── 📂 data-source-selector/ # Database management interface
│   │   │   ├── 📄 data-source-selector.component.ts
│   │   │   ├── 📄 data-source-selector.component.html
│   │   │   └── 📄 data-source-selector.component.css
│   │   │
│   │   ├── 📂 define-absence/       # Doctor absence management
│   │   │   ├── 📄 define-absence.component.ts
│   │   │   ├── 📄 define-absence.component.html
│   │   │   └── 📄 define-absence.component.css
│   │   │
│   │   ├── 📂 define-availability/  # Doctor availability setup
│   │   │   ├── 📄 define-availability.component.ts
│   │   │   ├── 📄 define-availability.component.html
│   │   │   └── 📄 define-availability.component.css
│   │   │
│   │   ├── 📂 doctor-list/          # Healthcare provider directory
│   │   │   ├── 📄 doctor-list.component.ts
│   │   │   ├── 📄 doctor-list.component.html
│   │   │   └── 📄 doctor-list.component.css
│   │   │
│   │   ├── 📂 home/                 # Landing page component
│   │   │   ├── 📄 home.component.ts
│   │   │   ├── 📄 home.component.html
│   │   │   └── 📄 home.component.css
│   │   │
│   │   ├── 📂 kalendarz/            # Main calendar view
│   │   │   ├── 📄 kalendarz.component.ts
│   │   │   ├── 📄 kalendarz.component.html
│   │   │   └── 📄 kalendarz.component.css
│   │   │
│   │   ├── 📂 login/                # Authentication component
│   │   │   ├── 📄 login.component.ts
│   │   │   ├── 📄 login.component.html
│   │   │   └── 📄 login.component.css
│   │   │
│   │   ├── 📂 pacjent-form/         # Patient form component
│   │   │   ├── 📄 pacjent-form.component.ts
│   │   │   ├── 📄 pacjent-form.component.html
│   │   │   └── 📄 pacjent-form.component.css
│   │   │
│   │   ├── persistence-selector/ # Data persistence options
│   │   │   ├── 📄 persistence-selector.component.ts
│   │   │   ├── 📄 persistence-selector.component.html
│   │   │   └── 📄 persistence-selector.component.css
│   │   │
│   │   ├── 📂  register/             # Patient registration
│   │   │   ├── 📄 register.component.ts
│   │   │   ├── 📄 register.component.html
│   │   │   └── 📄 register.component.css
│   │   │
│   │   ├── 📂 register-doctor/      # Doctor registration
│   │   │   ├── 📄 register-doctor.component.ts
│   │   │   ├── 📄 register-doctor.component.html
│   │   │   └── 📄 register-doctor.component.css
│   │   │
│   │   ├── 📂 terminarz-lekarza/    # Doctor's schedule view
│   │   │   ├── 📄 terminarz-lekarza.component.ts
│   │   │   ├── 📄 terminarz-lekarza.component.html
│   │   │   └── 📄 terminarz-lekarza.component.css
│   │   │
│   │   ├── 📂 services/             # Business logic and API calls
│   │   │   ├── 📄 absence.service.ts         # Absence management
│   │   │   ├── 📄 appointment.service.ts     # Appointment operations
│   │   │   ├── 📄 auth.service.ts            # Authentication service
│   │   │   ├── 📄 availability.service.ts    # Availability management
│   │   │   ├── 📄 basket.service.ts          # Shopping cart service
│   │   │   ├── 📄 calendar.service.ts        # Calendar operations
│   │   │   ├── 📄 mongo.service.ts           # MongoDB operations
│   │   │   ├── 📄 pacjent-form.service.ts    # Patient form service
│   │   │   └── 📄 patient.service.ts         # Patient operations
│   │   │
│   │   ├── 📂 models/               # TypeScript interfaces
│   │   │   ├── 📄 absence.model.ts           # Absence data structure
│   │   │   ├── 📄 appointment.model.ts       # Appointment data structure
│   │   │   ├── 📄 availability.model.ts      # Availability data structure
│   │   │   └── 📄 user.model.ts              # User data structure
│   │   │
│   │   └── 📂 guards/               # Route protection
│   │       ├── 📄 auth.guard.ts              # Authentication guard
│   │       └── 📄 auth.guard.spec.ts         # Guard tests
│   │
│   ├── 📂 assets/                   # Static resources
│   │   └── 📂 images/               # Application images
│   │
│   ├── 📂 environments/             # Environment configurations
│   │   ├── 📄 environment.ts        # Development settings
│   │   └── 📄 environment.prod.ts   # Production settings
│   │
│   ├── 📄 index.html                # Main HTML template
│   ├── 📄 main.ts                   # Application bootstrap
│   └── 📄 styles.css                # Global styles
│
├── 📂 scripts/                      # Backend server scripts
│   ├── 📄 server.js                 # JSON Server configuration
│   ├── 📄 mongo-server.js           # MongoDB Express server
│   ├── 📄 migrate-data.js           # Data migration utilities
│   │
│   ├── 📂 routes/                   # MongoDB API routes
│   │   ├── 📄 absences.js           # Absence endpoints
│   │   ├── 📄 appointments.js       # Appointment endpoints
│   │   ├── 📄 availability.js       # Availability endpoints
│   │   └── 📄 users.js              # User endpoints
│   │
│   └── 📂 models/                   # MongoDB Mongoose models
│       ├── 📄 Absence.js            # Absence schema
│       ├── 📄 Appointment.js        # Appointment schema
│       ├── 📄 Availability.js       # Availability schema
│       └── 📄 User.js               # User schema
│
├── 📂 data/                         # Local development data
│   └── 📄 data.json                 # JSON Server database
│
├── 📂 public/                       # Static public files
│   └── 📄 favicon.ico               # Application icon
│
├── 📂 docs/                         # Project documentation
├── 📂 images_docs/                  # Documentation images
├── 📂 config/                       # Configuration files
├── 📂 dist/                         # Production build output
│
├── 📄 package.json                  # Node.js dependencies and scripts
├── 📄 package-lock.json             # Dependency lock file
├── 📄 angular.json                  # Angular CLI configuration
├── 📄 tsconfig.json                 # TypeScript configuration
└── 📄 README.md                     # Project documentation
```

##  Installation & Setup

### Prerequisites:
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm 9+** - Comes with Node.js
- **MongoDB Community Server** - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

### Step-by-Step Installation:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/appointment-booking-system.git
cd appointment-booking-system

# 2. Install dependencies
npm install

# 3. Start MongoDB (if using MongoDB option)
# Windows:
net start MongoDB
# macOS/Linux:
sudo systemctl start mongod

# 4. Choose your development setup:

# Option A: Angular + JSON Server (Recommended for development)
npm run dev

# Option B: Run services separately
# Terminal 1: Angular Development Server
ng serve

# Terminal 2: JSON Server (Port 3000)
node scripts/server.js

# Terminal 3: MongoDB Server (Port 3001)
node scripts/mongo-server.js
```

### Access Points:
- **Frontend Application**: http://localhost:4200/
- **JSON Server API**: http://localhost:3000/
- **MongoDB API**: http://localhost:3001/api/
- **Firebase**: Integrated within the application



## Database Support

The application supports three different database backends:

### 1. JSON Server (Development)
- **Purpose**: Local development and testing
- **Port**: 3000
- **Features**: File-based storage, REST API, automatic ID generation
- **Best for**: Quick prototyping and development

### 2. Firebase (Cloud Production)
- **Purpose**: Production deployment with real-time features
- **Features**: Real-time database, authentication, hosting
- **Best for**: Production applications with real-time requirements

### 3.  MongoDB (Scalable Production)
- **Purpose**: Scalable production deployment
- **Port**: 3001
- **Features**: Document-based storage, advanced querying, high performance
- **Best for**: Large-scale applications with complex data relationships

## API Endpoints

### JSON Server Endpoints (Port 3000):
```http
GET    /users                    # Get all users
POST   /users                    # Create new user
GET    /users/:id                # Get user by ID
PUT    /users/:id                # Update user
DELETE /users/:id                # Delete user

GET    /appointments             # Get all appointments
POST   /appointments             # Create appointment
GET    /appointments/:id         # Get appointment by ID
PUT    /appointments/:id         # Update appointment
DELETE /appointments/:id         # Delete appointment

GET    /availability             # Get all availability records
POST   /availability             # Create availability
GET    /availability/:id         # Get availability by ID
PUT    /availability/:id         # Update availability
DELETE /availability/:id         # Delete availability

GET    /absences                 # Get all absences
POST   /absences                 # Create absence
GET    /absences/:id             # Get absence by ID
PUT    /absences/:id             # Update absence
DELETE /absences/:id             # Delete absence
```

### MongoDB API Endpoints (Port 3001):
```http
GET    /api/users                # Get all users
POST   /api/users                # Create new user
GET    /api/users/:id            # Get user by ID
PUT    /api/users/:id            # Update user
DELETE /api/users/:id            # Delete user

GET    /api/appointments         # Get all appointments
POST   /api/appointments         # Create appointment
GET    /api/appointments/:id     # Get appointment by ID
PUT    /api/appointments/:id     # Update appointment
DELETE /api/appointments/:id     # Delete appointment

GET    /api/availability         # Get all availability records
POST   /api/availability         # Create availability
GET    /api/availability/:id     # Get availability by ID
PUT    /api/availability/:id     # Update availability
DELETE /api/availability/:id     # Delete availability

GET    /api/absences             # Get all absences
POST   /api/absences             # Create absence
GET    /api/absences/:id         # Get absence by ID
PUT    /api/absences/:id         # Update absence
DELETE /api/absences/:id         # Delete absence

GET    /api/test                 # Health check endpoint
```

##  Database Schema

### User Model:
```typescript
interface User {
  _id?: string;           // MongoDB ObjectId
  uid?: string;           // Firebase UID
  id?: number;            // JSON Server ID
  firstName: string;      // User's first name
  lastName: string;       // User's last name
  email: string;          // Email address (unique)
  isDoctor: boolean;      // Role flag (doctor/patient)
  gender: 'M' | 'F';     // Gender
  age: number;            // Age in years
  specialization?: string; // Doctor's specialization
  admin: boolean;         // Admin privileges flag
  createdAt?: Date;       // Account creation timestamp
  updatedAt?: Date;       // Last update timestamp
}
```

### Appointment Model:
```typescript
interface Appointment {
  _id?: string;           // MongoDB ObjectId
  uid?: string;           // Firebase UID
  id?: number;            // JSON Server ID
  doctorId: string;       // Reference to doctor
  patientId: string;      // Reference to patient
  type: string;           // Appointment type
  date: string;           // Appointment date (YYYY-MM-DD)
  time: string;           // Appointment time (HH:MM)
  duration: number;       // Duration in minutes
  details?: string;       // Additional notes
  occurred: boolean;      // Appointment completed flag
  cancelled: boolean;     // Cancellation status
  createdAt?: Date;       // Booking timestamp
  updatedAt?: Date;       // Last modification timestamp
}
```

### Availability Model:
```typescript
interface Availability {
  _id?: string;           // MongoDB ObjectId
  uid?: string;           // Firebase UID
  id?: number;            // JSON Server ID
  doctorId: string;       // Reference to doctor
  type: string;           // Availability type (regular/special)
  startDate: string;      // Start date (YYYY-MM-DD)
  endDate: string;        // End date (YYYY-MM-DD)
  days: string[];         // Days of week (e.g., ['Mon', 'Tue'])
  timeSlots: TimeSlot[];  // Available time slots
  createdAt?: Date;       // Creation timestamp
  updatedAt?: Date;       // Last update timestamp
}

interface TimeSlot {
  start: string;          // Start time (HH:MM)
  end: string;            // End time (HH:MM)
  available: boolean;     // Availability status
}
```

### Absence Model:
```typescript
interface Absence {
  _id?: string;           // MongoDB ObjectId
  uid?: string;           // Firebase UID
  id?: number;            // JSON Server ID
  doctorId: string;       // Reference to doctor
  startDate: string;      // Start date (YYYY-MM-DD)
  endDate: string;        // End date (YYYY-MM-DD)
  reason: string;         // Absence reason
  approved: boolean;      // Approval status
  createdAt?: Date;       // Request timestamp
  updatedAt?: Date;       // Last modification timestamp
}
```

## Screenshots of application

###  Home Page

![Home Page](./images_docs/HomeP.jpg)

###  Doctor List

### Calendar View

### Appointment Basket

### Admin Dashboard

### Forms

### Mobile Responsive


## Authentication

For testing and development purposes, use the following admin credentials:

### Admin Account:
- **Email**: `12345678Qa!@gmail.com`
- **Password**: `12345678Qa!`


### Security Features:
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for doctors, patients, and admins
- **Password Encryption**: Secure password hashing with bcrypt
- **Session Management**: Automatic session timeout and refresh
- **Route Guards**: Protected routes based on authentication status

## License

This project is licensed under the **MIT License**.



