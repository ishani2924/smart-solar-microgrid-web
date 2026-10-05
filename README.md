# Smart Solar Microgrid Web Application

A modern web application for managing smart solar microgrid stations, prosumer bookings, and energy distribution. Built with React, Vite, and Tailwind CSS.

## Features

### User Roles
- **Prosumer**: View dashboard, manage bookings, browse stations, manage profile
- **Admin**: Manage users, prosumers, deactivation requests, tab permissions, and bookings
- **Grid Operator**: Monitor dashboard, scan QR codes, view station maps
- **Backoffice**: Combined permissions for admin and operator functions

### Key Features
- **Landing Page**: Comprehensive marketing page with hero section, statistics, features, and call-to-action
- **Authentication**: Secure login and registration system with role-based access control
- **Station Management**: Create, view, edit, and manage solar microgrid stations
- **Booking System**: Prosumers can book charging stations with QR code scanning
- **Interactive Maps**: Leaflet and Google Maps integration for station location visualization
- **3D Visualization**: Three.js integration for solar panel 3D scenes
- **Energy Flow Visualization**: Real-time energy distribution visualization
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- **Framework**: React 18.3.1
- **Build Tool**: Vite 8.3.0
- **Styling**: Tailwind CSS 4.3.3
- **Routing**: React Router DOM 7.18.4
- **HTTP Client**: Axios 1.20.0
- **Maps**: Leaflet 1.9.4, React Leaflet 4.2.1, @react-google-maps/api 2.20.8
- **3D Graphics**: Three.js 0.164.0, @react-three/fiber 8.16.2, @react-three/drei 9.105.6
- **QR Code**: html5-qrcode 2.3.8
- **Animations**: Framer Motion 13.4.0
- **Icons**: Lucide React 0.378.0
- **Utilities**: clsx 2.1.1, tailwind-merge 2.3.0

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-solar-microgrid-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── DashboardLayout.jsx
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── HeroSection.jsx
│   ├── Statistics.jsx
│   ├── EnergyFlow.jsx
│   └── ...
├── contexts/            # React contexts
│   └── AuthContext.jsx
├── pages/              # Page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Profile.jsx
│   ├── AdminUsers.jsx
│   ├── OperatorDashboard.jsx
│   ├── ProsumerDashboard.jsx
│   ├── Microgrid/
│   │   ├── StationList.jsx
│   │   ├── CreateStation.jsx
│   │   ├── StationDetails.jsx
│   │   └── EditStation.jsx
│   └── ...
├── App.jsx             # Main app component with routing
└── main.jsx            # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## API Integration

This application connects to the Smart Solar Microgrid API. Ensure the API server is running and update the `VITE_API_URL` environment variable accordingly.

## License

[Your License Here]
