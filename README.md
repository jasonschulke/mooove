# Moove

A personal workout tracking Progressive Web App (PWA) built with React, TypeScript, and Tailwind CSS.

## Features

- **Workout Tracking**: Log exercises with weights, reps, and duration
- **Exercise Library**: Browse 50+ built-in exercises organized by movement pattern
- **Custom Workouts**: Create and save workout templates to your library
- **Progress Visualization**: GitHub-style contribution calendar and stats
- **AI Coach**: Chat with Claude for workout advice and motivation
- **Offline Support**: Full PWA with offline capability
- **Dark/Light Mode**: System-aware theme with manual toggle

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS v4** for styling
- **PWA** with Workbox for offline support
- **LocalStorage** for data persistence

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── Button.tsx
│   ├── ClaudeChat.tsx
│   ├── EffortChart.tsx
│   ├── EffortPicker.tsx
│   ├── ExerciseView.tsx
│   ├── NavBar.tsx
│   ├── Onboarding.tsx
│   ├── Timer.tsx
│   ├── WorkoutBuilder.tsx
│   └── WorkoutStartFlow.tsx
├── data/           # Data layer and storage
│   ├── exercises.ts    # Exercise definitions
│   ├── storage.ts      # LocalStorage persistence
│   ├── sync.ts         # Cloud sync (disabled)
│   └── workouts.ts     # Workout templates
├── hooks/          # React hooks
│   ├── useTimer.ts
│   └── useWorkout.ts
├── pages/          # Page components
│   ├── HomePage.tsx
│   ├── LibraryPage.tsx
│   ├── SettingsPage.tsx
│   └── WorkoutPage.tsx
├── types/          # TypeScript type definitions
│   └── index.ts
├── utils/          # Utility functions
│   ├── exerciseGifs.ts
│   └── uuid.ts
├── App.tsx         # Main application component
├── index.css       # Global styles and animations
└── main.tsx        # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### Home Page
- View your workout statistics and streaks
- Track monthly and yearly progress with contribution calendars
- Tap dates to mark rest days or add backlog workouts

### Workout Page
- Start a new workout or continue saved templates
- Log each exercise with weight, reps, and optional notes
- Rate overall workout effort when complete

### Library
- Browse and manage saved workout templates
- View exercise library organized by movement pattern
- Create custom exercises

### Chat
- Get AI-powered workout advice from Claude
- Ask questions about form, programming, or nutrition

### Settings
- Toggle dark/light theme
- Configure default equipment weights
- Choose AI coach personality
- Export your workout data

## Data Storage

All data is stored locally in the browser's localStorage:
- Workout sessions and history
- Custom exercises and saved workouts
- User preferences and settings
- Chat history

## License

Private project - not for distribution.
