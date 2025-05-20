const apiKey = "83a969c2";
const resultBox = document.getElementById("movieResult");
const yearSlider = document.getElementById("yearSlider");
const yearValue = document.getElementById("yearValue");
const loadingSpinner = document.getElementById("loadingSpinner");
const movieInput = document.getElementById("movieInput");

let currentMovies = [];
let debounceTimer;

// UI Helper
function toggleLoading(show) {
  loadingSpinner.classList.toggle("hidden", !show);
  resultBox.classList.toggle("hidden", show);
}

function showSkeletons(count = 6) {
  const skeletonHTML = Array(count).fill(`
    <div class="movie-card skeleton">
      <div class="skeleton-img"></div>
      <div class="skeleton-title"></div>
      <div class="skeleton-year"></div>
      <div class="skeleton-rating"></div>
    </div>
  `).join("");
  resultBox.innerHTML = skeletonHTML;
}

// Update slider display
yearSlider.addEventListener("input", () => {
  yearValue.textContent = yearSlider.value;
  renderMoviesGrid(); // re-filter existing results
});

// Random keyword seeds to fetch movies on load
const seedKeywords = ["the", "love", "star", "man", "dark", "life", "war", "fast", "day", "time"];
const randomKeyword = () => seedKeywords[Math.floor(Math.random() * seedKeywords.length)];

// Fetch partial matches
async function fetchMoviesBySearch(keyword) {
  const res = await fetch(`https://www.omdbapi.com/?s=${keyword}&apikey=${apiKey}`);
  const data = await res.json();
  return data.Search || [];
}

// Fetch full details for top 6
async function fetchFullMovieDetails(searchList) {
  const filtered = searchList.slice(0, 6);
  const results = await Promise.all(
    filtered.map(movie =>
      fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`)
        .then(res => res.json())
    )
  );
  return results;
}

// Render movie card HTML
function movieCardHTML(data) {
  return `
    <div class="movie-card">
      <img src="${data.Poster}" alt="${data.Title}" />
      <div class="movie-title">${data.Title}</div>
      <div class="movie-year">Year: ${data.Year}</div>
      <div class="movie-rating">⭐ ${data.imdbRating}</div>
    </div>
  `;
}

// Render visible grid
function renderMoviesGrid(movies = currentMovies) {
  const selectedYear = yearSlider.value;

  const filtered = movies.filter(m =>
    m.Response !== "False" &&
    m.Poster !== "N/A" &&
    parseInt(m.Year) <= parseInt(selectedYear)
  );

  resultBox.innerHTML = filtered.length
    ? filtered.map(movieCardHTML).join("")
    : "<p>No results found.</p>";
}

// Search action
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchMovie() {
  const query = movieInput.value.trim();
  if (!query) return loadRandomMovies();

  showSkeletons();
  await delay(1000); // wait 1 second

  const rawResults = await fetchMoviesBySearch(query);
  const detailed = await fetchFullMovieDetails(rawResults);
  currentMovies = detailed;
  renderMoviesGrid();
}

async function loadRandomMovies() {
  showSkeletons();
  await delay(1000); // wait 1 second

  const keyword = randomKeyword();
  const rawResults = await fetchMoviesBySearch(keyword);
  const detailed = await fetchFullMovieDetails(rawResults);
  currentMovies = detailed;
  renderMoviesGrid();
}



// Load default movies

  setTimeout(async () => {
    const rawResults = await fetchMoviesBySearch(query);
    const detailed = await fetchFullMovieDetails(rawResults);
    currentMovies = detailed;
    renderMoviesGrid();
  }, 1000); // keep skeleton up for 1 second minimum


// Init
window.onload = () => {
  yearValue.textContent = yearSlider.value;
  showSkeletons();
  loadRandomMovies();
};

// Live typing with debounce
movieInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchMovie();
  }, 400);
});

// Enter key trigger (fallback)
movieInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    clearTimeout(debounceTimer);
    searchMovie();
  }
});
