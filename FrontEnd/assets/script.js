var categories = new Set();
var works = window.localStorage.getItem("works");
var noCache = false;
var api = "http://localhost:5678/api";
var curCategoryFilter = null;

// Méthode pour récupérer les travaux depuis l'API
async function getWorks() {
    console.debug("getWorks");
    const reponse = await fetch(api + "/works");
    works = await reponse.json();
    // Stockage des informations dans le localStorage
    window.localStorage.setItem("works", JSON.stringify(works));
    console.debug(works);
}

// Méthode pour obtenir les catégories
// works doit être initialisé
function getCategories() {
    categories.clear();
    works.forEach(work => {
        categories.add(work.category.name);
    });
    console.debug(categories);
}

// Méthode pour mettre à jour le contenu de la page
function refreshHtmlWorks() {
    console.debug("refreshHtmlWorks");

    // Actualise les projets
    const worksContainer = document.querySelector(".gallery");
    worksContainer.innerHTML = "";
    console.debug(typeof works);
    works.forEach(work => {
        if (curCategoryFilter && work.category.name !== curCategoryFilter)
            return;
        const figure = document.createElement("figure");
        figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        `;
        worksContainer.appendChild(figure);
    });

    // Actualise les catégories
    getCategories();
    const filtersContainer = document.querySelector(".filters");
    filtersContainer.innerHTML = "";
    const firstChild = document.createElement("button");
    firstChild.addEventListener("click", function () {
        curCategoryFilter = null;
        refreshHtmlWorks();
    });
    firstChild.innerText = "Tous";
    filtersContainer.appendChild(firstChild);
    categories.forEach(category => {
        const button = document.createElement("button");
        button.innerText = category;
        button.addEventListener("click", function () {
            curCategoryFilter = category;
            refreshHtmlWorks();
        });
        filtersContainer.appendChild(button);
    });
}

// Charge les données si besoin et actualise l'affichage
if (!works || noCache)
    getWorks().then(function () { refreshHtmlWorks(); });
else {
    works = JSON.parse(works);
    refreshHtmlWorks();
}
