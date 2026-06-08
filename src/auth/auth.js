import { USERS } from '../data/seed.js';
import { saveSession, clearSession, getSession } from '../data/storage.js';

export function login(email, password) {
  const user = USERS.find(
    item => item.email === email && item.password === password
  );

  if (!user) return null;

  const safeUser = {
    name: user.name,
    email: user.email,
    role: user.role,
  };

  saveSession(safeUser);
  return safeUser;
}

export function logout() {
  clearSession();
  location.reload();
}

export function currentUser() {
  return getSession();
}

export function isAdmin() {
  return currentUser()?.role === 'admin';
}