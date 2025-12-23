
import { Verse } from '../types';

// Usando a API bible-api.com com a tradução Almeida
export const fetchChapter = async (bookId: string, bookName: string, chapter: number): Promise<Verse[]> => {
  try {
    const response = await fetch(`https://bible-api.com/${bookId}+${chapter}?translation=almeida`);
    if (!response.ok) throw new Error('Falha ao carregar capítulo');
    const data = await response.json();
    
    // Prioriza o nome do livro vindo do nosso app (BOOKS) se a API falhar em prover um nome amigável
    const finalBookName = bookName || data.book_name || bookId;
    const verses = Array.isArray(data.verses) ? data.verses : [];

    return verses.map((v: any) => ({
      book_id: bookId,
      book_name: finalBookName,
      chapter: v.chapter || chapter,
      verse: v.verse || 0,
      text: v.text || ''
    }));
  } catch (error) {
    console.error('Erro ao buscar dados da Bíblia:', error);
    return [];
  }
};
