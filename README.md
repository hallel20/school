# School Management Portal
A full-stack web application for managing school-related activities. This project includes a client-side application built with React and Vite, and a server-side API built with Express.js, TypeScript, and Prisma ORM.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Client Setup](#client-setup)
  - [Server Setup](#server-setup)
- [Available Scripts](#available-scripts)
  - [Client Scripts](#client-scripts)
  - [Server Scripts](#server-scripts)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

*(Describe the key features of your application here. For example:)*
- User authentication (students, teachers, admins)
- Course management
- Student enrollment
- Grade tracking
- Announcements

## Tech Stack

**Client:**
- React
- Vite
- TypeScript
- Tailwind CSS
- Axios
- React Router

**Server:**
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- MySQL
- JWT for authentication
- bcryptjs for password hashing

**Development Tools:**
- ESLint
- Prettier
- Nodemon

## Prerequisites

- Node.js (v18.x or later recommended)
- npm (v9.x or later recommended) or yarn or pnpm
- MySQL Server

## Project Structure

```
school/
├── client/         # React/Vite client application
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│   └── tsconfig.json
│   └── ...
├── server/         # Express.js server application
│   ├── prisma/
│   │   └── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   └── index.ts
│   │   └── ... (routes, controllers, services)
│   ├── package.json
│   └── tsconfig.json
│   └── ...
└── README.md
```

## Getting Started

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <your-repository-url>
    cd school
    ```

2.  **Set up environment variables:**
    *   For the server, create a `.env` file in the `server/` directory based on `server/.env.example` (if you create one). It should at least contain your `DATABASE_URL`.
      Example `server/.env`:
      ```env
      DATABASE_URL="mysql://user:password@host:port/database_name"
      JWT_SECRET="your_jwt_secret_key"
      ```

### Client Setup

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```
The client will be accessible at `http://localhost:5173` (or another port if configured differently by Vite).

### Server Setup

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Generate Prisma Client (if not already done or after schema changes)
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
# npx prisma db seed  (if you have a seed script configured in server/package.json)

# Start the development server
npm run dev
```
The server will be running on `http://localhost:3000` (or the port specified in your server code/environment variables).

## Available Scripts

### Client Scripts

Located in `client/package.json`:
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the client application for production.
- `npm run lint`: Lints the client-side code.
- `npm run preview`: Serves the production build locally.

### Server Scripts

Located in `server/package.json`:
- `npm run dev`: Starts the server in development mode using `nodemon` and `ts-node`.
- `npm run build`: Compiles TypeScript to JavaScript.
- `npm run start`: Starts the compiled server (for production).
- `npm run prisma:generate`: Generates Prisma Client.
- `npm run prisma:migrate`: Applies database migrations.
- `npm run prisma:studio`: Opens Prisma Studio.

## Database

This project uses Prisma ORM with a MySQL database.
- The Prisma schema is defined in `server/prisma/schema.prisma`.
- Migrations are managed by Prisma Migrate.

## API Endpoints

*(Document your main API endpoints here. For example:)*
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login an existing user
- `GET /api/courses` - Get all courses
- ...

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details (if you add one).