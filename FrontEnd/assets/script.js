let categories = [];
let works = window.localStorage.getItem("works");
let token = window.localStorage.getItem("token");
const noCache = false;
const api = "http://localhost:5678/api";
let curCategoryFilter = null;

// Méthode pour récupérer les travaux depuis l'API
async function getWorks() {
    const reponse = await fetch(api + "/works");
    works = await reponse.json();
    // Stockage des informations dans le localStorage
    window.localStorage.setItem("works", JSON.stringify(works));
}

// Méthode pour obtenir les catégories
// works doit être initialisé
function getCategories() {
    categories = [];
    works.forEach(work => {
        if (!categories.find(x => work.category.id == x.id))
            categories.push(work.category);
    });
}

// déconnexion de l'utilisateur
function logout() {
    window.localStorage.removeItem("token");
    window.location.reload();
}

// Evenement pour fermer (cacher) la modale
document.querySelectorAll(".close-button").forEach((e) => {
    e.addEventListener("click", async function (event) {
        const parentModal = event.target.closest(".modal");
        parentModal.classList.add("hidden");
    });
});

function initPageContent(pageName) {
    if (pageName === "galery") {
        // ne fait rien
    }
    if (pageName === "upload") {
        // cache le preview, affiche la sélection, réinitialise le texte
        const selection = document.querySelector("#upload-file");
        const preview = document.querySelector("#upload-preview");
        const message = document.querySelector("#upload-message");
        const form = document.querySelector("#upload-form");
        selection.classList.remove("hidden");
        preview.classList.add("hidden");
        message.innerText = "";
        form.reset();
    }
}

// Evenement pour afficher la page suivante du modal
document.querySelectorAll(".next-button").forEach((e) => {
    e.addEventListener("click", async function (event) {
        const parentContent = event.target.closest(".modal-content-page");
        parentContent.classList.add("hidden");
        parentContent.nextElementSibling.classList.remove("hidden");
        initPageContent(parentContent.nextElementSibling.getAttribute("name"));
    });
});

// Evenement pour afficher la page précédente du modal
document.querySelectorAll(".prev-button").forEach((e) => {
    e.addEventListener("click", async function (event) {
        const parentContent = event.target.closest(".modal-content-page");
        parentContent.classList.add("hidden");
        parentContent.previousElementSibling.classList.remove("hidden");
        initPageContent(parentContent.previousElementSibling.getAttribute("name"));
    });
});

// Evenement pour afficher la modale 'gallery'
document.querySelector(".edit-mode-projets a").addEventListener("click", async function (event) {
    const modal = document.querySelector("#gallery-modal");
    const selection = document.querySelector("#upload-file");
    const preview = document.querySelector("#upload-preview");
    modal.classList.remove("hidden");
    // affiche la première page, cache les autres
    modal.querySelectorAll(".modal-content-page").forEach(function (content) {
        content.classList.add("hidden");
    });
    modal.querySelector(".modal-content-page:first-child").classList.remove("hidden");
    // initialise la premiere page
    initPageContent(modal.querySelector(".modal-content-page").getAttribute("name"));
});

// Evenement pour fermer (cacher) la modale
document.querySelectorAll(".modal").forEach((e) => {
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
    // Actualise la galerie des projets
    const worksContainer = document.querySelector(".gallery");
    worksContainer.innerHTML = "";
    works.forEach(work => {
        if (curCategoryFilter && work.category.name !== curCategoryFilter.name)
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
        // au clic, on supprime le projet
        figure.querySelector(".delete-button").addEventListener("click", async function (event) {
            deleteWork(work.id);
        });
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
        button.innerText = category.name;
        button.addEventListener("click", function () {
            curCategoryFilter = category;
            refreshHtmlWorks();
        });
        filtersContainer.appendChild(button);
    });

    // Ajout du choix de la catégorie
    const uploadCombo = document.querySelector("#upload-category-list");
    uploadCombo.innerHTML = "";
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.innerText = category.name;
        uploadCombo.appendChild(option);
    });

    // Affiche les éléments d'édition si l'utilisateur est connecté
    if (token)
        showEditing();
}

