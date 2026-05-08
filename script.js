const TMDB_KEY = "Add your TMDB API";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

let currentGenre = "all";

const genreMap = {
  all: null,
  action: 28,
  comedy: 35,
  drama: 18,
  horror: 27,
  scifi: 878,
  romance: 10749,
  adventure: 12,
  thriller: 53,
  animation: 16,
};

// Proxy helper - sahi encoding ke saath
function proxyUrl(tmdbUrl) {
  return `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(tmdbUrl)}`;
}

// Image with fallback
function getImgHtml(posterPath, title) {
  if (!posterPath) return `<img src="https://placehold.co/200x300?text=No+Poster" alt="${title}" />`;
  const imgUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
  const proxied = `https://images.weserv.nl/?url=${encodeURIComponent(imgUrl)}`;
  return `<img src="${proxied}" alt="${title}" onerror="this.src='https://placehold.co/200x300?text=No+Poster'" />`;
}

// CATEGORY BUTTONS
const categoryButtons = document.querySelectorAll(".category-btn");
categoryButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const clickedGenre = btn.getAttribute("data-genre");
    if (clickedGenre === currentGenre) {
      currentGenre = "all";
      categoryButtons.forEach((b) => b.classList.remove("active"));
      document.querySelector('.category-btn[data-genre="all"]').classList.add("active");
      fetchMovies("all");
    } else {
      currentGenre = clickedGenre;
      categoryButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      fetchMovies(clickedGenre);
    }
  });
});

// FETCH MOVIES
async function fetchMovies(genre) {
  const container = document.getElementById("movies");
  container.innerHTML = '<p style="color:white;text-align:center;padding:30px;font-size:18px;">Loading...</p>';
  try {
    let tmdbUrl;
    if (genre === "all") {
      tmdbUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=1`;
    } else {
      const genreId = genreMap[genre];
      tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&with_genres=${genreId}&language=en-US&sort_by=popularity.desc&page=1`;
    }
    const res = await fetch(proxyUrl(tmdbUrl));
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      displayMovies(data.results);
    } else {
      container.innerHTML = '<p style="color:white;text-align:center;">No Movie Found...</p>';
    }
  } catch (err) {
    console.error("Fetch error:", err);
    container.innerHTML = '<p style="color:red;text-align:center;">Error loading movies.</p>';
  }
}

// DISPLAY MOVIES
function displayMovies(movies) {
  const container = document.getElementById("movies");
  container.innerHTML = "";
  movies.forEach((movie) => {
    const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
    const div = document.createElement("div");
    div.classList.add("movie");
    div.innerHTML = `
      ${getImgHtml(movie.poster_path, movie.title)}
      <h3>${movie.title}</h3>
      <p>${year}</p>
      <button class="trailer-btn" onclick="getTrailer(${movie.id}, 'movie')">Watch Trailer</button>
    `;
    container.appendChild(div);
  });
}

// INDIAN MOVIES 
async function getIndianMovies() {
  const container = document.getElementById("indian-movies");
  if (!container) return;
  container.innerHTML = '<p style="color:white;text-align:center;padding:30px;">Loading...</p>';
  try {
    const tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&with_original_language=hi&sort_by=popularity.desc&vote_count.gte=100&page=1`;
    const res = await fetch(proxyUrl(tmdbUrl));
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      displayIndianMovies(data.results);
    } else {
      container.innerHTML = '<p style="color:white;text-align:center;">No results...</p>';
    }
  } catch (err) {
    console.error("Indian movies error:", err);
    container.innerHTML = '<p style="color:red;text-align:center;">Error loading Indian movies.</p>';
  }
}

// DISPLAY INDIAN MOVIES
function displayIndianMovies(movies) {
  const container = document.getElementById("indian-movies");
  container.innerHTML = "";
  movies.forEach((movie) => {
    const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
    const div = document.createElement("div");
    div.classList.add("movie");
    div.innerHTML = `
      ${getImgHtml(movie.poster_path, movie.name)}
      <h3>${movie.title}</h3>
      <p>${year}</p>
      <button class="trailer-btn" onclick="getTrailer(${movie.id}, 'movie')">Watch Trailer</button>
    `;
    container.appendChild(div);
  });
}

// SERIES
async function getSeries() {
  const container = document.getElementById("series");
  if (!container) return;
  container.innerHTML = '<p style="color:white;text-align:center;padding:30px;">Loading...</p>';
  try {
    const tmdbUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_KEY}&language=en-US&page=1`;
    const res = await fetch(proxyUrl(tmdbUrl));
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      displaySeries(data.results);
    } else {
      container.innerHTML = '<p style="color:white;text-align:center;">No results...</p>';
    }
  } catch (err) {
    console.error("Series error:", err);
    container.innerHTML = '<p style="color:red;text-align:center;">Error loading series.</p>';
  }
}

// DISPLAY SERIES
function displaySeries(seriesList) {
  const container = document.getElementById("series");
  if (!container) return;
  container.innerHTML = "";
  seriesList.forEach((series) => {
    const year = series.first_air_date ? series.first_air_date.split("-")[0] : "N/A";
    const div = document.createElement("div");
    div.classList.add("series");
    div.innerHTML = `
      ${getImgHtml(series.poster_path, series.name)}
      <h3>${series.name}</h3>
      <p>${year}</p>
      <button class="trailer-btn" onclick="getTrailer(${series.id}, 'tv')">Watch Trailer</button>
    `;
    container.appendChild(div);
  });
}

// TRAILER
async function getTrailer(id, type) {
  try {
    const tmdbUrl = `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${TMDB_KEY}`;
    const res = await fetch(proxyUrl(tmdbUrl));
    const data = await res.json();
    const trailer = data.results.find((v) => v.type === "Trailer" && v.site === "YouTube");
    if (trailer) {
      window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank");
    } else {
      alert("no trailer available.");
    }
  } catch (err) {
    console.error("Trailer error:", err);
  }
}

// SEARCH
const searchBtn = document.querySelector(".search-btn");
searchBtn.addEventListener("click", async () => {
  const searchInput = document.querySelector(".search-input").value.trim();
  if (searchInput === "") {
    alert("Please enter a movie name to search.");
    return;
  }
  const container = document.getElementById("movies");
  container.innerHTML = '<p style="color:white;text-align:center;padding:30px;">Searching...</p>';
  currentGenre = "all";
  categoryButtons.forEach((b) => b.classList.remove("active"));
  document.querySelector('.category-btn[data-genre="all"]').classList.add("active");
  try {
    const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(searchInput)}&language=en-US`;
    const res = await fetch(proxyUrl(tmdbUrl));
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      displayMovies(data.results);
    } else {
      container.innerHTML = `<p style="color:white;text-align:center;">"${searchInput}" no results...</p>`;
    }
  } catch (err) {
    console.error("Search error:", err);
  }
});

document.querySelector(".search-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});


// PAGE LOAD
fetchMovies("all");
getSeries();
getIndianMovies();

// hamburger 
const hamburger = document.getElementById("menuBtn");
const navLinks = document.querySelector(".nav");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open"); 
  navLinks.classList.toggle("open");
});

