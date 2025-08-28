import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { anilistApi } from '../services/anilistApi';
import { MediaType, MediaFormat, MediaStatus, MediaSeason } from '../types/anilist';
import type { Media } from '../types/anilist';
import ThemeToggle from './ThemeToggle';
import './AnimePage.css';

const AnimePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [perPage] = useState(20);

  // Filter-Zustand
  const [activeType, setActiveType] = useState<string>(
    searchParams.get('type') || MediaType.ANIME
  );
  const [selectedGenre, setSelectedGenre] = useState<string>(
    searchParams.get('genre') || ''
  );
  const [selectedFormat, setSelectedFormat] = useState<string>(
    searchParams.get('format') || ''
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    searchParams.get('status') || ''
  );
  const [selectedSeason, setSelectedSeason] = useState<string>(
    searchParams.get('season') || ''
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    searchParams.get('year') || ''
  );
  const [selectedStudio, setSelectedStudio] = useState<string>(
    searchParams.get('studio') || ''
  );

  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural',
    'Thriller', 'Psychological', 'Mecha', 'Music', 'School', 'Historical'
  ];

  // Nur die beliebtesten Genres als Buttons
  const popularGenres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 'Romance', 'Sci-Fi', 'Slice of Life'
  ];

  const animeFormats = [
    { value: MediaFormat.TV, label: 'TV' },
    { value: MediaFormat.TV_SHORT, label: 'TV Short' },
    { value: MediaFormat.MOVIE, label: 'Film' },
    { value: MediaFormat.SPECIAL, label: 'Special' },
    { value: MediaFormat.OVA, label: 'OVA' },
    { value: MediaFormat.ONA, label: 'ONA' },
    { value: MediaFormat.MUSIC, label: 'Musik' }
  ];

  const mangaFormats = [
    { value: MediaFormat.MANGA, label: 'Manga' },
    { value: MediaFormat.NOVEL, label: 'Light Novel' },
    { value: MediaFormat.ONE_SHOT, label: 'One Shot' }
  ];

  const statusOptions = [
    { value: MediaStatus.FINISHED, label: 'Beendet' },
    { value: MediaStatus.RELEASING, label: 'Laufend' },
    { value: MediaStatus.NOT_YET_RELEASED, label: 'Noch nicht veröffentlicht' },
    { value: MediaStatus.CANCELLED, label: 'Abgebrochen' },
    { value: MediaStatus.HIATUS, label: 'Pausiert' }
  ];

  const seasonOptions = [
    { value: MediaSeason.WINTER, label: 'Winter' },
    { value: MediaSeason.SPRING, label: 'Frühling' },
    { value: MediaSeason.SUMMER, label: 'Sommer' },
    { value: MediaSeason.FALL, label: 'Herbst' }
  ];



  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear + 1; year >= 1960; year--) {
      years.push(year.toString());
    }
    return years;
  };

  // Daten laden
  const loadMedia = async (page: number = 1, reset: boolean = true) => {
    try {
      setLoading(true);
      setError(null);

      const variables: Record<string, unknown> = {
        page,
        perPage,
        type: activeType as MediaType,
        sort: ['POPULARITY_DESC', 'SCORE_DESC']
      };

      // Studio-Suche hat spezielle Behandlung
      let response;
      if (selectedStudio) {
        response = await anilistApi.getMediaByStudio(selectedStudio, activeType as MediaType, page);
      } else {
        if (searchTerm) variables.search = searchTerm;
        if (selectedGenre) variables.genre_in = [selectedGenre];
        if (selectedFormat) variables.format_in = [selectedFormat];
        if (selectedStatus) variables.status_in = [selectedStatus];
        if (selectedSeason) variables.season = selectedSeason;
        if (selectedYear) variables.seasonYear = parseInt(selectedYear);

        response = await anilistApi.searchMedia(variables);
      }

      const newMedia = response.data.Page.media;
      const filteredMedia = newMedia;

      if (reset) {
        setMedia(filteredMedia);
      } else {
        setMedia(prev => [...prev, ...filteredMedia]);
      }

      setHasNextPage(response.data.Page.pageInfo.hasNextPage);
      setTotalPages(response.data.Page.pageInfo.lastPage || 0);
      setTotalResults(response.data.Page.pageInfo.total || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  // URL-Parameter aktualisieren
  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (activeType !== MediaType.ANIME) params.set('type', activeType);
    if (selectedGenre) params.set('genre', selectedGenre);
    if (selectedFormat) params.set('format', selectedFormat);
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedSeason) params.set('season', selectedSeason);
    if (selectedYear) params.set('year', selectedYear);
    if (selectedStudio) params.set('studio', selectedStudio);
    if (searchTerm) params.set('search', searchTerm);
    setSearchParams(params);
  };

  // Filter-Handler
  const handleTypeChange = (type: string) => {
    setActiveType(type);
    setSelectedFormat(''); // Reset format when changing type
    setCurrentPage(1);
    setMedia([]);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'genre':
        setSelectedGenre(value === selectedGenre ? '' : value);
        break;
      case 'format':
        setSelectedFormat(value === selectedFormat ? '' : value);
        break;
      case 'status':
        setSelectedStatus(value === selectedStatus ? '' : value);
        break;
      case 'season':
        setSelectedSeason(value === selectedSeason ? '' : value);
        break;
      case 'year':
        setSelectedYear(value === selectedYear ? '' : value);
        break;
      case 'studio':
        setSelectedStudio(value === selectedStudio ? '' : value);
        break;
    }
    setCurrentPage(1);
    setMedia([]);
  };

  // Suche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setMedia([]);
  };

  // Filter zurücksetzen
  const resetFilters = () => {
    setSelectedGenre('');
    setSelectedFormat('');
    setSelectedStatus('');
    setSelectedSeason('');
    setSelectedYear('');
    setSelectedStudio('');
    setSearchTerm('');
    setCurrentPage(1);
    setMedia([]);
  };

  // Mehr laden
  const loadMore = () => {
    loadMedia(currentPage + 1, false);
  };

  // Effekte
  useEffect(() => {
    updateSearchParams();
    loadMedia(1, true);
  }, [activeType, selectedGenre, selectedFormat, selectedStatus, selectedSeason, selectedYear, selectedStudio, searchTerm]);

  // Helper-Funktionen
  const getTitle = (media: Media): string => {
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



  return (
    <div className="anime-page">
      <ThemeToggle />
      
      <header className="page-header">
        <div className="container">
          <div className="header-nav">
            <Link to="/" className="back-button">
              🏠
              <span>← Zurück zur Startseite</span>
            </Link>
          </div>
          <h1>
            {activeType === MediaType.ANIME ? '🎌 Anime' : '📚 Manga'} Entdecken
          </h1>
        </div>
      </header>

      <div className="container">
        {/* Filter-Sektion */}
        <section className="filters-section">
          <div className="filters-header">
            <h2>🔍 Filter & Suche</h2>
            <button onClick={resetFilters} className="reset-btn-compact">
              🗑️ Zurücksetzen
            </button>
          </div>

          {/* Typ & Suche - Haupt-Filter */}
          <div className="main-filters">
            <div className="type-search-group">
              <div className="type-filter-group">
                <label className="filter-label">Typ auswählen</label>
                <div className="type-filters">
                  <button
                    className={`filter-btn ${activeType === MediaType.ANIME ? 'active' : ''}`}
                    onClick={() => handleTypeChange(MediaType.ANIME)}
                  >
                    🎌 Anime
                  </button>
                  <button
                    className={`filter-btn ${activeType === MediaType.MANGA ? 'active' : ''}`}
                    onClick={() => handleTypeChange(MediaType.MANGA)}
                  >
                    📚 Manga
                  </button>
                </div>
              </div>

              <div className="search-filter-group">
                <label className="filter-label">Titel suchen</label>
                <form onSubmit={handleSearch} className="search-form">
                  <input
                    type="text"
                    placeholder={`${activeType === MediaType.ANIME ? 'Anime' : 'Manga'} Titel eingeben...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <button type="submit" className="search-btn">
                    🔍
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Genre-Filter - Besonders hervorgehoben */}
          <div className="genre-filter-section">
            <div className="filter-section-header">
              <h3>🎭 Genre auswählen</h3>
              <p className="filter-description">Wähle dein Lieblings-Genre oder nutze das Dropdown für alle Optionen</p>
            </div>
            
            <div className="genre-content">
              <div className="popular-genres-wrapper">
                <span className="genre-label">Beliebt:</span>
                <div className="popular-genres">
                  <button
                    className={`genre-btn ${selectedGenre === '' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('genre', '')}
                  >
                    Alle
                  </button>
                  {popularGenres.map(genre => (
                    <button
                      key={genre}
                      className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
                      onClick={() => handleFilterChange('genre', genre)}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="all-genres-wrapper">
                <span className="genre-label">Alle:</span>
                <select 
                  value={selectedGenre} 
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="genre-select"
                >
                  <option value="">Alle Genres durchsuchen...</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Erweiterte Filter - Kompakt in Cards */}
          <div className="advanced-filters-section">
            <div className="filter-section-header">
              <h3>⚙️ Erweiterte Filter</h3>
              <p className="filter-description">Verfeinere deine Suche mit spezifischen Kriterien</p>
            </div>

            <div className="filter-cards-grid">
              <div className="filter-card">
                <div className="filter-card-header">
                  <span className="filter-icon">🎬</span>
                  <span className="filter-title">Format</span>
                </div>
                <select 
                  value={selectedFormat} 
                  onChange={(e) => handleFilterChange('format', e.target.value)}
                  className="card-select"
                >
                  <option value="">Alle Formate</option>
                  {(activeType === MediaType.ANIME ? animeFormats : mangaFormats).map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-card">
                <div className="filter-card-header">
                  <span className="filter-icon">📊</span>
                  <span className="filter-title">Status</span>
                </div>
                <select 
                  value={selectedStatus} 
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="card-select"
                >
                  <option value="">Alle Status</option>
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-card">
                <div className="filter-card-header">
                  <span className="filter-icon">📅</span>
                  <span className="filter-title">Jahr</span>
                </div>
                <select 
                  value={selectedYear} 
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="card-select"
                >
                  <option value="">Alle Jahre</option>
                  {getYearOptions().slice(0, 15).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {activeType === MediaType.ANIME && (
                <div className="filter-card">
                  <div className="filter-card-header">
                    <span className="filter-icon">🌸</span>
                    <span className="filter-title">Saison</span>
                  </div>
                  <select 
                    value={selectedSeason} 
                    onChange={(e) => handleFilterChange('season', e.target.value)}
                    className="card-select"
                  >
                    <option value="">Alle Saisons</option>
                    {seasonOptions.map(season => (
                      <option key={season.value} value={season.value}>{season.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="filter-card">
                <div className="filter-card-header">
                  <span className="filter-icon">🏢</span>
                  <span className="filter-title">Studio</span>
                </div>
                <select 
                  value={selectedStudio} 
                  onChange={(e) => handleFilterChange('studio', e.target.value)}
                  className="card-select"
                >
                  <option value="">Alle Studios</option>
                  <option value="Studio Ghibli">Studio Ghibli</option>
                  <option value="Madhouse">Madhouse</option>
                  <option value="Kyoto Animation">Kyoto Animation</option>
                  <option value="Ufotable">Ufotable</option>
                  <option value="Mappa">Mappa</option>
                  <option value="Wit Studio">Wit Studio</option>
                  <option value="Bones">Bones</option>
                  <option value="A-1 Pictures">A-1 Pictures</option>
                  <option value="CloverWorks">CloverWorks</option>
                  <option value="Studio Trigger">Studio Trigger</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Ergebnisse */}
        <section className="results-section">
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {loading && media.length === 0 ? (
            <div className="loading">
              <div className="spinner" />
              <p>Lade {activeType === MediaType.ANIME ? 'Anime' : 'Manga'}...</p>
            </div>
          ) : (
            <>
              <div className="media-grid">
                {media.map((item) => (
                  <div key={item.id} className="media-card">
                    <Link to={`/media/${item.id}`} className="media-card-link">
                      <div className="media-image">
                        {item.coverImage.large && (
                          <img 
                            src={item.coverImage.large} 
                            alt={getTitle(item)}
                            loading="lazy"
                          />
                        )}
                        <div className="media-overlay">
                          <div className="media-score">⭐ {getScore(item.averageScore)}</div>
                          <div className="media-status">{getStatus(item.status)}</div>
                        </div>
                      </div>
                      <div className="media-info">
                        <h3 className="media-title" title={getTitle(item)}>
                          {getTitle(item)}
                        </h3>
                        <div className="media-details">
                          {item.type === MediaType.ANIME && item.episodes && (
                            <span>📺 {item.episodes} Episoden</span>
                          )}
                          {item.type === MediaType.MANGA && item.chapters && (
                            <span>📖 {item.chapters} Kapitel</span>
                          )}
                          {item.startDate?.year && (
                            <span>📅 {item.startDate.year}</span>
                          )}
                          {item.format && (
                            <span>🎬 {item.format}</span>
                          )}
                        </div>
                        <div className="media-genres">
                          {item.genres.slice(0, 3).map(genre => (
                            <span key={genre} className="genre-tag">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Enhanced Pagination */}
              {totalResults > 0 && (
                <div className="pagination-section">
                  <div className="pagination-info">
                    <p>
                      Zeige {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalResults)} von {totalResults} Ergebnissen
                    </p>
                    <p>Seite {currentPage} von {totalPages}</p>
                  </div>
                  
                  <div className="pagination-controls">
                    {/* Previous Page */}
                    <button 
                      onClick={() => loadMedia(currentPage - 1, true)} 
                      disabled={currentPage <= 1 || loading}
                      className="pagination-btn"
                    >
                      ← Vorherige
                    </button>

                    {/* Page Numbers */}
                    <div className="page-numbers">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => loadMedia(pageNum, true)}
                            disabled={loading}
                            className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Page */}
                    <button 
                      onClick={() => loadMedia(currentPage + 1, true)} 
                      disabled={!hasNextPage || loading}
                      className="pagination-btn"
                    >
                      Nächste →
                    </button>
                  </div>

                  {/* Load More Option (traditional) */}
                  {hasNextPage && (
                    <div className="load-more-section">
                      <button 
                        onClick={loadMore} 
                        disabled={loading}
                        className="load-more-btn secondary"
                      >
                        {loading ? 'Lädt...' : 'Mehr zur Liste hinzufügen'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default AnimePage; 