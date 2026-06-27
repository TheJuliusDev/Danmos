/* ═══════════════════════════════════════════════════════════════
   DANMOS ELITE PROPERTIES - MAIN MODULE
   ═══════════════════════════════════════════════════════════════ */

/* ─── ENVIRONMENT CONFIGURATION ──────────────────────────────── */
export const CONFIG = {
  apiKey: import.meta.env.VITE_API_KEY || '',
  newsApiKey: import.meta.env.VITE_NEWS_API_KEY || '',
  newsApiEndpoint: import.meta.env.VITE_NEWS_API_ENDPOINT || 'https://api.massive.com/news',
  s3: {
    accessKeyId: import.meta.env.VITE_S3_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_S3_SECRET_ACCESS_KEY || '',
    endpoint: import.meta.env.VITE_S3_ENDPOINT || '',
    bucket: import.meta.env.VITE_S3_BUCKET || 'flatfiles'
  }
};

/* ─── CURATED NEWS FALLBACK ──────────────────────────────────── */
const CURATED_NEWS = [
  {
    title: "Nigeria's Real Estate Sector Shows Resilience Amid Economic Headwinds",
    summary: "Despite macroeconomic pressures, Nigeria's property market continues to demonstrate its value as a wealth preservation and income-generating asset class for investors.",
    category: 'Market Update',
    date: 'June 2026',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&q=70',
    url: '#'
  },
  {
    title: "Ibadan Real Estate Market Reaches New Heights with Premium Developments",
    summary: "New luxury residential and commercial projects are transforming Ibadan's skyline, attracting both local and international investors to the region.",
    category: 'Development News',
    date: 'May 2026',
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&q=70',
    url: '#'
  },
  {
    title: "Investment Opportunities in Nigeria's Emerging Real Estate Market",
    summary: "With strategic government policies and increasing foreign direct investment, Nigeria offers compelling opportunities for real estate investors seeking high returns.",
    category: 'Investment',
    date: 'April 2026',
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=70',
    url: '#'
  },
  {
    title: "Sustainable Building Practices Shape Nigeria's Future Developments",
    summary: "Green building standards and eco-friendly construction methods are becoming increasingly important in Nigeria's premium real estate developments.",
    category: 'Sustainability',
    date: 'April 2026',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=500&q=70',
    url: '#'
  },
  {
    title: "Technology Drives Real Estate Innovation in Nigeria",
    summary: "Digital platforms and PropTech solutions are revolutionizing how properties are marketed, sold, and managed across Nigeria.",
    category: 'Technology',
    date: 'March 2026',
    img: 'https://images.unsplash.com/photo-1522708319590-d24dbb6b0267?w=500&q=70',
    url: '#'
  },
  {
    title: "Luxury Living Redefined: Premium Estates Across Major Nigerian Cities",
    summary: "High-end residential communities are setting new standards for luxury and lifestyle in Nigeria's major metropolitan areas.",
    category: 'Luxury',
    date: 'March 2026',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=70',
    url: '#'
  }
];

/* ─── NEWS CARD HTML ─────────────────────────────────────────── */
function newsCardHTML(a) {
  return `
  <div class="news-card">
    <div class="news-card-img">
      <img src="${a.img}" alt="${a.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=70'">
      <div class="news-card-cat">${a.category}</div>
    </div>
    <div class="news-card-body">
      <div class="news-card-date">${a.date}</div>
      <div class="news-card-title">${a.title}</div>
      <div class="news-card-summary">${a.summary ? a.summary.substring(0, 140) + (a.summary.length > 140 ? '...' : '') : ''}</div>
      <a href="${a.url}" target="_blank" rel="noopener noreferrer" class="news-read-more">
        Read Article
        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
    </div>
  </div>`;
}

/* ─── MASSIVE.COM NEWS API ───────────────────────────────────── */
async function fetchMassiveNews() {
  const endpoint = CONFIG.newsApiEndpoint;
  const apiKey   = CONFIG.newsApiKey;

  // Build query – Massive uses S3-style Bearer auth
  const url = `${endpoint}?q=Nigeria+real+estate+property&language=en&sortBy=publishedAt&pageSize=6`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error(`Massive API error: ${response.status}`);

  const data = await response.json();

  // Normalise response – handle both { articles: [] } and direct array shapes
  const articles = Array.isArray(data) ? data : (data.articles || data.results || []);
  if (!articles.length) throw new Error('No articles returned');

  return articles.map(a => ({
    title:    a.title    || a.headline || 'Untitled',
    summary:  a.description || a.summary || a.excerpt || '',
    category: a.category || a.source?.name || 'Real Estate News',
    date:     a.publishedAt || a.published_at || a.date
      ? new Date(a.publishedAt || a.published_at || a.date)
          .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Recent',
    img:  a.urlToImage || a.image_url || a.thumbnail || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=70',
    url:  a.url || a.link || '#'
  }));
}

/* ─── NEWS RENDERER (exported – called by inline script) ─────── */
export async function renderNews() {
  const grid = document.getElementById('newsGrid');
  if (!grid || grid.children.length > 1) return; // already rendered

  const hasKey = CONFIG.newsApiKey && CONFIG.newsApiKey.length > 10;

  if (hasKey) {
    try {
      const articles = await fetchMassiveNews();
      grid.innerHTML = articles.map(newsCardHTML).join('');
      return;
    } catch (err) {
      console.warn('[Danmos] Massive news API failed, using curated fallback:', err.message);
    }
  }

  // Fallback to curated content
  grid.innerHTML = CURATED_NEWS.map(newsCardHTML).join('');
}