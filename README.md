# Hotel Room Monitor - Agent Guidelines

## Project Overview
Real-time hotel room monitoring system: NestJS API (port 3001) + React frontend (port 5173).

## Project Structure

- **api/**: NestJS backend (`src/main.ts`, `src/rooms/`, `src/gateways/`)
- **client/**: React frontend (`src/components/`, `src/services/`, `src/types/`)
- **package.json**: Root workspace (scripts: `install:all`, `dev`, `build`)

## Build/Lint/Test Commands

### Root Commands (run from project root)
```bash
npm run install:all     # Install all dependencies
npm run dev             # Run both API and client in dev mode
npm run build           # Build both projects
npm run start:prod      # Run API in production mode
```

### Backend (api/)
```bash
cd api
npm run build           # Compile TypeScript
npm run start:dev       # Start dev server with hot reload
npm run lint            # Run ESLint with auto-fix
npm run format          # Format with Prettier
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:cov        # Run tests with coverage

# Run single test:
# npm test -- --testNamePattern="should create room"
# npm test -- rooms.service.spec.ts
# npm test -- --testPathPattern="rooms"
```

### Frontend (client/)
```bash
cd client
npm run dev             # Start Vite dev server
npm run build           # Build for production
npm run lint            # Run ESLint
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/rooms | List all rooms (filterable) |
| GET | /api/rooms/stats | Get room statistics |
| GET | /api/rooms/:id | Get single room |
| POST | /api/rooms | Create room |
| PUT | /api/rooms/:id | Update room |
| DELETE | /api/rooms/:id | Delete room |
| POST | /api/rooms/:id/check-in | Check in guest |
| POST | /api/rooms/:id/check-out | Check out guest |
| PATCH | /api/rooms/:id/cleaning-complete | Mark cleaning done |

**Swagger Docs**: http://localhost:3001/api/docs

## Code Style Guidelines

### General TypeScript
- Use explicit type annotations for function parameters and return types
- Prefer `interface` over `type` for object definitions
- Use enums for fixed sets of values (RoomStatus, RoomType)
- Backend: `strictNullChecks: false`; Frontend: strict mode enabled
- Path aliases: `@/*` maps to `src/*` (backend), `./src/*` (frontend)
- Import order: Node builtins → Third-party → Local imports
- Use Prettier for formatting (single quotes, trailing commas, 100 char line width)

### Naming Conventions
- Files: kebab-case (e.g., `rooms.controller.ts`, `check-in.dto.ts`)
- Classes: PascalCase (e.g., `RoomsService`, `CreateRoomDto`)
- Variables/Functions: camelCase (e.g., `roomNumber`, `findAll`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_PRICE`)
- DTOs: suffix with `Dto`; Entities: suffix with class name (e.g., `Room`)
- Test files: `*.spec.ts` for unit tests, `*.e2e-spec.ts` for E2E tests

### Backend (NestJS)
- Controllers handle HTTP concerns only; Services contain business logic
- Use DTOs with `class-validator` decorators for validation
- Use `ParseUUIDPipe` for UUID path parameters, `ParseIntPipe` for numbers
- Global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `transform`
- Generate entity IDs with `uuid` package (v4)
- Return entities or DTOs, never raw database objects
- Use Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`)
- Use `@nestjs/common` exceptions: `NotFoundException`, `BadRequestException`

### Frontend (React)
- Functional components with hooks; TypeScript for all components
- Props interfaces defined at top of file (e.g., `RoomCardProps`)
- Use Tailwind utility classes; `cn()` from `utils/helpers` for class merging
- Use `react-hot-toast` for notifications; `lucide-react` for icons
- Custom hooks in `hooks/` directory; API calls in `services/` directory
- Use `axios` for HTTP requests with proper error handling
- Socket.io for real-time updates via custom hooks

### Error Handling & State Management
- Backend: Throw NestJS exceptions with descriptive messages
- Frontend: Use try-catch with toast notifications; never expose internal errors
- Use React `useState`/`useEffect` for local state
- Use Socket.io for real-time state synchronization

### Import Patterns
```typescript
// Backend
import { Controller, Get } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';

// Frontend
import { useState, useEffect } from 'react';
import { Room, RoomStatus } from '../types/room';
import { cn, formatCurrency } from '../utils/helpers';
```

## WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| room:updated | Server → Client | { roomId, room } |
| room:created | Server → Client | Room |
| room:deleted | Server → Client | { roomId } |
| stats:updated | Server → Client | RoomStats |

## Room Status Flow

```
VACANT → (check-in) → OCCUPIED
OCCUPIED → (check-out) → CLEANING
CLEANING → (complete) → VACANT
Any → (maintenance) → MAINTENANCE
Any → (reserve) → RESERVED
```

## Tech Stack

### Backend
- NestJS 10.x, TypeScript 5.x
- Socket.io, Swagger, class-validator, uuid

### Frontend
- React 18.x, Vite 5.x, TypeScript 5.x
- TailwindCSS 3.x, Axios, Socket.io-client
- react-hot-toast, lucide-react, tailwind-merge