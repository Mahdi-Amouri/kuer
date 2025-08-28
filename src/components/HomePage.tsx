import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Bookmark, 
  Star, 
  ArrowRight, 
  Sword, 
  Heart, 
  Smile, 
  Wand2, 
  Drama, 
  Zap 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { anilistApi } from '../services/anilistApi';
import type { Media } from '../types/anilist';
import { MediaType } from '../types/anilist';
import ThemeToggle from './ThemeToggle';
import './HomePage.css';

const HomePage = () => {
  const [topAnime, setTopAnime] = useState<Media[]>([]);
  const [topManga, setTopManga] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      anilistApi.getTopMedia(MediaType.ANIME, 1, 10),
      anilistApi.getTopMedia(MediaType.MANGA, 1, 10)
    ]).then(([animeRes, mangaRes]) => {
      setTopAnime(animeRes.data.Page.media);
      setTopManga(mangaRes.data.Page.media);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 12
      }
    },
    hover: {
      y: -10,
      scale: 1.05,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <div className="homepage">
      <ThemeToggle />
      
      {/* Hero Section */}
      <motion.header 
        className="hero-section"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="hero-content">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="hero-title">
              Entdecke die Welt von <span className="highlight">Anime & Manga</span>
            </h1>
            <p className="hero-description">
              Entdecke die unendlichen Welten von Anime und Manga. 
              Dein Portal zu den besten Geschichten des Universums.
            </p>
          </motion.div>
          
          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link to="/anime" className="cta-button primary">
              <Play /> Anime Entdecken
            </Link>
            <Link to="/anime?type=manga" className="cta-button secondary">
              <Bookmark /> Manga Durchsuchen
            </Link>
          </motion.div>
        </div>

        {/* Floating particles */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${80 + Math.random() * 20}%`,
              }}
            />
          ))}
        </div>
      </motion.header>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Entdecke Anime & Manga
          </motion.h2>
          
          <motion.div 
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { 
                icon: '🔍', 
                title: 'Erweiterte Suche', 
                desc: 'Finde genau das, was du suchst mit Genre-Filtern und Suchfunktion',
                link: '/anime'
              },
              { 
                icon: '🎌', 
                title: 'Anime Entdecken', 
                desc: 'Durchstöbere tausende von Anime-Serien und -Filmen',
                link: '/anime?type=ANIME'
              },
              { 
                icon: '📚', 
                title: 'Manga Lesen', 
                desc: 'Entdecke die besten Manga aus allen Genres',
                link: '/anime?type=MANGA'
              },
              { 
                icon: '🎭', 
                title: 'Action Genre', 
                desc: 'Erkunde spannende Action-Anime und -Manga',
                link: '/anime?genre=Action'
              },
              { 
                icon: '💖', 
                title: 'Romance Genre', 
                desc: 'Tauche ein in romantische Geschichten',
                link: '/anime?genre=Romance'
              },
              { 
                icon: '⚡', 
                title: 'Fantasy Genre', 
                desc: 'Entdecke magische Welten und Abenteuer',
                link: '/anime?genre=Fantasy'
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Link to={feature.link} className="feature-card-link">
                  <div className="feature-card">
                    <div className="feature-icon">{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Top Anime Section */}
      <section className="top-media-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <h2 className="section-title">
              <Star />
              Top bewertete Anime
            </h2>
            <Link to="/anime" className="view-all-btn">
              Alle anzeigen <ArrowRight />
            </Link>
          </motion.div>

          {loading ? (
            <div className="loading-grid">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="loading-card" />
              ))}
            </div>
          ) : (
            <motion.div 
              className="media-preview-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {topAnime.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  whileHover="hover"
                  custom={index}
                >
                  <Link 
                    to={`/media/${item.id}`} 
                    className="preview-card"
                  >
                    <div className="card-image">
                      {item.coverImage.large && (
                        <img src={item.coverImage.large} alt={item.title.romaji || ''} />
                      )}
                      <div className="card-overlay">
                        <div className="score">
                          <Star /> {item.averageScore}%
                        </div>
                      </div>
                    </div>
                    <div className="card-content">
                      <h3 className="preview-title">{item.title.romaji || item.title.english}</h3>
                      <div className="preview-meta">
                        {item.episodes && <span>📺 {item.episodes} Ep.</span>}
                        {item.startDate?.year && <span>📅 {item.startDate.year}</span>}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Top Manga Section */}
      <section className="top-media-section manga">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <h2 className="section-title">
              <Bookmark />
              Top bewertete Manga
            </h2>
            <Link to="/anime?type=manga" className="view-all-btn">
              Alle anzeigen <ArrowRight />
            </Link>
          </motion.div>

          {loading ? (
            <div className="loading-grid">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="loading-card" />
              ))}
            </div>
          ) : (
            <motion.div 
              className="media-preview-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {topManga.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  whileHover="hover"
                  custom={index}
                >
                  <Link 
                    to={`/media/${item.id}`} 
                    className="preview-card"
                  >
                    <div className="card-image">
                      {item.coverImage.large && (
                        <img src={item.coverImage.large} alt={item.title.romaji || ''} />
                      )}
                      <div className="card-overlay">
                        <div className="score">
                          <Star /> {item.averageScore}%
                        </div>
                      </div>
                    </div>
                    <div className="card-content">
                      <h3 className="preview-title">{item.title.romaji || item.title.english}</h3>
                      <div className="preview-meta">
                        {item.chapters && <span>📖 {item.chapters} Ch.</span>}
                        {item.startDate?.year && <span>📅 {item.startDate.year}</span>}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Beliebte Kategorien
          </motion.h2>
          
          <motion.div 
            className="categories-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { name: 'Action', desc: 'Spannende Kämpfe und Abenteuer', gradient: 'linear-gradient(135deg, #ff6b6b, #ff8e53)', icon: Sword },
              { name: 'Romance', desc: 'Herzerwärmende Liebesgeschichten', gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)', icon: Heart },
              { name: 'Comedy', desc: 'Lustige und unterhaltsame Serien', gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)', icon: Smile },
              { name: 'Fantasy', desc: 'Magische Welten und Abenteuer', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', icon: Wand2 },
              { name: 'Drama', desc: 'Tiefgreifende emotionale Geschichten', gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)', icon: Drama },
              { name: 'Sci-Fi', desc: 'Futuristische Welten und Technologien', gradient: 'linear-gradient(135deg, #a8c0ff, #3f2b96)', icon: Zap }
            ].map((category, index) => {
              const IconComponent = category.icon;
              return (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  whileHover={{ y: -10, rotateY: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to={`/anime?genre=${category.name}`} 
                    className="category-card modern-card"
                    style={{ background: category.gradient }}
                    onClick={() => toast.success(`🎌 ${category.name} Anime wird geladen...`)}
                  >
                    <motion.div 
                      className="category-overlay modern-overlay"
                      initial={{ opacity: 0.9 }}
                      whileHover={{ 
                        opacity: 1,
                        backdropFilter: "blur(8px)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      <motion.div 
                        className="category-icon"
                        initial={{ scale: 1, rotate: 0 }}
                        whileHover={{ 
                          scale: 1.2, 
                          rotate: 10,
                          filter: "drop-shadow(0 0 20px rgba(255,255,255,0.8))"
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <IconComponent size={40} />
                      </motion.div>
                      
                      <div className="category-content">
                        <h3>{category.name}</h3>
                        <p>{category.desc}</p>
                      </div>
                      
                      <motion.div
                        className="category-arrow"
                        initial={{ x: 0 }}
                        whileHover={{ x: 10, scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ArrowRight size={24} />
                      </motion.div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            style: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#667eea',
            },
          },
        }}
      />
    </div>
  );
};

export default HomePage; 