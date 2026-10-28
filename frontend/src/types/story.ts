export type SettingChoice =
  | 'Haunted Mansion'
  | 'Abandoned Hospital'
  | 'Cursed Village'
  | 'Forgotten Asylum'
  | 'Dark Forest';

export type HorrorLevel = 'Psychological' | 'Supernatural' | 'Nightmare';

export type StoryLength = 'Short' | 'Medium' | 'Long';

export interface StorySetup {
  setting: SettingChoice;
  horror_level: HorrorLevel;
  story_length: StoryLength;
  protagonist_name?: string;
}

export interface StoryChoice {
  id: string;
  text: string;
  risk_level?: 'low' | 'moderate' | 'high' | 'fatal' | string;
}

export interface StoryMemory {
  protagonist?: string;
  setting?: string;
  clues: string[];
  scars_or_state: string[];
  decisions: string[];
  [key: string]: unknown;
}

export interface StoryEnding {
  title: string;
  ending_type: string;
  summary: string;
  final_narrative: string;
  unresolved_mysteries?: string[];
}

export interface SceneResponse {
  story_id: string;
  title: string;
  scene_number: number;
  narrative: string;
  choices: StoryChoice[];
  memory: StoryMemory;
  is_ending: boolean;
  ending?: StoryEnding | null;
}

export interface StoryAdvanceRequest {
  story_id: string;
  choice_id?: string | null;
  custom_action?: string | null;
}

export interface SceneHistoryItem {
  scene_number: number;
  narrative: string;
  chosen_text?: string;
  chosen_id?: string | null;
  custom_action?: string | null;
}

export interface StorySession {
  story_id: string;
  title: string;
  setup: StorySetup;
  current_scene: SceneResponse;
  history: SceneHistoryItem[];
  started_at: string;
  rating?: number | null;
}

export interface ApiHealthResponse {
  status: string;
  model?: string;
  model_configured?: boolean;
  [key: string]: unknown;
}

export interface ApiError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
  details?: unknown;
}
