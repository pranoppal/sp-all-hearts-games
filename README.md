# All Hearts Games 🎮

A full-stack multi-game platform built with Next.js, TypeScript, and Tailwind CSS. The platform is designed to host multiple games with a unified architecture. Currently features a crossword puzzle game with more games coming soon!

## 🎯 Available Games

### Crossword Game ✅
A fully interactive crossword puzzle game where players can solve puzzles and compete on the leaderboard.

### Coming Soon
- 🔢 **Sudoku** - Logic-based number puzzles
- 📝 **Wordle** - Word guessing game
- ⌨️ **Typing Competition** - Speed typing challenges
- 🎯 **Memory Game** - Match pairs and train your memory
- And many more!

## Features

### For Players
- 🎮 **Interactive Gameplay**: Enter your name and start playing immediately
- ⏱️ **Real-time Timer**: Track how long you take to complete puzzles
- ✅ **Live Validation**: See which answers are correct as you type (Crossword)
- 📊 **Grid Updates**: Letters appear on the crossword grid as you type
- 🏆 **Leaderboard**: Compete with other players for the best times
- 📊 **Progress Tracking**: See how many words you've solved correctly

### For Admins
- ➕ **Word Management**: Add and delete words with clues (Crossword)
- 📈 **Statistics Dashboard**: View all player sessions and completion times
- 🏅 **Leaderboard View**: See top performers sorted by completion time
- 📝 **Complete Word List**: Manage the entire word database

### Technical Features
- 🎯 **Smart Crossword Generation**: Automatic crossword puzzle generation algorithm
- 🏗️ **Multi-Game Architecture**: Scalable structure to support multiple games
- 💾 **Game-Specific Storage**: Isolated data storage for each game type
- 🎨 **Beautiful UI**: Modern, responsive design with Tailwind CSS
- ⚡ **Fast Performance**: Built with Next.js 14 and React 18
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites
- Node.js 18+ installed on your system
- npm, yarn, or pnpm package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### For Admins

1. Navigate to `/admin` or click "Admin Panel" on the home page
2. **Add Words (Crossword):**
   - Enter a word and its clue
   - Click "Add Word" to save
3. **Manage Words:**
   - View all words in the word list table
   - Delete words by clicking the "Delete" button
4. **View Statistics:**
   - Switch to the "Statistics & Leaderboard" tab
   - See all completed game sessions
   - View player names, times, scores, and dates

### For Players

1. Navigate to the home page at `/`
2. **Choose a Game:**
   - Click on any available game card (currently Crossword)
3. **Enter Your Name:**
   - Type your name in the input field
   - Click "Start Game"
4. **Play the Game:**
   - **Crossword:**
     - Read the clues under "Across" and "Down"
     - Type your answers in the input fields
     - Watch letters appear on the grid as you type
     - Correct answers will turn green
     - The timer tracks your progress
5. **Submit:**
   - Click "Submit Answers" when done
   - View your completion time and score
   - Play again or return to home

## Project Structure

```
all-hearts-games/
├── app/                              # Next.js app directory
│   ├── api/                         # API routes
│   │   └── games/                   # Game-specific APIs
│   │       └── crossword/           # Crossword game APIs
│   │           ├── route.ts         # Generate crossword
│   │           ├── words/           # Word management
│   │           └── sessions/        # Session management
│   ├── games/                       # Game pages
│   │   └── crossword/               # Crossword game page
│   │       └── page.tsx
│   ├── admin/                       # Admin panel
│   │   └── page.tsx
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home/Games hub page
├── components/                      # React components
│   ├── games/                       # Game-specific components
│   │   └── crossword/               # Crossword components
│   │       └── CrosswordGame.tsx    # Main game component
│   └── shared/                      # Shared UI components (future)
├── lib/                             # Utility libraries
│   ├── games/                       # Game-specific logic
│   │   └── crossword/               # Crossword game logic
│   │       ├── generator.ts         # Puzzle generation
│   │       └── storage.ts           # Data persistence
│   └── shared/                      # Shared utilities (future)
├── types/                           # TypeScript definitions
│   ├── games/                       # Game-specific types
│   │   └── crossword.ts             # Crossword types
│   ├── shared.ts                    # Shared types
│   └── index.ts                     # Type exports
├── data/                            # JSON data storage
│   └── crossword/                   # Crossword game data
│       ├── words.json               # Word database
│       └── sessions.json            # Game sessions
└── package.json
```

## Adding New Games

The architecture is designed to make adding new games straightforward:

1. **Create game folder structure:**
   ```
   app/games/[game-name]/page.tsx
   components/games/[game-name]/[GameName]Game.tsx
   lib/games/[game-name]/
   types/games/[game-name].ts
   data/[game-name]/
   ```

2. **Add API routes:**
   ```
   app/api/games/[game-name]/route.ts
   ```

3. **Update home page:**
   - Add game card in `app/page.tsx`
   - Change status from "Coming Soon" to "Available"

4. **Update types:**
   - Export new game types from `types/index.ts`

## API Endpoints

### Crossword Game

#### Words API (`/api/games/crossword/words`)
- `GET` - Fetch all words
- `POST` - Add a new word (body: `{ word, clue }`)
- `DELETE` - Delete a word (query: `?id=<wordId>`)

#### Crossword API (`/api/games/crossword`)
- `GET` - Generate a crossword puzzle from stored words

#### Sessions API (`/api/games/crossword/sessions`)
- `GET` - Fetch all game sessions (sorted by duration)
- `POST` - Create a new session (body: `{ playerName, gameType, totalWords }`)
- `PATCH` - Update a session (body: `{ id, endTime, completed, correctAnswers }`)

## Data Storage

The application uses JSON files for data persistence, organized by game type:

- `data/crossword/words.json` - Crossword words and clues
- `data/crossword/sessions.json` - Crossword game sessions
- Future games will have their own data folders

Files are created automatically when you add your first word or start your first game.

## Technologies Used

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **Data Storage:** File-based JSON storage
- **ID Generation:** UUID
- **Architecture:** Modular multi-game structure

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Tips for Best Experience

1. **Start by adding words:** Go to the admin panel and add at least 5-10 words for crossword generation
2. **Use varied word lengths:** Mix short and long words for better crossword generation
3. **Write clear clues:** Make clues challenging but fair
4. **Test the games:** Play yourself to ensure everything works properly

## Troubleshooting

**Problem:** "No words available" error when playing crossword
- **Solution:** Go to the admin panel and add some words first

**Problem:** Crossword doesn't generate properly
- **Solution:** Add more words or use words with common letters for better intersections

**Problem:** Data not persisting
- **Solution:** Ensure the `data/` directory exists and is writable

## Architecture Benefits

The new multi-game architecture provides:

1. **Isolation:** Each game has its own components, logic, and data
2. **Scalability:** Easy to add new games without affecting existing ones
3. **Maintainability:** Clear folder structure makes code easy to find and update
4. **Reusability:** Shared components and utilities can be used across games
5. **Type Safety:** Game-specific types prevent cross-game type confusion

## Future Enhancements

### Platform Features
- User authentication and profiles
- Cross-game leaderboards
- Achievement system
- Social sharing
- Daily challenges across all games

### Game-Specific Features
- **Crossword:** Multiple difficulty levels, hints system, export as PDF
- **Sudoku:** Different grid sizes, solver hints
- **Wordle:** Multiple languages, custom word lists
- **Typing:** Various difficulty levels, multiplayer races

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions, please open an issue on the repository or contact the development team.

---

Happy gaming! 🎮

