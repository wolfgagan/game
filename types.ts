
export interface GameState {
  characterName: string;
  health: number;
  mana: number;
  inventory: string[];
  location: string;
  history: GameLogEntry[];
}

export interface GameLogEntry {
  type: 'narrative' | 'action' | 'system';
  content: string;
  image?: string;
}

export interface GameActionResponse {
  narrative: string;
  imagePrompt: string;
  healthChange: number;
  manaChange: number;
  newInventoryItems: string[];
  lostInventoryItems: string[];
  location: string;
}
