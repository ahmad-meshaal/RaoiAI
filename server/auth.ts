import { scryptSync, randomBytes } from "crypto";
import { storage } from "./storage";
import { type User } from "@shared/schema";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  const [salt, originalHash] = hash.split(":");
  const newHash = scryptSync(password, salt, 64).toString("hex");
  return newHash === originalHash;
}

export async function registerUser(username: string, email: string, password: string): Promise<User> {
  const existing = await storage.getUserByUsername(username);
  if (existing) throw new Error("Username already exists");

  const existingEmail = await storage.getUserByEmail(email);
  if (existingEmail) throw new Error("Email already exists");

  const passwordHash = hashPassword(password);
  return storage.createUser({ username, email, passwordHash });
}

export async function loginUser(username: string, password: string): Promise<User | null> {
  const user = await storage.getUserByUsername(username);
  if (!user) return null;

  const isValid = verifyPassword(password, user.passwordHash);
  return isValid ? user : null;
}
