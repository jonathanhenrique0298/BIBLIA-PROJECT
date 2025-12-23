
export interface Verse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleBook {
  id: string;
  name: string;
  chapters: number;
}

export type ViewState = 'reader' | 'editor';

export interface SlideConfig {
  verse: Verse;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right';
  backgroundImage?: string;
  wordColors?: Record<number, string>; // Mapeia o índice da palavra para uma cor hexadecimal
  showShadow?: boolean;
}
