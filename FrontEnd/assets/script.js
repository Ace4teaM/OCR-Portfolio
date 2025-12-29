var categories = new Set();
var works = window.localStorage.getItem("works");
var token = window.localStorage.getItem("token");
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

// affichage du login
const loginLink = document.querySelector("#login-link");
loginLink.addEventListener("click", async function (event) {
    document.querySelectorAll("main>section").forEach(function (element) {
        if (element.id == "login")
            element.classList.remove("hidden");
        else
            element.classList.add("hidden");
    });
});

// affichage du contact
const contactLink = document.querySelector("#contact-link");
contactLink.addEventListener("click", async function (event) {
    document.querySelectorAll("main>section").forEach(function (element) {
        if (element.id == "contact")
            element.classList.remove("hidden");
        else
            element.classList.add("hidden");
    });
});

// affichage des projets
const projetsLink = document.querySelector("#projets-link");
projetsLink.addEventListener("click", async function (event) {
    document.querySelectorAll("main>section").forEach(function (element) {
        if (element.id == "login")
            element.classList.add("hidden");
        else
            element.classList.remove("hidden");
    });
});

// formulaire de login
const loginForm = document.querySelector("#login form");
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Empêche le rechargement de la page
    // paramètres de la requête
    const data = {
        email: event.target.querySelector("[name=email]").value,
        password: event.target.querySelector("[name=password]").value
    };
    // Appel API
    fetch(api + "/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(response => {
        response.json().then(data => {// obtient le corps de la réponse
            console.debug(data);
            var message = document.querySelector("#login-message");
            if (data.message) {
                switch (data.message) {
                    case "user not found":
                        message.innerText = "Utilisateur introuvable";
                        break;
                    default:
                        message.innerText = data.message;
                        break;
                }
            }
            else if (response.ok && data.token) {
                window.localStorage.setItem("token", data.token);
                message.innerText = "";
                // recharge la page
                window.location.reload();
            }
            else {
                message.innerText = "Échec de l'authentification";
            }
        });
    });
});