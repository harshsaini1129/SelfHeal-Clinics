# SelfHeal Hospitals

A full-stack web application for hospital management, built with Firebase and Vite + React.

## Project Structure

```text
.
├── backend/
│   └── server.ts
├── frontend/
│   ├── index.html
│   ├── assets/
│   │   └── build/
│   │       ├── index-DBHdRLRB.css
│   │       └── index-uOL_3sVm.js
│   ├── src/
│   │   ├── App.tsx
│   │   ├── data.ts
│   │   ├── firebase.ts
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── types.ts
│   │   ├── assets/
│   │   │   └── images/
│   │   └── components/
│   │       ├── AboutView.tsx
│   │       ├── AdminView.tsx
│   │       ├── AIChatbot.tsx
│   │       ├── AuthView.tsx
│   │       ├── BookingForm.tsx
│   │       ├── DepartmentsView.tsx
│   │       ├── DoctorsView.tsx
│   │       ├── FirebaseProvider.tsx
│   │       ├── HomeView.tsx
│   │       ├── MyBookingsView.tsx
│   │       └── Navbar.tsx
├── firebase-applet-config.json
├── firebase-blueprint.json
├── firestore.indexes.json
├── firestore.rules
├── metadata.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Notes

- `frontend/` contains the React application source and build assets.
- `backend/` contains the server entrypoint.
- Firebase configuration and rules files are stored at the repository root.
- `package.json` and `tsconfig.json` configure dependencies and TypeScript settings.

## Admin Portal Access

### Credentials

| Field              | Value             |
| ------------------ | ----------------- |
| **Admin ID**       | `sampletest@1129` |
| **Admin Password** | `test@123`        |

### Admin Features

- View and manage all patient bookings
- Create new appointments on behalf of patients
- Reschedule existing appointments
- Confirm, reject, or cancel bookings
- Track revenue and booking statistics
- View patient medical history
- Access secure admin dashboard with real-time data

### How to Access

1. Navigate to the application
2. Click on the "Admin Portal" link in the navigation menu
3. Enter the Admin ID and Password
4. You will have full access to the administrative command center
