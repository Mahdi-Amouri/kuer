/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import AnimePage from '../src/components/AnimePage';
import { anilistApi } from '../src/services/anilistApi';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { useTheme } from '../src/hooks/useTheme';
import { useState } from 'react';

//  Integrationstest

vi.mock('../src/services/anilistApi', () => ({
  anilistApi: {
    searchMedia: vi.fn()
  }
}));

const mockedSearchMedia = anilistApi.searchMedia as unknown as ReturnType<typeof vi.fn>;

describe('AnimePage', () => {
  it('zeigt Ergebnisse nach Klick auf Genre-Button', async () => {
    // Mock für initialen Fetch (leere Seite)
    mockedSearchMedia.mockResolvedValueOnce({
      data: {
        Page: {
          media: [],
          pageInfo: { hasNextPage: false }
        }
      }
    });

    // Mock für Genre-Filter-Fetch
    mockedSearchMedia.mockResolvedValueOnce({
      data: {
        Page: {
          media: [
            {
              id: 1,
              title: { english: 'One Piece' },
              coverImage: { large: 'img.jpg' },
              averageScore: 90,
              status: 'RELEASING',
              type: 'ANIME',
              episodes: 1000,
              genres: ['Action'],
              startDate: { year: 1999 }
            }
          ],
          pageInfo: { hasNextPage: false }
        }
      }
    });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <AnimePage />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Genre-Button klicken
    const button = await screen.findByRole('button', { name: 'Action' });
    fireEvent.click(button);

    // "One Piece" wird angezeigt
    await waitFor(() => {
      expect(screen.getByText('One Piece')).toBeInTheDocument();
    });
  });
});



// Unit-Tests 

// Helper-Funktionen für Tests
const getTitle = (media: any): string => {
  return media.title.english || media.title.romaji || media.title.native || 'Unbekannt';
};

const getScore = (score: number | null): string => {
  return score ? `${score}%` : 'N/A';
};

const getStatus = (status: string | null): string => {
  const statusMap: { [key: string]: string } = {
    'FINISHED': 'Beendet',
    'RELEASING': 'Laufend',
    'NOT_YET_RELEASED': 'Noch nicht veröffentlicht',
    'CANCELLED': 'Abgebrochen',
    'HIATUS': 'Pausiert'
  };
  return status ? statusMap[status] || status : 'Unbekannt';
};

describe('AnimePage Helper', () => {
  describe('getTitle', () => {
    it('Titel zurückgeben', () => {
      expect(getTitle({ title: { english: 'Naruto', romaji: 'Naruto', native: 'ナルト' } })).toBe('Naruto');
    });
    it('Romaji Titel falls kein englisch', () => {
      expect(getTitle({ title: { romaji: 'Naruto', native: 'ナルト' } })).toBe('Naruto');
    });
    it('Original Titel', () => {
      expect(getTitle({ title: { native: 'ナルト' } })).toBe('ナルト');
    });
    it('Unbekannt', () => {
      expect(getTitle({ title: {} })).toBe('Unbekannt');
    });
  });

  describe('getScore', () => {
    it('Rating', () => {
      expect(getScore(85)).toBe('85%');
    });
    it('N/A wenn null', () => {
      expect(getScore(null)).toBe('N/A');
    });
  });

  describe('getStatus', () => {
    it('Mapped Status', () => {
      expect(getStatus('FINISHED')).toBe('Beendet');
      expect(getStatus('RELEASING')).toBe('Laufend');
      expect(getStatus('NOT_YET_RELEASED')).toBe('Noch nicht veröffentlicht');
      expect(getStatus('CANCELLED')).toBe('Abgebrochen');
      expect(getStatus('HIATUS')).toBe('Pausiert');
    });
    it('Unbekannt status', () => {
      expect(getStatus('UNKNOWN_STATUS')).toBe('UNKNOWN_STATUS');
    });
    it('Unbekannt null', () => {
      expect(getStatus(null)).toBe('Unbekannt');
    });
  });


  // ThemeContext
  it('isDark light und dark', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    // Anfangszustand
    expect(result.current.isDark).toBe(false);

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.isDark).toBe(true);

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.isDark).toBe(false);
  });

  it('setzt Filter korrekt zurück', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AnimePage />
        </ThemeProvider>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Action' }));

    fireEvent.click(screen.getByRole('button', { name: /Zurücksetzen/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Alle' })).toHaveClass('active');
    });
  });

  it('löst Suche aus bei Eingabe', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AnimePage />
        </ThemeProvider>
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Titel eingeben/i);
    fireEvent.change(input, { target: { value: 'Naruto' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(mockedSearchMedia).toHaveBeenCalledWith(expect.objectContaining({ search: 'Naruto' }));
    });
  });

  it('schaltet zwischen Anime und Manga um', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AnimePage />
        </ThemeProvider>
      </MemoryRouter>
    );

    const mangaButton = screen.getByRole('button', { name: /Manga/i });
    fireEvent.click(mangaButton);
    await waitFor(() => {
      expect(mangaButton).toHaveClass('active');
    });
  });

  it('zeigt Ladeanzeige an', async () => {
    mockedSearchMedia.mockReturnValue(new Promise(() => { })); // never resolves
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AnimePage />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Lade/)).toBeInTheDocument();
  });

  it('zeigt Fehlermeldung', async () => {
    mockedSearchMedia.mockRejectedValue(new Error('Netzwerkfehler'));
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AnimePage />
        </ThemeProvider>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Netzwerkfehler/)).toBeInTheDocument();
    });
  });

});

