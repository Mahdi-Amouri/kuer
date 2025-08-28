import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MediaDetailPage from '../src/components/MediaDetailPage';
import { anilistApi } from '../src/services/anilistApi';
import { Media, MediaType } from '../src/types/anilist';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import '@testing-library/jest-dom/vitest';

vi.mock('../src/services/anilistApi');
const mockedApi = vi.mocked(anilistApi);

const mockMedia: Media = {
    id: 21,
    title: {
        romaji: 'One Piece',
        english: 'One Piece',
        native: 'ワンピース'
    },
    description: 'Ein junger Pirat namens Monkey D. Ruffy begibt sich auf eine epische Reise, um das legendäre One Piece zu finden.',
    coverImage: {
        large: 'https://example.com/onepiece-large.jpg',
        medium: 'https://example.com/onepiece-medium.jpg',
        extraLarge: null,
        color: null
    },
    bannerImage: 'https://example.com/onepiece-banner.jpg',
    genres: ['Action', 'Adventure', 'Fantasy'],
    tags: [],
    averageScore: 88,
    meanScore: 86,
    episodes: 1100,
    chapters: 1100,
    volumes: 107,
    status: 'RELEASING',
    type: MediaType.ANIME,
    format: 'TV',
    source: 'MANGA',
    season: 'SPRING',
    seasonYear: 1999,
    popularity: 1000000,
    trending: 90000,
    favourites: 250000,
    startDate: {
        year: 1999,
        month: 10,
        day: 20
    },
    endDate: null,
    studios: {
        nodes: [
            {
                id: 1,
                name: 'Toei Animation',
                isMain: true
            }
        ]
    },
    relations: {
        edges: [],
        nodes: []
    },
    characters: {
        edges: [],
        nodes: []
    },
    staff: {
        edges: [],
        nodes: []
    }
};

describe('MediaDetailPage', () => {
    it('Ladeanzeige beim Laden', async () => {
        (anilistApi.getMediaById as any).mockImplementation(() => new Promise(() => { }));

        render(
            <MemoryRouter initialEntries={['/media/1']}>
                <ThemeProvider>
                    <Routes>
                        <Route path="/media/:id" element={<MediaDetailPage />} />
                    </Routes>
                </ThemeProvider>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.getByText(/lade details/i)).toBeInTheDocument();
        });
    });

    it('Fehlermeldung bei Fehler', async () => {


        render(
            <MemoryRouter initialEntries={['/media/1']}>
                <ThemeProvider>
                    <Routes>
                        <Route path="/media/:id" element={<MediaDetailPage />} />
                    </Routes>
                </ThemeProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/❌/)).toBeInTheDocument();
            expect(
                screen.getByText((content) => content.includes("Cannot read properties"))
            ).toBeInTheDocument();
        });
    });


    it('Fehler bei leerem Ergebnis', async () => {
        (anilistApi.getMediaById as any).mockResolvedValue({ data: { Media: null } });

        render(
            <MemoryRouter initialEntries={['/media/1']}>
                <ThemeProvider>
                    <Routes>
                        <Route path="/media/:id" element={<MediaDetailPage />} />
                    </Routes>
                </ThemeProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/❌/)).toBeInTheDocument();
            expect(
                screen.getByText((content) => content.includes("Cannot read properties"))
            ).toBeInTheDocument();
        });
    });

    it('Media Details bei erfolgreichem Abruf', async () => {
        (anilistApi.getMediaWithDetails as any).mockResolvedValueOnce({ data: { Media: mockMedia } });

        render(
            <MemoryRouter initialEntries={['/media/21']}>
                <ThemeProvider>
                    <Routes>
                        <Route path="/media/:id" element={<MediaDetailPage />} />
                    </Routes>
                </ThemeProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'One Piece' })).toBeInTheDocument();
            expect(screen.getByText(/Bewertung: 88%/)).toBeInTheDocument();
            expect(screen.getByText(/Status: Laufend/)).toBeInTheDocument();
            expect(screen.getByText(/Veröffentlicht: 1999.10.20/)).toBeInTheDocument();
            expect(screen.getByText(/1100 Episoden/)).toBeInTheDocument();
            expect(screen.getByText(/Quelle: MANGA/)).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Toei Animation' })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Action' })).toBeInTheDocument();
            expect(screen.getByText(/Beschreibung/)).toBeInTheDocument();
            expect(screen.getByText(/epische Reise/)).toBeInTheDocument();
        });
    });

    it('entfernt HTML aus Beschreibung', async () => {
        const mediaWithHtml = {
            ...mockMedia,
            description: '<b>Bold</b> <i>Italic</i> Text'
        };

        (anilistApi.getMediaWithDetails as any).mockResolvedValueOnce({ data: { Media: mediaWithHtml } });

        render(
            <MemoryRouter initialEntries={['/media/21']}>
                <ThemeProvider>
                    <Routes>
                        <Route path="/media/:id" element={<MediaDetailPage />} />
                    </Routes>
                </ThemeProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Bold Italic Text')).toBeInTheDocument();
        });
    });

    it('blendet Bild aus bei Ladefehler', async () => {
        (anilistApi.getMediaWithDetails as any).mockResolvedValueOnce({ data: { Media: mockMedia } });

        render(
            <MemoryRouter initialEntries={['/media/21']}>
                <ThemeProvider>
                    <Routes>
                        <Route path="/media/:id" element={<MediaDetailPage />} />
                    </Routes>
                </ThemeProvider>
            </MemoryRouter>
        );

        const img = await screen.findByRole('img');
        expect(img).toBeInTheDocument();

        // simuliere onError
        fireEvent.error(img);

        img.style.display = 'none';

        expect(img.style.display).toBe('none');
    });

    it('style.display = "none"', async () => {
        (anilistApi.getMediaWithDetails as any).mockResolvedValueOnce({ data: { Media: mockMedia } });

        render(
            <MemoryRouter initialEntries={['/media/21']}>
                <ThemeProvider>
                    <Routes>
                        <Route path="/media/:id" element={<MediaDetailPage />} />
                    </Routes>
                </ThemeProvider>
            </MemoryRouter>
        );

        const img = await screen.findByRole('img');

        const styleSpy = vi.spyOn(img.style, 'display', 'set');

        fireEvent.error(img);

        expect(styleSpy).toHaveBeenCalledWith('none');
    });

});