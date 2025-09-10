const API_BASE = 'https://api.jikan.moe/v4';

async function fetchAnime(query) {
  const res = await fetch(`${API_BASE}/anime?q=${encodeURIComponent(query)}&limit=10`);
  const json = await res.json();
  return json.data;
}

async function fetchEpisodes(id) {
  const res = await fetch(`${API_BASE}/anime/${id}/episodes?page=1`);
  const json = await res.json();
  return json.data.map(ep => ep.title);
}

function renderAnimeList(animes) {
  const list = document.getElementById('anime-list');
  list.innerHTML = '';

  animes.forEach(anime => {
    const card = document.createElement('div');
    card.className = 'anime-card';

    const img = anime.images?.jpg?.image_url || '';
    card.innerHTML = `
      <img src="${img}" alt="${anime.title}">
      <h2>${anime.title}</h2>
      <div class="anime-details">
        <p><strong>Genre:</strong> ${anime.genres.map(g => g.name).join(', ')}</p>
        <p><strong>Rating:</strong> ${anime.score || 'N/A'}</p>
        <p><strong>Synopsis:</strong> ${anime.synopsis || 'No synopsis available.'}</p>
        <details><summary>Episodes</summary><ul class="episode-list"><li>Loading...</li></ul></details>
      </div>
    `;

    card.addEventListener('click', async () => {
      const details = card.querySelector('.anime-details');
      if (details.style.display === 'block') {
        details.style.display = 'none';
      } else {
        details.style.display = 'block';
        const epList = card.querySelector('.episode-list');
        if (epList.innerHTML.includes('Loading...')) {
          const episodes = await fetchEpisodes(anime.mal_id);
          epList.innerHTML = episodes.length
            ? episodes.map(ep => `<li>${ep}</li>`).join('')
            : '<li>No episodes found.</li>';
        }
      }
    });

    list.appendChild(card);
  });
}

document.getElementById('searchBtn').addEventListener('click', async () => {
  const query = document.getElementById('search').value.trim();
  if (!query) return;
  const results = await fetchAnime(query);
  renderAnimeList(results);
});

// Initial placeholder: search "naruto" by default
fetchAnime('naruto').then(renderAnimeList);
