import { promises as fs } from "fs";
import path from "path";
import { Word, GameSession } from "@/types";

const dataDir = path.join(process.cwd(), "data", "crossword");
const wordsFile = path.join(dataDir, "words.json");
const sessionsFile = path.join(dataDir, "sessions.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

// Words storage
export async function getWords(): Promise<Word[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(wordsFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function saveWords(words: Word[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(wordsFile, JSON.stringify(words, null, 2));
}

export async function addWord(word: Word): Promise<Word> {
  const words = await getWords();
  words.push(word);
  await saveWords(words);
  return word;
}

export async function deleteWord(id: string): Promise<void> {
  const words = await getWords();
  const filtered = words.filter((w) => w.id !== id);
  await saveWords(filtered);
}

// Sessions storage
export async function getSessions(): Promise<GameSession[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(sessionsFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function saveSessions(sessions: GameSession[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(sessionsFile, JSON.stringify(sessions, null, 2));
}

export async function addSession(session: GameSession): Promise<GameSession> {
  const sessions = await getSessions();
  sessions.push(session);
  await saveSessions(sessions);
  return session;
}

export async function updateSession(
  id: string,
  updates: Partial<GameSession>
): Promise<GameSession | null> {
  const sessions = await getSessions();
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return null;

  sessions[index] = { ...sessions[index], ...updates };
  await saveSessions(sessions);
  return sessions[index];
}

