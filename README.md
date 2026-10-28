# Updathon

Updathon is a Windows-first desktop application for managing personal hackathons in one place. Track hackathons, teams, projects, rounds, tasks, and deadlines, with locally stored data and optional desktop notifications.

## Features

- Dashboard with hackathon statistics, active events, upcoming deadlines, and task progress
- Create and manage hackathons, teams and members, projects, rounds, and tasks
- Search and filter tasks by status, priority, and round
- Schedule-aware hackathon and round statuses, live countdowns, and deadline indicators
- Timeline and notification settings foundations, including a native test notification
- Light and dark themes, system tray support, and an optional Windows startup setting
- Local SQLite persistence through Prisma

## Tech Stack

- Electron
- React and React Router
- Vite and TypeScript
- Tailwind CSS
- Prisma ORM and SQLite
- Lucide React icons and Day.js

## Screenshots

Screenshots will be added here.

## Development Setup

Install Node.js (LTS recommended) and npm, then open a PowerShell terminal in the project directory.

```powershell
npm install
Copy-Item .env.example .env
npm run prisma:generate
```

The committed `.env.example` contains a local development database URL only. Keep real credentials and machine-specific values in `.env`; `.env` files and local databases are ignored by Git.

## Running Locally

Start the application in development mode:

```powershell
npm run dev
```

This prepares the local SQLite schema and starts the Vite renderer with Electron. For type checking and a production build:

```powershell
npm run typecheck
npm run build
```

## Building the Windows Application

Build the per-user Windows installer and portable executable:

```powershell
npm run package
```

The installer and portable application are written to `dist/`:

- `dist/Updathon Setup.exe`
- `dist/Updathon Portable.exe`

The installer creates a Start Menu shortcut and offers an optional Desktop shortcut. Build output is local and is not intended to be committed. The installer is unsigned unless a code-signing certificate is configured, so Windows SmartScreen may show a warning.

## Database Information

The Prisma schema is in `prisma/schema.prisma`. User data is stored in SQLite at:

```text
%APPDATA%\updathon\updathon.db
```

The database stays outside the application installation so it persists across restarts, updates, and uninstall. `resources/updathon-template.db` is a blank schema template used to initialize the database on first launch; it contains no user records and is intentionally tracked. Never commit a local user database or a backup containing personal data.

The application performs database operations in Electron's main process through a restricted preload IPC bridge. The renderer does not receive direct access to Node.js or Prisma. Electron windows enable `contextIsolation` and disable `nodeIntegration`.

## Vibe Coding / GitHub Copilot Agent Development

Updathon has been developed iteratively with AI-assisted, “vibe coding” workflows, including GitHub Copilot Agent. Agent-generated changes should be reviewed and tested by a human before they are accepted. Do not provide agents with secrets, credentials, or private user data, and do not commit generated local data or build artifacts.
