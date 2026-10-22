# 🎯 HaBity — Habit & Task Tracker

> A high-performance, spreadsheet-style habit and task tracker dashboard designed to help you build unbreakable routines, visualize monthly consistency, and track daily wellness.

---

## 🌟 Why HaBity is Helpful

Building and maintaining positive habits requires consistency, feedback, and accountability. Most traditional habit apps hide your habits behind layers of menus and complicated workflows. 

**HaBity solves this by bringing the clarity of a spreadsheet together with modern interactive analytics and wellness tracking:**

- **At-a-Glance Consistency Matrix**: View your entire month of habits in one intuitive grid. Spot patterns, identify breaking points, and celebrate unbroken streaks.
- **Holistic Wellness Correlation**: Track your daily mood, sleep duration, and energy alongside your habits to understand how lifestyle factors affect your performance.
- **Micro-Reward Motivation**: Visual progress bars, milestone donut charts, and instant celebratory confetti give you the dopamine hit needed to keep showing up every day.
- **Time Window Accountability**: Set dedicated timeframes (Morning, Afternoon, Evening, or Any Time) with live ticking countdowns to keep you on schedule.
- **100% Private & Always Available**: Your personal data stays in your browser's local storage. Works completely offline as an installable Progressive Web App (PWA).

---

## ✨ Key Features

### 📅 Spreadsheet-Style Habit Matrix
- Fast, single-click toggle for every day of the month.
- Color-coded category tags (Health, Productivity, Mindfulness, Fitness, etc.).
- Target progress vs. monthly goal tracking with real-time percentage indicators.
- Automatic streak calculation (Current Streak & Best Streak).

### 📊 Real-Time Visual Analytics
- **Daily Progress Bar Chart**: Shows completion percentages day-by-day across the entire month.
- **Overall Stats Donut**: Instant summary of total completed habits, active streaks, and overall consistency score.
- **Top Habits Leaderboard**: Highlights your most consistent routines and areas needing focus.

### 🧘 Integrated Wellness Tracker
- Log daily mood with expressive indicators.
- Track hours of sleep per night to spot rest-productivity patterns.
- Log energy and wellness reflections alongside daily routines.

### 📱 Installable Progressive Web App (PWA)
- Install directly to your Home Screen on iOS, Android, macOS, and Windows.
- Offline-first architecture with instant loading via service workers.
- QR code sharing modal to easily open and install on mobile devices.

### 💾 Data Ownership & Safety
- **Export & Import**: Backup your entire habit and wellness history as a clean JSON file anytime.
- **Undo Support**: Accidental habit deletions can be restored with a single click.
- **Dark & Light Modes**: Beautiful high-contrast dark theme and clean light theme.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (comes bundled with Node.js)

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kido449/HABIT-TRACKER.git
   cd HABIT-TRACKER
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Start Dev Server** | `npm run dev` | Runs the Vite development server on port 3000 |
| **Production Build** | `npm run build` | Compiles and optimizes assets into `dist/` |
| **Preview Build** | `npm run preview` | Previews the production build locally |
| **Type Check** | `npm run lint` | Runs TypeScript compiler checks (`tsc --noEmit`) |

---

## 🏗️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **PWA Support**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Animations & Effects**: [Framer Motion](https://motion.dev/) & [canvas-confetti](https://github.com/catdad/canvas-confetti)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📄 License

This project is licensed under the Apache-2.0 License.
