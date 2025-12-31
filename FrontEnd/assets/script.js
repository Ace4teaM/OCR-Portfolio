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

// Evenement pour fermer (cacher) la modale
const closeButton = document.querySelectorAll(".close-button");
closeButton.forEach((e) => {
    e.addEventListener("click", async function (event) {
        var parentModal = event.target.closest(".modal");
        parentModal.classList.add("hidden");
    });
});

// Evenement pour afficher la page suivante du modal
const nextButton = document.querySelectorAll(".next-button");
nextButton.forEach((e) => {
    e.addEventListener("click", async function (event) {
        var parentContent = event.target.closest(".modal-content-page");
        parentContent.classList.add("hidden");
        parentContent.nextElementSibling.classList.remove("hidden");
    });
});

// Evenement pour afficher la page précédente du modal
const prevButton = document.querySelectorAll(".prev-button");
prevButton.forEach((e) => {
    e.addEventListener("click", async function (event) {
        var parentContent = event.target.closest(".modal-content-page");
        parentContent.classList.add("hidden");
        parentContent.previousElementSibling.classList.remove("hidden");
    });
});

// Evenement pour afficher la modale 'gallery'
const projectEditButton = document.querySelector(".edit-mode-projets a");
projectEditButton.addEventListener("click", async function (event) {
    var modal = document.querySelector("#gallery-modal");
    modal.classList.remove("hidden");
    // affiche la première page, cache les autres
    modal.querySelectorAll(".modal-content-page").forEach(function (content) {
        content.classList.add("hidden");
    });
    modal.querySelector(".modal-content-page:first-child").classList.remove("hidden");
});

// Evenement pour fermer (cacher) la modale
const modalClick = document.querySelectorAll(".modal");
modalClick.forEach((e) => {
    e.addEventListener("click", async function (event) {
        // s'assure que l'item cliqué n'est pas un enfant du modal
        if (event.target !== e)
            return;
        event.target.classList.add("hidden");
    });
});


// Méthode pour afficher les éléments d'édition
// tous les éléments d'édition porte le mêmle nom d'attribut "edit-mode"
function showEditing() {
    document.getElementsByName("edit-mode").forEach(function (element) {
        element.classList.remove("hidden");
    });
    document.getElementById("login-link").innerText = "logout";
}

// Méthode pour mettre à jour le contenu de la page
function refreshHtmlWorks() {
    console.debug("refreshHtmlWorks");

    // Actualise la galerie des projets
    const worksContainer = document.querySelector(".gallery");
    worksContainer.innerHTML = "";
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

    // Actualise la galerie des projets
    const picturesContainer = document.querySelector(".pictures");
    picturesContainer.innerHTML = "";
    works.forEach(work => {
        const figure = document.createElement("figure");
        figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
			<i class="delete-button fa-solid fa-trash-can"></i>
        `;
        picturesContainer.appendChild(figure);
    });

    // Obtient les catégories
    getCategories();

    // Ajout des filtres par catégories
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

    // Ajout du choix de la catégorie
    const uploadCombo = document.querySelector("#upload-category-list");
    uploadCombo.innerHTML = "";
    uploadCombo.appendChild(firstChild);
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.innerText = category;
        uploadCombo.appendChild(option);
    });

    // Affiche les éléments d'édition si l'utilisateur est connecté
    if (token)
        showEditing();
}

// affichage du login / déconnection
const loginLink = document.querySelector("#login-link");
loginLink.addEventListener("click", async function (event) {
    // si l'utilisateur est déjà loggé
    if (token) {
        // logout
        window.localStorage.removeItem("token");
        window.location.reload();
    }
    // sinon affichage du login
    else {
        document.querySelectorAll("main>section").forEach(function (element) {
            if (element.id == "login")
                element.classList.remove("hidden");
            else
                element.classList.add("hidden");
        });
    }
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


//****************************************************************** */
// Programme principal
//****************************************************************** */


// Charge les données si besoin et actualise l'affichage
if (!works || noCache)
    getWorks().then(function () { refreshHtmlWorks(); });
else {
    works = JSON.parse(works);
    refreshHtmlWorks();
}
