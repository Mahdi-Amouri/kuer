import { anilistApi } from '../src/services/anilistApi';
import { MediaType } from '../src/types/anilist';
import  getMediaById from '../src/services/anilistApi';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('anilistApi', () => {
    beforeEach(() => {
        mockFetch.mockReset();
        globalThis.fetch = mockFetch;
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('gibt Daten aus searchMedia zurück', async () => {
        const mockResponse = {
            data: {
                Page: {
                    media: [],
                    pageInfo: { hasNextPage: false }
                }
            }
        };

        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const data = await anilistApi.searchMedia({ page: 1, perPage: 10, type: MediaType.ANIME });
        expect(data).toEqual(mockResponse);
        expect(fetch).toHaveBeenCalledTimes(1);
    });


    it('ruft getMediaById auf und gibt Daten zurück', async () => {
        const mockMedia = {
            data: {
                Media: {
                    id: 1,
                    title: { english: 'Test Anime' }
                }
            }
        };

        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockMedia
        });

        const data = await anilistApi.getMediaById(1);
        expect(data).toEqual(mockMedia);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('ruft getTopMedia auf und gibt Daten zurück', async () => {
        const mockTop = {
            data: {
                Page: {
                    media: [],
                    pageInfo: { hasNextPage: false }
                }
            }
        };

        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockTop
        });

        const data = await anilistApi.getTopMedia(MediaType.ANIME);
        expect(data).toEqual(mockTop);
    });


    it('versucht mehrfach bei Netzwerkfehler und scheitert am Ende', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        mockFetch.mockRejectedValue(new Error('Netzwerkproblem'));

        await expect(anilistApi.searchMedia({
            page: 1,
            perPage: 10,
            type: MediaType.ANIME,
        })).rejects.toThrow('Netzwerkproblem');

        expect(mockFetch).toHaveBeenCalledTimes(3);
        expect(warnSpy).toHaveBeenCalledTimes(3);

        warnSpy.mockRestore();
    });

});
