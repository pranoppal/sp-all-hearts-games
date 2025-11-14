import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Initialize the sheet
let doc: GoogleSpreadsheet | null = null;
let sheet: any = null;

async function initSheet() {
  if (doc && sheet) {
    return sheet;
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

  doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

  await doc.loadInfo();
  sheet = doc.sheetsByTitle["scores"]; // Use 'scores' sheet

  if (!sheet) {
    throw new Error(
      'Sheet with title "scores" not found. Please ensure a sheet named "scores" exists in your Google Spreadsheet.'
    );
  }

  return sheet;
}

export interface SheetRow {
  email: string;
  house: string;
  game: string;
  duration: number;
  score: number;
}

export async function addScoreToSheet(data: SheetRow) {
  try {
    const sheet = await initSheet();
    await sheet.addRow({
      email: data.email,
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
    const sheet = await initSheet();
    const rows = await sheet.getRows();

    return rows.map((row: any) => ({
      email: row.get("email") || "",
      house: row.get("house") || "",
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
