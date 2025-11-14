# Google Sheets Backend Setup

## Overview
The application now uses Google Sheets as the backend database instead of JSON files. All game scores are stored in a Google Sheet with columns: `email`, `house`, `game`, `duration`, `score`.

## Setup Instructions

### 1. Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "All Hearts Games Scores" (or any name you prefer)
4. Add column headers in the first row:
   - Column A: `email`
   - Column B: `house`
   - Column C: `game`
   - Column D: `duration`
   - Column E: `score`
5. Copy the **Spreadsheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - Example: If URL is `https://docs.google.com/spreadsheets/d/1abc123xyz/edit`
   - Then SPREADSHEET_ID is: `1abc123xyz`

### 2. Create Google Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in details (name: "all-hearts-games-service")
   - Click "Create and Continue"
   - Skip optional steps, click "Done"
5. Create Service Account Key:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Click "Create" (file will download)
6. Copy service account email:
   - Format: `service-account-name@project-id.iam.gserviceaccount.com`
   - You'll need this email

### 3. Share Google Sheet with Service Account
1. Open your Google Sheet
2. Click "Share" button (top right)
3. Paste the service account email
4. Give it "Editor" access
5. Uncheck "Notify people"
6. Click "Share"

### 4. Configure Environment Variables
1. Create `.env.local` file in project root (if it doesn't exist)
2. Add the following variables:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

3. Fill in the values:
   - `GOOGLE_SHEET_ID`: The spreadsheet ID from step 1
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: The service account email from step 2
   - `GOOGLE_PRIVATE_KEY`: Open the downloaded JSON file from step 2, find the `private_key` field, and copy its entire value (including the quotes and newlines)

**Important:** Keep the double quotes around the private key value!

Example `.env.local`:
```env
GOOGLE_SHEET_ID=1abc123xyz456
GOOGLE_SERVICE_ACCOUNT_EMAIL=all-hearts-games@my-project-123.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG...(full key)...xyz==\n-----END PRIVATE KEY-----\n"
```

### 5. Verify Setup
1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Play a crossword game and complete it
3. Check your Google Sheet - you should see a new row with:
   - Your email
   - Your house
   - Game name (crossword)
   - Duration in seconds
   - Score percentage (0-100)

## Data Schema

### Sheet Columns:
| Column | Type | Description |
|--------|------|-------------|
| email | string | Player's email address |
| house | string | Player's house (fire, water, earth, air) |
| game | string | Game type (crossword, sudoku, wordle, etc.) |
| duration | number | Time taken in seconds |
| score | number | Score percentage (0-100) |

### Example Data:
```
email                    | house | game      | duration | score
john.doe@sadhguru.org   | fire  | crossword | 145      | 85
jane@sadhguru.org       | water | crossword | 120      | 100
bob@sadhguru.org        | earth | crossword | 180      | 70
```

## How It Works

### Score Calculation:
```javascript
score = (correctAnswers / totalWords) * 100
```

### Data Flow:
1. User plays game → Game component tracks progress
2. User completes game → Submit button clicked
3. API receives game data → Calculates score and duration
4. API writes to Google Sheet → New row added
5. Leaderboard page → Reads from Google Sheet
6. House scores calculated → From all rows in sheet

## API Integration

### Files Updated:
1. **`lib/shared/googleSheets.ts`** - Google Sheets helper functions
2. **`app/api/games/crossword/sessions/route.ts`** - API routes using sheets
3. **`components/games/crossword/CrosswordGame.tsx`** - Game component sending full data

### Key Functions:
```typescript
// Add a score to the sheet
addScoreToSheet({
  email: 'user@sadhguru.org',
  house: 'fire',
  game: 'crossword',
  duration: 120,
  score: 85,
});

// Get all scores
getScoresFromSheet();

// Get scores by game
getScoresByGame('crossword');

// Get scores by house
getScoresByHouse('fire');

// Get scores by email
getScoresByEmail('user@sadhguru.org');
```

## Advantages Over JSON Files

✅ **Real-time collaboration** - Multiple instances can write simultaneously  
✅ **Easy to view** - Open in Google Sheets interface  
✅ **Manual editing** - Can edit/delete scores directly  
✅ **Automatic backup** - Google handles backups  
✅ **Analytics ready** - Easy to analyze in Sheets  
✅ **Scalable** - Handles thousands of rows  
✅ **No file system needed** - Works on any hosting platform  

## Troubleshooting

### Error: "Missing Google Sheets environment variables"
- Check that `.env.local` file exists
- Verify all three variables are set
- Restart dev server after adding variables

### Error: "No permission to access sheet"
- Ensure service account email is shared with Editor access
- Check that the spreadsheet ID is correct

### Error: "Invalid private key"
- Ensure private key includes BEGIN and END markers
- Keep the double quotes around the entire key value
- Make sure `\n` is preserved (not actual newlines)

### Scores not appearing in sheet
- Check that column headers match exactly (lowercase)
- Verify service account has Editor access
- Check browser console for errors

### Error: "Cannot find module 'google-spreadsheet'"
- Run `npm install google-spreadsheet`
- Restart development server

## Migration from JSON

If you have existing data in JSON files (`data/crossword/sessions.json`):

1. Open the JSON file
2. For each session, add a row to the sheet:
   - email: `playerEmail` field
   - house: `house` field
   - game: `gameType` field
   - duration: `duration` field
   - score: Calculate from `(correctAnswers / totalWords) * 100`

Or keep JSON files as backup while testing Google Sheets integration.

## Security Notes

⚠️ **Never commit `.env.local` to git** (already in .gitignore)  
⚠️ **Never share service account credentials** publicly  
⚠️ **Keep JSON key file secure** - delete after copying to .env.local  
✅ Use environment variables for all credentials  
✅ Service account has minimal permissions (only Sheets API)  

## Next Steps

1. ✅ Setup complete? Test by playing a game
2. ✅ Scores appearing? Check leaderboard
3. ✅ Everything working? Deploy to production with environment variables set

For production deployment (Vercel, etc.):
- Add the same environment variables in deployment settings
- The app will automatically use Google Sheets in production

---

**Setup Status:** Ready to use Google Sheets backend! 🎉

