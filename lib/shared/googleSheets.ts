import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Initialize the sheet
let doc: GoogleSpreadsheet | null = null;
let docInitPromise: Promise<GoogleSpreadsheet> | null = null;
let scoresSheet: any = null;
let timingsSheet: any = null;

// Initialize users sheet (separate document)
let usersDoc: GoogleSpreadsheet | null = null;
let usersDocInitPromise: Promise<GoogleSpreadsheet> | null = null;
let usersSheet: any = null;

async function initDoc() {
  if (doc) {
    return doc;
  }

  // If initialization is already in progress, wait for it
  if (docInitPromise) {
    return docInitPromise;
  }

  const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
  const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!SPREADSHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error("Missing Google Sheets environment variables");
  }

  const serviceAccountAuth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  // Store the initialization promise
  docInitPromise = (async () => {
    const newDoc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await newDoc.loadInfo();
    doc = newDoc;
    return newDoc;
  })();

  return docInitPromise;
}

async function initScoresSheet() {
  if (scoresSheet) {
    return scoresSheet;
  }

  const spreadsheet = await initDoc();
  scoresSheet = spreadsheet.sheetsByTitle["scores"];

  if (!scoresSheet) {
    throw new Error(
      'Sheet with title "scores" not found. Please ensure a sheet named "scores" exists in your Google Spreadsheet.'
    );
  }

  return scoresSheet;
}

async function initTimingsSheet() {
  if (timingsSheet) {
    return timingsSheet;
  }

  const spreadsheet = await initDoc();
  timingsSheet = spreadsheet.sheetsByTitle["game-timings"];

  if (!timingsSheet) {
    throw new Error(
      'Sheet with title "game-timings" not found. Please ensure a sheet named "game-timings" exists in your Google Spreadsheet.'
    );
  }

  return timingsSheet;
}

// Initialize users sheet from separate document
async function initUsersDoc() {
  if (usersDoc) {
    return usersDoc;
  }

  // If initialization is already in progress, wait for it
  if (usersDocInitPromise) {
    return usersDocInitPromise;
  }

  const USERS_SPREADSHEET_ID = process.env.GOOGLE_USERS_SHEET_ID;
  const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (
    !USERS_SPREADSHEET_ID ||
    !GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    !GOOGLE_PRIVATE_KEY
  ) {
    throw new Error(
      "Missing Google Sheets environment variables for users sheet"
    );
  }

  const serviceAccountAuth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  // Store the initialization promise
  usersDocInitPromise = (async () => {
    const newDoc = new GoogleSpreadsheet(
      USERS_SPREADSHEET_ID,
      serviceAccountAuth
    );
    await newDoc.loadInfo();
    usersDoc = newDoc;
    return newDoc;
  })();

  return usersDocInitPromise;
}

async function initUsersSheet() {
  if (usersSheet) {
    return usersSheet;
  }

  const spreadsheet = await initUsersDoc();
  // Assuming the first sheet contains user data, or you can specify a title
  usersSheet = spreadsheet.sheetsByIndex[0];

  if (!usersSheet) {
    throw new Error(
      "Users sheet not found. Please ensure the users sheet exists in your Google Spreadsheet."
    );
  }

  return usersSheet;
}

export interface SheetRow {
  email: string;
  house: string;
  name: string;
  game: string;
  duration: number;
  score: number;
}

export async function addScoreToSheet(data: SheetRow) {
  try {
    const sheet = await initScoresSheet();
    await sheet.addRow({
      email: data.email,
      name: data.name,
      house: data.house,
      game: data.game,
      duration: data.duration,
      score: data.score,
    });
    return true;
  } catch (error) {
    console.error("Error adding score to sheet:", error);
    throw error;
  }
}

export async function getScoresFromSheet(): Promise<SheetRow[]> {
  try {
    const sheet = await initScoresSheet();
    const rows = await sheet.getRows();

    return rows.map((row: any) => ({
      email: row.get("email") || "",
      house: row.get("house") || "",
      name: row.get("name") || "",
      game: row.get("game") || "",
      duration: parseInt(row.get("duration")) || 0,
      score: parseInt(row.get("score")) || 0,
    }));
  } catch (error) {
    console.error("Error getting scores from sheet:", error);
    return [];
  }
}

