import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { anilistApi } from '../services/anilistApi';
import { MediaType } from '../types/anilist';
import type { Media, MediaEdge, CharacterEdge, StaffEdge } from '../types/anilist';
import ThemeToggle from './ThemeToggle';
import './MediaDetailPage.css';

const MediaDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadMediaDetails(parseInt(id));
    }
  }, [id]);

  const loadMediaDetails = async (mediaId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Verwende neue detailed Media Query
      const response = await anilistApi.getMediaWithDetails(mediaId);
      
      if (response.data.Media) {
        setMedia(response.data.Media);
      } else {
        setError('Medium nicht gefunden');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

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

  const getRelationTypeText = (relationType: string): string => {
    const relationMap: { [key: string]: string } = {
      'SEQUEL': 'Fortsetzung',
      'PREQUEL': 'Vorgänger',
      'PARENT': 'Ursprung',
      'SIDE_STORY': 'Nebengeschichte',
      'CHARACTER': 'Charakter',
      'SUMMARY': 'Zusammenfassung',
      'ALTERNATIVE': 'Alternative',
      'SPIN_OFF': 'Spin-off',
      'OTHER': 'Andere',
      'SOURCE': 'Quelle',
      'COMPILATION': 'Sammlung',
      'CONTAINS': 'Enthält'
    };
    return relationMap[relationType] || relationType;
  };

  const getCharacterName = (character: CharacterEdge): string => {
    const name = character.node.name;
    return name.full || `${name.first || ''} ${name.last || ''}`.trim() || 'Unbekannt';
  };

  const getStaffName = (staff: StaffEdge): string => {
    const name = staff.node.name;
    return name.full || `${name.first || ''} ${name.last || ''}`.trim() || 'Unbekannt';
  };

  const getRoleText = (role: string): string => {
    const roleMap: { [key: string]: string } = {
      'MAIN': 'Hauptcharakter',
      'SUPPORTING': 'Nebencharakter',
      'BACKGROUND': 'Hintergrundcharakter'
    };
    return roleMap[role] || role;
  };

  const formatDate = (date: { year: number | null; month: number | null; day: number | null } | null) => {
    if (!date || !date.year) return 'Unbekannt';
    const month = date.month ? `.${date.month.toString().padStart(2, '0')}` : '';
    const day = date.day ? `.${date.day.toString().padStart(2, '0')}` : '';
    return `${date.year}${month}${day}`;
  };

  const stripHtmlTags = (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  };

  if (loading) {
    return (
      <div className="media-detail-page">
        <ThemeToggle />
        <div className="loading-detail">
          <div className="spinner" />
          <p>Lade Details...</p>
        </div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="media-detail-page">
        <ThemeToggle />
        <div className="error-detail">
          <h2>❌ {error || 'Medium nicht gefunden'}</h2>
          <div className="error-navigation">
            <Link to="/" className="nav-button home-button">
              🏠 Zur Startseite
            </Link>
            <Link to="/anime" className="nav-button back-button">
              ← Zurück zur Übersicht
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="media-detail-page">
      <ThemeToggle />
      
      {/* Hero Section mit Banner */}
      <div className="detail-hero" style={{
        backgroundImage: media.bannerImage ? `url(${media.bannerImage})` : 'none'
      }}>
        <div className="hero-overlay">
          <div className="container">
            <div className="navigation-bar">
              <Link to="/" className="nav-button home-button">
                🏠 Startseite
              </Link>
              <Link to="/anime" className="nav-button back-button">
                ← Zurück zur Übersicht
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="detail-content">
        <div className="container">
          <div className="detail-card">
            <div className="detail-main">
              <div className="detail-image">
                {(media.coverImage?.large || media.coverImage?.medium) && (
                  <img 
                    src={media.coverImage.large ?? media.coverImage.medium ?? ''} 
                    alt={getTitle(media)}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              
              <div className="detail-info">
                <h1 className="detail-title">{getTitle(media)}</h1>
                
                <div className="detail-meta">
                  <div className="meta-item">
                    ⭐ <span>Bewertung: {getScore(media.averageScore)}</span>
                  </div>
                  
                  <div className="meta-item">
                    🕒 <span>Status: {getStatus(media.status)}</span>
                  </div>
                  
                  <div className="meta-item">
                    📅 <span>Veröffentlicht: {formatDate(media.startDate)}</span>
                  </div>
                  
                  {media.type === MediaType.ANIME && media.episodes && (
                    <div className="meta-item">
                      📺 <span>{media.episodes} Episoden</span>
                    </div>
                  )}
                  
                  {media.type === MediaType.MANGA && (
                    <>
                      {media.chapters && (
                        <div className="meta-item">
                          📖 <span>{media.chapters} Kapitel</span>
                        </div>
                      )}
                      {media.volumes && (
                        <div className="meta-item">
                          📚 <span>{media.volumes} Bände</span>
                        </div>
                      )}
                    </>
                  )}

                  {media.format && (
                    <div className="meta-item">
                      🎬 <span>Format: {media.format}</span>
                    </div>
                  )}

                  {media.source && (
                    <div className="meta-item">
                      📋 <span>Quelle: {media.source}</span>
                    </div>
                  )}

                  {media.studios?.nodes && media.studios.nodes.length > 0 && (
                    <div className="meta-item">
                      🏢 <span>Studio: </span>
                      <div className="studios-list">
                        {(media.studios.nodes.filter(studio => studio.isMain).length > 0 
                          ? media.studios.nodes.filter(studio => studio.isMain)
                          : media.studios.nodes.slice(0, 2)
                        ).map((studio, index, array) => (
                          <span key={studio.id}>
                            <Link to={`/anime?studio=${studio.name}`} className="studio-link">
                              {studio.name}
                            </Link>
                            {index < array.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="detail-genres">
                  {media.genres?.map(genre => (
                    <Link 
                      key={genre} 
                      to={`/anime?genre=${genre}`}
                      className="genre-tag"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>

                {/* Tags Section */}
                {media.tags && media.tags.length > 0 && (
                  <div className="detail-tags">
                    <h4>Tags</h4>
                    <div className="tags-container">
                      {media.tags
                        .filter(tag => !tag.isGeneralSpoiler && !tag.isMediaSpoiler && tag.rank && tag.rank > 60)
                        .sort((a, b) => (b.rank || 0) - (a.rank || 0))
                        .slice(0, 12)
                        .map(tag => (
                          <Link
                            key={tag.id}
                            to={`/anime?tags=${tag.name}`}
                            className="tag-item"
                            title={tag.description || undefined}
                          >
                            <span className="tag-name">{tag.name}</span>
                            {tag.rank && (
                              <span className="tag-rank">{tag.rank}%</span>
                            )}
                          </Link>
                        ))}
                    </div>
                  </div>
                )}

                {media.description && (
                  <div className="detail-description">
                    <h3>Beschreibung</h3>
                    <p>{stripHtmlTags(media.description)}</p>
                  </div>
                )}

                <div className="detail-actions">
                  <Link 
                    to={`/anime?type=${media.type.toLowerCase()}&search=${encodeURIComponent(getTitle(media))}`}
                    className="action-btn primary"
                  >
                    Ähnliche finden
                  </Link>
                  <Link to="/anime" className="action-btn secondary">
                    Mehr entdecken
                  </Link>
                </div>
              </div>
            </div>

            {/* Media Relations */}
            {media.relations?.edges && media.relations.edges.length > 0 && (
              <div className="detail-section relations-section">
                <h2>🔗 Verwandte Medien</h2>
                <div className="relations-grid">
                  {media.relations.edges.map((relation: MediaEdge) => (
                    <Link
                      key={relation.node.id}
                      to={`/media/${relation.node.id}`}
                      className="relation-card"
                    >
                      <div className="relation-image">
                        {relation.node.coverImage?.medium && (
                          <img 
                            src={relation.node.coverImage.medium} 
                            alt={getTitle(relation.node)}
                          />
                        )}
                      </div>
                      <div className="relation-info">
                        <div className="relation-type">
                          {getRelationTypeText(relation.relationType)}
                        </div>
                        <h4 className="relation-title">
                          {getTitle(relation.node)}
                        </h4>
                        <div className="relation-meta">
                          <span>{relation.node.type}</span>
                          {relation.node.startDate?.year && (
                            <span>• {relation.node.startDate.year}</span>
                          )}
                          {relation.node.averageScore && (
                            <span>• ⭐{relation.node.averageScore}%</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Characters */}
            {media.characters?.edges && media.characters.edges.length > 0 && (
              <div className="detail-section characters-section">
                <h2>👥 Charaktere</h2>
                <div className="characters-grid">
                  {media.characters.edges.slice(0, 8).map((character: CharacterEdge) => (
                    <div key={character.node.id} className="character-card">
                      <div className="character-image">
                        {character.node.image?.medium && (
                          <img 
                            src={character.node.image.medium} 
                            alt={getCharacterName(character)}
                          />
                        )}
                      </div>
                      <div className="character-info">
                        <h4 className="character-name">
                          {getCharacterName(character)}
                        </h4>
                        <div className="character-role">
                          {getRoleText(character.role)}
                        </div>
                        {character.voiceActors && character.voiceActors.length > 0 && (
                          <div className="voice-actor">
                            Sprecher: {character.voiceActors[0].name.full || 'Unbekannt'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staff */}
            {media.staff?.edges && media.staff.edges.length > 0 && (
              <div className="detail-section staff-section">
                <h2>🎭 Personal</h2>
                <div className="staff-grid">
                  {media.staff.edges.slice(0, 6).map((staff: StaffEdge) => (
                    <div key={staff.node.id} className="staff-card">
                      <div className="staff-image">
                        {staff.node.image?.medium && (
                          <img 
                            src={staff.node.image.medium} 
                            alt={getStaffName(staff)}
                          />
                        )}
                      </div>
                      <div className="staff-info">
                        <h4 className="staff-name">
                          {getStaffName(staff)}
                        </h4>
                        <div className="staff-role">
                          {staff.role || 'Unbekannte Rolle'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetailPage; 