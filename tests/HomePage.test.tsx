/// <reference types="vitest/globals" />
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import HomePage from '../src/components/HomePage';
import { anilistApi } from '../src/services/anilistApi';
import { MediaType, Media } from '../src/types/anilist';

vi.mock('../src/services/anilistApi');

(globalThis as any).IntersectionObserver = class {
    observe() { }
    disconnect() { }
    unobserve() { }
};

export const mockAnime: Media = {
    id: 1,
    title: {
        romaji: 'Shingeki no Kyojin',
        english: 'Attack on Titan',
        native: '進撃の巨人'
    },
    description: 'Menschen kämpfen gegen riesige Titanen.',
    coverImage: {
        extraLarge: 'https://example.com/anime-extra-large.jpg',
        large: 'https://example.com/anime-large.jpg',
        medium: 'https://example.com/anime-medium.jpg',
        color: '#FF0000'
    },
    bannerImage: 'https://example.com/banner.jpg',
    genres: ['Action', 'Drama'],
    averageScore: 89,
    episodes: 75,
    chapters: null,
    volumes: null,
    status: 'FINISHED',
    type: MediaType.ANIME,
    format: 'TV',
    startDate: {
        year: 2013,
        month: 4,
        day: 6
    },
    tags: [],
    meanScore: null,
    source: null,
    season: null,
    seasonYear: null,
    popularity: null,
    trending: null,
    favourites: null,
    endDate: null,
    studios: {
        nodes: []
    }
};

export const mockManga: Media = {
    id: 2,
    title: {
        romaji: 'Berserk',
        english: 'Berserk',
        native: 'ベルセルク'
    },
    description: 'Dunkle Fantasy rund um Rache und Schicksal.',
    coverImage: {
        extraLarge: 'https://example.com/manga-extra-large.jpg',
        large: 'https://example.com/manga-large.jpg',
        medium: 'https://example.com/manga-medium.jpg',
        color: '#000000'
    },
    bannerImage: 'https://example.com/manga-banner.jpg',
    genres: ['Action', 'Fantasy', 'Horror'],
    averageScore: 95,
    episodes: null,
    chapters: 364,
    volumes: 41,
    status: 'RELEASING',
    type: MediaType.MANGA,
    format: 'MANGA',
    startDate: {
        year: 1989,
        month: 8,
        day: 25
    },
    tags: [],
    meanScore: null,
    source: null,
    season: null,
    seasonYear: null,
    popularity: null,
    trending: null,
    favourites: null,
    endDate: null,
    studios: {
        nodes: []
    }
};


// UI-Integrations-Tests

describe('HomePage', () => {
    beforeEach(() => {
        (anilistApi.getTopMedia as unknown as ReturnType<typeof vi.fn>).mockReset();
    });

    it('zeigt Ladezustand', async () => {
        (anilistApi.getTopMedia as any)
            .mockResolvedValueOnce({ data: { Page: { media: [mockAnime], pageInfo: {} } } }) // Anime
            .mockResolvedValueOnce({ data: { Page: { media: [mockManga], pageInfo: {} } } }); // Manga

        render(
            <MemoryRouter>
                <ThemeProvider>
                    <HomePage />
                </ThemeProvider>
            </MemoryRouter>
        );


        // Warten bis ein Anime-Titel erscheint
        await waitFor(() => {
            expect(screen.getByText('Shingeki no Kyojin')).toBeInTheDocument();
        });

        // Ladeanzeige ist nicht mehr da
        expect(screen.queryByText(/lade/i)).not.toBeInTheDocument();
    });


    it('zeigt Kategorien-Links korrekt', async () => {
        (anilistApi.getTopMedia as any)
            .mockResolvedValueOnce({ data: { Page: { media: [], pageInfo: {} } } })
            .mockResolvedValueOnce({ data: { Page: { media: [], pageInfo: {} } } });

        render(
            <MemoryRouter>
                <ThemeProvider>
                    <HomePage />
                </ThemeProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Romance')).toBeInTheDocument();
            expect(screen.getByText('Fantasy')).toBeInTheDocument();
        });
    });

    it('zeigt Buttons für Anime und Manga Suche', async () => {
        (anilistApi.getTopMedia as any)
            .mockResolvedValueOnce({ data: { Page: { media: [], pageInfo: {} } } })
            .mockResolvedValueOnce({ data: { Page: { media: [], pageInfo: {} } } });

        render(
            <MemoryRouter>
                <ThemeProvider>
                    <HomePage />
                </ThemeProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            const animeLinks = screen.getAllByRole('link', { name: /Anime Entdecken/i });
            expect(animeLinks[0]).toHaveAttribute('href', '/anime');
            // Prüfe Alle
            expect(animeLinks.some(link => link.getAttribute('href') === '/anime')).toBe(true);
        });
    });

    it('zeigt Fehlermeldung bei API-Fehler', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        (anilistApi.getTopMedia as any).mockRejectedValue(new Error('API Error'));

        render(
            <MemoryRouter>
                <ThemeProvider>
                    <HomePage />
                </ThemeProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(errorSpy).toHaveBeenCalled();
        });

        errorSpy.mockRestore();
    });

    it('Top Anime mit Titel, Bild und Link', async () => {
        (anilistApi.getTopMedia as any)
            .mockResolvedValueOnce({ data: { Page: { media: [mockAnime] } } }) // Anime
            .mockResolvedValueOnce({ data: { Page: { media: [] } } }); // Manga

        render(
            <MemoryRouter>
                <ThemeProvider>
                    <HomePage />
                </ThemeProvider>
            </MemoryRouter>
        );

        // Warten, bis der Titel gerendert wurde
        await waitFor(() => {
            expect(screen.getByText('Shingeki no Kyojin')).toBeInTheDocument();
        });

        const image = screen.getByAltText('Shingeki no Kyojin') as HTMLImageElement;
        expect(image).toBeInTheDocument();
        expect(image.src).toContain('anime-large.jpg');

        const link = screen.getByRole('link', {
            name: /Shingeki no Kyojin/i,
        });
        expect(link).toHaveAttribute('href', '/media/1');

        expect(screen.getByText(/89%/)).toBeInTheDocument();

        expect(screen.getByText(/📺 75 Ep\./)).toBeInTheDocument();
        expect(screen.getByText(/📅 2013/)).toBeInTheDocument();
    });

});