export async function getScoresByGame(game: string): Promise<SheetRow[]> {
  const allScores = await getScoresFromSheet();
  return allScores.filter((score) => score.game === game);
}

export async function getScoresByHouse(house: string): Promise<SheetRow[]> {
  const allScores = await getScoresFromSheet();
  return allScores.filter((score) => score.house === house);
}

export async function getScoresByEmail(email: string): Promise<SheetRow[]> {
  const allScores = await getScoresFromSheet();
  return allScores.filter((score) => score.email === email);
}

// User Data interfaces and functions
export interface UserData {
  category: string;
  name: string;
  gender: string;
  email: string;
  supportingIn: string;
  house: string;
}

export async function getUserByEmail(email: string): Promise<UserData | null> {
  try {
    const sheet = await initUsersSheet();
    const rows = await sheet.getRows();
    console.log('rows length', rows.length);
    console.log('rows', rows);

    // Search for user by email (case-insensitive)
    const userRow = rows.find((row: any) => {
      const rowEmail = row.get("Email") || row.get("email") || "";
      return rowEmail.toLowerCase() === email.toLowerCase();
    });

    if (!userRow) {
      return null;
    }

    return {
      category: userRow.get("Category") || userRow.get("category") || "",
      name: userRow.get("Name") || userRow.get("name") || "",
      gender: userRow.get("Gender") || userRow.get("gender") || "",
      email: userRow.get("Email") || userRow.get("email") || "",
      supportingIn:
        userRow.get("Supporting In") || userRow.get("supporting in") || "",
      house: userRow.get("House") || userRow.get("house") || "",
    };
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}

export async function getAllUsers(): Promise<UserData[]> {
  try {
    const sheet = await initUsersSheet();
    const rows = await sheet.getRows();

    return rows.map((row: any) => ({
      category: row.get("Category") || row.get("category") || "",
      name: row.get("Name") || row.get("name") || "",
      gender: row.get("Gender") || row.get("gender") || "",
      email: row.get("Email") || row.get("email") || "",
      supportingIn: row.get("Supporting In") || row.get("supporting in") || "",
      house: row.get("House") || row.get("house") || "",
    }));
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
}

// Game Timings interfaces and functions
export interface GameTiming {
  game: string;
  start: Date;
  end: Date;
}

export async function getGameTimings(): Promise<GameTiming[]> {
  try {
    const sheet = await initTimingsSheet();
    const rows = await sheet.getRows();

    return rows.map((row: any) => {
      const game = row.get("Game") || row.get("game") || "";
      const startStr = row.get("Start") || row.get("start") || "";
      const endStr = row.get("End") || row.get("end") || "";

      return {
        game: game.toLowerCase(),
        start: new Date(startStr),
        end: new Date(endStr),
      };
    });
  } catch (error) {
    console.error("Error getting game timings:", error);
    return [];
  }
}

export async function getGameTiming(
  gameName: string
): Promise<GameTiming | null> {
  const timings = await getGameTimings();
  return timings.find((t) => t.game === gameName.toLowerCase()) || null;
}

export function isGameActive(timing: GameTiming): boolean {
  const now = new Date();
  return now >= timing.start && now <= timing.end;
}

export function isGameUpcoming(timing: GameTiming): boolean {
  const now = new Date();
  return now < timing.start;
}

export function isGameEnded(timing: GameTiming): boolean {
  const now = new Date();
  return now > timing.end;
}

export function getTimeUntilStart(timing: GameTiming): number {
  const now = new Date();
  return Math.max(0, timing.start.getTime() - now.getTime());
}

export function getTimeUntilEnd(timing: GameTiming): number {
  const now = new Date();
  return Math.max(0, timing.end.getTime() - now.getTime());
}