// affichage du login / déconnection
document.querySelector("#login-link").addEventListener("click", async function (event) {
    // si l'utilisateur est déjà loggé
    if (token) {
        // logout
        logout();
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
document.querySelector("#contact-link").addEventListener("click", async function (event) {
    document.querySelectorAll("main>section").forEach(function (element) {
        if (element.id == "contact")
            element.classList.remove("hidden");
        else
            element.classList.add("hidden");
    });
});

// affichage des projets
document.querySelector("#projets-link").addEventListener("click", async function (event) {
    document.querySelectorAll("main>section").forEach(function (element) {
        if (element.id == "login")
            element.classList.add("hidden");
        else
            element.classList.remove("hidden");
    });
});

// formulaire de login
document.querySelector("#login form").addEventListener("submit", async function (event) {
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
            const message = document.querySelector("#login-message");
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

// supprime un projet
function deleteWork(id) {
    // paramètres de la requête
    const data = {
        id: id
    };
    // Appel API
    fetch(api + "/works/" + data.id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(data)
    }).then(response => {
        if (response.ok) {
            // actualise la page
            refreshContent();
        }
    });
}

// ajoute un projet
function addWork(data) {
    // Appel API
    fetch(api + "/works", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(data)
    }).then(response => {
        if (response.ok) {
            // actualise la page
            refreshContent();
        }
    });
}


// Ajoute un projet via le formulaire de la modale
document.querySelector("#upload-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Empêche le rechargement de la page

    const modal = document.querySelector("#gallery-modal");
    const form = document.querySelector("#upload-form");
    const data = new FormData(form);
    const message = document.querySelector("#upload-message");

    console.debug(data);

    if (data.get("image").size === 0) {
        message.innerHTML = "Veuillez sélectionner une image.";
        return;
    }

    if (data.get("title") === "") {
        message.innerHTML = "Veuillez saisir un titre.";
        return;
    }

    const request = new XMLHttpRequest();
    request.open("POST", api + "/works", true);
    request.setRequestHeader('Authorization', "Bearer " + token);
    request.onload = (progress) => {
        // Si ok actualise le contenu
        if (request.status >= 200 && request.status < 300) {
            // actualise la page
            modal.classList.add("hidden");
            refreshContent();
        }
        else if (request.status === 401) {
            alert("Votre session a expiré. Vous devez vous reconnecter.");
            logout(); // ou refresh token
        }
        else {
            const error = `Erreur ${request.status} lors de la tentative de téléversement du fichier.`;
            message.innerHTML = error;
            console.debug(error);
        }
    };

    request.send(data);
});

document.querySelector("#gallery-validate").addEventListener("click", async function (event) {
    const form = document.querySelector("#upload-form");
    form.requestSubmit();
});

// evenement d'upload de l'image
document.querySelector("#upload-button").addEventListener("click", async function (event) {
    const selection = document.querySelector("#upload-file");
    const preview = document.querySelector("#upload-preview");
    const image = document.querySelector("#upload-image");
    const input = document.querySelector("#upload-input");

    // (délégue le choix du fichier à l'input natif du formulaire)
    input.click();

    // après sélectionne met à jour l'aperçu
    input.addEventListener("change", () => {
        if (input.files.length === 0) {
            // L’utilisateur a ouvert la boîte de dialogue puis annulé
            preview.classList.add("hidden");
            selection.classList.remove("hidden");
            return;
        }

        // L’utilisateur a terminé sa sélection
        const file = input.files[0];
        const url = URL.createObjectURL(file);
        image.src = url;
        image.onload = () => URL.revokeObjectURL(url); // libère la mémoire
        preview.classList.remove("hidden");
        selection.classList.add("hidden");
    });
});


//****************************************************************** */
// Programme principal
//****************************************************************** */

function init() {
    // Charge les données si besoin et actualise l'affichage
    if (!works || noCache)
        getWorks().then(function () { refreshHtmlWorks(); });
    else {
        works = JSON.parse(works);
        refreshHtmlWorks();
    }
}


async function refreshContent() {
    await getWorks().then(function () { refreshHtmlWorks(); });
}