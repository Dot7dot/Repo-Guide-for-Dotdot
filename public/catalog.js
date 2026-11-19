const search = document.querySelector(".search");
const input = document.querySelector("#project-search");
const filters = document.querySelector(".filters");
const buttons = [...filters.querySelectorAll("button")];
const count = document.querySelector("#result-count");
const empty = document.querySelector("#empty-state");
const reset = document.querySelector("#reset-filters");

const normalize = value => value.toLowerCase().normalize("NFKD")
  .replace(/\p{M}/gu, "")
  .replace(/[^\p{L}\p{N}]+/gu, " ")
  .trim();

const cards = [...document.querySelectorAll(".project-item")].map(element => ({
  element,
  searchText: normalize(element.dataset.search),
  category: element.dataset.category,
}));

let activeCategory = "all";

function renderResults() {
  const terms = normalize(input.value).split(" ").filter(Boolean);
  let matches = 0;
  for (const card of cards) {
    const inCategory = activeCategory === "all" || card.category === activeCategory;
    const visible = inCategory && terms.every(term => card.searchText.includes(term));
    card.element.hidden = !visible;
    if (visible) matches += 1;
  }

  for (const button of buttons) {
    button.setAttribute("aria-pressed", String(button.dataset.filter === activeCategory));
  }
  count.textContent = `${matches} 個專案`;
  empty.hidden = matches > 0;
}

function applyFilters() {
  renderResults();
  const url = new URL(location.href);
  const query = input.value.trim();
  if (query) url.searchParams.set("q", query);
  else url.searchParams.delete("q");
  if (activeCategory === "all") url.searchParams.delete("category");
  else url.searchParams.set("category", activeCategory);
  if (url.href !== location.href) history.replaceState(null, "", url);
}

const params = new URLSearchParams(location.search);
const category = params.get("category");
if (buttons.some(button => button.dataset.filter === category)) activeCategory = category;
input.value = params.get("q") ?? "";
renderResults();

search.hidden = false;
filters.hidden = false;
search.addEventListener("submit", event => event.preventDefault());
input.addEventListener("input", applyFilters);
for (const button of buttons) {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.filter;
    applyFilters();
  });
}
reset.addEventListener("click", () => {
  input.value = "";
  activeCategory = "all";
  applyFilters();
  input.focus();
});
