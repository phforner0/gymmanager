import { User, Visit } from '../types';

/**
 * Storage Service - Gerencia dados em memória
 * IMPORTANTE: Não usa localStorage conforme requisitos do Claude.ai
 */
class StorageService {
  private theme: string = 'light';
  private user: User | null = null;
  private visits: Visit[] = [];

  // ============ THEME ============
  getTheme(): string {
    return this.theme;
  }

  setTheme(theme: string): void {
    this.theme = theme;
  }

  // ============ USER ============
  getUser(): User | null {
    return this.user;
  }

  setUser(user: User): void {
    this.user = user;
  }

  clearUser(): void {
    this.user = null;
  }

  // ============ VISITS ============
  getVisits(): Visit[] {
    return [...this.visits];
  }

  addVisit(visit: Visit): void {
    this.visits.push(visit);
  }

  // ============ EXPORT/IMPORT ============
  exportData(): string {
    return JSON.stringify({
      theme: this.theme,
      user: this.user,
      visits: this.visits
    }, null, 2);
  }

  importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.theme) this.theme = parsed.theme;
      if (parsed.user) this.user = parsed.user;
      if (parsed.visits) this.visits = parsed.visits;
      return true;
    } catch {
      return false;
    }
  }

  // ============ RESET ============
  reset(): void {
    this.theme = 'light';
    this.user = null;
    this.visits = [];
  }
}

// Singleton instance
export const storageService = new StorageService();