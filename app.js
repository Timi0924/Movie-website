const API_KEY = "e87386e6";
const DEFAULT_QUERY = "fast";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const movieGrid = document.getElementById("movieGrid");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");
const quickSearchButtons = document.querySelectorAll(".chip");

let allMovies = [];

function setLoading(isLoading) {
  loadingState.classList.toggle("hidden", !isLoading);
}

function formatType(type) {
  if (!type) return "Movie";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function updateResultMeta(total) {
  resultCount.textContent = `${total} movie${total === 1 ? "" : "s"} found`;
}

function getPosterImage(poster) {
  if (!poster || poster === "N/A") {
    return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80";
  }
  return poster;
}

function getVisibleMovies() {
  const query = searchInput.value.trim().toLowerCase();
  const filterValue = typeFilter.value;

  return allMovies.filter((movie) => {
    const matchesType = filterValue === "all" || movie.Type === filterValue;
    const matchesSearch = !query || movie.Title.toLowerCase().includes(query);
    return matchesType && matchesSearch;
  });
}

function renderMovies(movies) {
  movieGrid.innerHTML = "";

  if (!movies.length) {
    emptyState.classList.remove("hidden");
    updateResultMeta(0);
    return;
  }

  emptyState.classList.add("hidden");
  updateResultMeta(movies.length);

  movies.forEach((movie) => {
    const card = document.createElement("article");
    card.className = "movie-card";

    const detailsButton = document.createElement("button");
    detailsButton.type = "button";
    detailsButton.className = "watch-button";
    detailsButton.textContent = "Details";
    detailsButton.addEventListener("click", () => {
      const imdbUrl = `https://www.imdb.com/title/${movie.imdbID}/`;
      window.open(imdbUrl, "_blank", "noopener,noreferrer");
    });

    card.innerHTML = `
      <div class="poster-wrap">
        <img src="${getPosterImage(movie.Poster)}" alt="${movie.Title} poster" loading="lazy" />
        <span class="movie-type">${formatType(movie.Type)}</span>
      </div>
      <div class="movie-info">
        <h3>${movie.Title}</h3>
        <div class="movie-meta">
          <span>${movie.Year}</span>
          <span>${movie.Type}</span>
        </div>
      </div>
    `;

    card.appendChild(detailsButton);
    movieGrid.appendChild(card);
  });
}

async function fetchMovies(searchTerm) {
  const keyword = searchTerm.trim() || DEFAULT_QUERY;
  setLoading(true);
  emptyState.classList.add("hidden");

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(keyword)}`,
    );

    if (!response.ok) {
      throw new Error("Could not load movies right now.");
    }

    const data = await response.json();

    if (data.Response === "False") {
      allMovies = [];
      renderMovies([]);
      return;
    }

    allMovies = data.Search || [];
    renderMovies(getVisibleMovies());
  } catch (error) {
    allMovies = [];
    renderMovies([]);
    resultCount.textContent = "Unable to load movies";
    emptyState.classList.remove("hidden");
    emptyState.innerHTML = `
      <h3>Something went wrong</h3>
      <p>${error.message || "Please try again."}</p>
    `;
  } finally {
    setLoading(false);
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  fetchMovies(searchInput.value);
});

typeFilter.addEventListener("change", () => {
  renderMovies(getVisibleMovies());
});

searchInput.addEventListener("input", () => {
  renderMovies(getVisibleMovies());
});

quickSearchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const query = button.dataset.query;
    searchInput.value = query;
    quickSearchButtons.forEach((chip) =>
      chip.classList.toggle("active", chip === button),
    );
    fetchMovies(query);
  });
});

fetchMovies(DEFAULT_QUERY);
