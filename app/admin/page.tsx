import Link from 'next/link'

export default function AdminHub() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
      <div className="z-10 max-w-6xl w-full items-center justify-center font-mono text-sm">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎮 Admin Panel
          </h1>
          <p className="text-xl text-gray-600">
            Manage games, words, and view statistics
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          <Link
            href="/admin/crossword"
            className="group rounded-xl border border-gray-200 bg-white px-6 py-8 transition-all hover:border-blue-500 hover:shadow-xl hover:scale-105"
          >
            <div className="text-5xl mb-4">🧩</div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">
              Crossword{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 text-sm text-gray-600 mb-4">
              Manage words, clues, and view crossword game statistics
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div>• Add/Delete Words</div>
              <div>• View Leaderboard</div>
              <div>• Player Statistics</div>
            </div>
          </Link>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 opacity-60">
            <div className="text-5xl mb-4">🔢</div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-700">
              Sudoku
            </h2>
            <p className="m-0 text-sm text-gray-600 mb-4">
              Manage sudoku puzzles and difficulty levels
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div>• Create Puzzles</div>
              <div>• Difficulty Settings</div>
              <div>• Player Stats</div>
            </div>
            <div className="mt-4 inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
              Coming Soon
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 opacity-60">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-700">
              Wordle
            </h2>
            <p className="m-0 text-sm text-gray-600 mb-4">
              Manage word lists and game settings
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div>• Word Database</div>
              <div>• Daily Challenges</div>
              <div>• Success Rates</div>
            </div>
            <div className="mt-4 inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
              Coming Soon
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 opacity-60">
            <div className="text-5xl mb-4">⌨️</div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-700">
              Typing Competition
            </h2>
            <p className="m-0 text-sm text-gray-600 mb-4">
              Manage typing tests and passages
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div>• Test Passages</div>
              <div>• Difficulty Levels</div>
              <div>• WPM Statistics</div>
            </div>
            <div className="mt-4 inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
              Coming Soon
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 opacity-60">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-700">
              Memory Game
            </h2>
            <p className="m-0 text-sm text-gray-600 mb-4">
              Manage card sets and themes
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div>• Card Collections</div>
              <div>• Theme Management</div>
              <div>• Match Statistics</div>
            </div>
            <div className="mt-4 inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
              Coming Soon
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-6 py-8">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">
              Global Stats
            </h2>
            <p className="m-0 text-sm text-gray-600 mb-4">
              View platform-wide statistics
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div>• Total Players</div>
              <div>• Games Played</div>
              <div>• Popular Games</div>
            </div>
            <div className="mt-4 inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
              Future Feature
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Back to Games
          </Link>
          <p className="text-sm text-gray-500">
            Select a game above to manage its content and view statistics
          </p>
        </div>
      </div>
    </main>
  )
}
