# Tennis Lesson Booking System

🎾 **[Live Demo](https://tennis-booking-sigma.vercel.app/booking)** 🎾

A modern, mobile-friendly web application for booking tennis lessons. Built with Next.js 14, Supabase, and TailwindCSS.

## Screenshots

### Landing Page
![Landing Page](/public/landing-page.png)

### Booking Schedule
![Booking Schedule](/public/booking-page.png)

## Features

- 📅 **Interactive Schedule Grid** - View and book available time slots across multiple days
- 📱 **Mobile-Optimized** - Responsive design with intuitive touch-friendly mobile date picker
- 🔐 **Secure Authentication** - User authentication powered by Supabase
- ⚡ **Real-time Updates** - Live schedule synchronization
- 🎾 **Admin Dashboard** - Manage bookings and view customer details
- 🌓 **Modern UI** - Clean, accessible interface with smooth animations

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: [Luxon](https://moment.github.io/luxon/)
- **Animations**: [DotLottie](https://lottiefiles.com/)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TerryXBT/Tennis-Booking.git
   cd Tennis-Booking
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                # Next.js App Router pages
│   ├── admin/         # Admin dashboard
│   ├── api/           # API routes
│   ├── booking/       # Booking page
│   └── login/         # Authentication
├── components/        # React components
│   ├── admin/         # Admin-specific components
│   └── ...            # Shared components
├── lib/               # Utilities and Supabase client
├── public/            # Static assets
└── types/             # TypeScript type definitions
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## License

MIT
