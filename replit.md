# DeviceFlow - Office Device Management System

## Overview

DeviceFlow is a comprehensive office device management application built for streamlining device inventory, requests, and assignments. The system provides automated workflows, Slack notifications, and comprehensive monitoring capabilities for managing smartphones, tablets, and laptops across an organization.

The application features a React frontend with a Node.js/Express backend, PostgreSQL database with Drizzle ORM, and integrates with Replit's authentication system and Slack for notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling
- **Development**: Hot reloading with tsx and Vite integration
- **Session Management**: Express sessions with PostgreSQL session store

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Structured tables for users, devices, requests, device logs, and sessions
- **Migrations**: Drizzle Kit for schema management

Key database entities:
- Users (with role-based access control)
- Devices (with status tracking and assignment management)
- Requests (device request workflow)
- Device Logs (audit trail)
- Sessions (authentication state)

### Authentication & Authorization
- **Provider**: Replit's OpenID Connect (OIDC) authentication system
- **Session Management**: Passport.js with OpenID Client strategy
- **Security**: HTTP-only cookies with secure session storage
- **Authorization**: Role-based access control (admin/employee roles)

### External Dependencies

#### Third-party Services
- **Replit Authentication**: OpenID Connect integration for user authentication
- **Slack Integration**: Web API client for automated notifications and messaging
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling

#### Key NPM Packages
- **Frontend**: React, TanStack Query, Wouter, React Hook Form, Zod
- **UI Components**: Radix UI primitives, Shadcn/ui, Tailwind CSS
- **Backend**: Express.js, Passport.js, Drizzle ORM
- **Development**: Vite, TypeScript, tsx, ESBuild

#### Database & Session Management
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **Session Store**: connect-pg-simple for PostgreSQL session persistence
- **ORM**: drizzle-orm with drizzle-kit for schema management

The architecture follows a separation of concerns with shared TypeScript schemas between frontend and backend, ensuring type safety across the full stack. The system is designed for scalability with proper error handling, logging, and monitoring capabilities.