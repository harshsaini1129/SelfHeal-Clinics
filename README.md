# SelfHeal Hospitals

A small React + Vite web app for hospital booking and administration, built with Firebase.

## Features

- Browse departments and doctors
- Book appointments and view bookings
- Authentication with Firebase
- Admin view for managing data

## Quickstart

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Firebase project and add credentials (see `src/firebase.ts`).

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Build for production:

   ```bash
   npm run build
   npm run start
   ```

5. Preview the production build locally:

   ```bash
   npm run preview
   ```

## Project Structure

- `src/` — React app source files (components, assets, entry points)
- `server.ts` — Simple dev/SSR server used by `npm run dev` and build
- `firebase-blueprint.json` — example Firebase config/seed data

## Environment

- This project expects Firebase configuration to be provided in `src/firebase.ts` or via environment variables used there.

## Scripts

- `npm run dev` — start development server
- `npm run build` — build client and bundle server
- `npm run start` — run the bundled server
- `npm run preview` — preview production build

