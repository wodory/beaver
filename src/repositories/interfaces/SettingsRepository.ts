export interface SettingsRepository {
  getSettings(userId: string, type: string): Promise<any>;
  updateSettings(userId: string, type: string, data: any): Promise<void>;
  settingsExist(userId: string, type: string): Promise<boolean>;
} 