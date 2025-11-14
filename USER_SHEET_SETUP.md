# User Sheet Setup Guide

This document explains how the user authentication with Google Sheets works.

## Overview

Users no longer manually select their house. Instead, when they enter their email, the system automatically fetches their house assignment from a separate Google Sheet containing user details.

## Google Sheet Structure

### Required Columns

Your Google Sheet should have the following columns:

| Category | Name | Gender | Email | Supporting In | House |
|----------|------|--------|-------|---------------|-------|
| Employee | John Doe | Male | john@sadhguru.org | Tech | akashic |
| Volunteer | Jane Smith | Female | jane@sadhguru.org | Marketing | karma |

**Column Details:**
- **Category**: User category (Employee, Volunteer, etc.)
- **Name**: Full name of the user
- **Gender**: User's gender
- **Email**: User's email address (must end with @sadhguru.org)
- **Supporting In**: Department or area
- **House**: One of: `akashic`, `karma`, `zen`, `shakti`

### Valid House Values

- `akashic` - Akashic Warriors
- `karma` - Karma Debuggers
- `zen` - Zen Coders
- `shakti` - Shakti Compilers

## Environment Setup

Add the following to your `.env.local` file:

```env
# Existing variables (keep these)
GOOGLE_SHEET_ID=your_scores_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY="your_private_key"

# New variable for users sheet
GOOGLE_USERS_SHEET_ID=your_users_sheet_id
```

## How It Works

### 1. User Login Flow

1. User enters their email address
2. System validates email ends with `@sadhguru.org`
3. System calls `/api/users?email=user@sadhguru.org`
4. API fetches user data from Google Sheet
5. If found, user's house is automatically assigned
6. Email and house are saved to localStorage

### 2. API Endpoint

**Endpoint:** `GET /api/users?email=user@sadhguru.org`

**Success Response (200):**
```json
{
  "category": "Employee",
  "name": "John Doe",
  "gender": "Male",
  "email": "john@sadhguru.org",
  "supportingIn": "Tech",
  "house": "akashic"
}
```

**Error Response (404):**
```json
{
  "error": "User not found"
}
```

### 3. Error Handling

The system handles the following error cases:

- **Email not found in sheet**: Shows "Email not found. Please make sure you're using the correct email address."
- **House not assigned**: Shows "Your house information is not available. Please contact the administrator."
- **API/Network error**: Shows "Failed to fetch your details. Please try again."

## Code Changes

### New Files Created

1. **`app/api/users/route.ts`**
   - API route to fetch user data by email
   - Handles user lookup from Google Sheet

### Updated Files

1. **`lib/shared/googleSheets.ts`**
   - Added `UserData` interface
   - Added `getUserByEmail()` function
   - Added `getAllUsers()` function
   - Added users sheet initialization functions

2. **`app/page.tsx`**
   - Removed manual house selection UI
   - Updated `handleEmailSubmit()` to fetch user data from API
   - Added loading state during email verification
   - Improved error handling with specific messages

## Google Sheets Permissions

Make sure your service account has **Viewer** access to the users Google Sheet:

1. Open your users Google Sheet
2. Click "Share" button
3. Add your service account email
4. Set permission to "Viewer"
5. Click "Send"

## Testing

To test the setup:

1. Add a test user to your Google Sheet with all required columns
2. Restart your Next.js dev server to reload environment variables
3. Try logging in with the test user's email
4. Verify the correct house is automatically assigned

## Troubleshooting

### "Missing Google Sheets environment variables for users sheet"

- Check that `GOOGLE_USERS_SHEET_ID` is set in `.env.local`
- Restart your development server after adding the variable

### "User not found"

- Verify the email exists in your Google Sheet
- Check that the email column is spelled correctly (case-insensitive)
- Ensure there are no extra spaces in the email field

### "Your house information is not available"

- Check that the user has a house value in the sheet
- Verify the house value is one of: `akashic`, `karma`, `zen`, `shakti`
- Ensure the house column name matches "House" (case-insensitive)

## Notes

- Column names are case-insensitive (e.g., "Email", "email", "EMAIL" all work)
- Email matching is case-insensitive
- The first sheet (index 0) in your Google Spreadsheet is used
- User data is cached during the API call but not stored long-term
- Only email and house are stored in localStorage

