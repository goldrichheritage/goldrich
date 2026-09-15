let currentFilter = "All";

function changeImage(image, number) {

    document.getElementById("mainImage").src = image.src;
    const thumbnails = document.querySelectorAll(".thumbnail");
    thumbnails.forEach(function(thumbnail) {
        thumbnail.classList.remove("active");
    });

    image.parentElement.classList.add("active");
    document.getElementById("imageCounter").textContent = number + " / " + thumbnails.length;

}

function initializeImageCounter() {
    const counter = document.getElementById("imageCounter");
    const thumbnails = document.querySelectorAll(".thumbnail");
    if (counter && thumbnails.length) {
        counter.textContent = "1 / " + thumbnails.length;
    }
}

initializeImageCounter();

function setupImageViewer() {
    const mainImage = document.querySelector(".main-image img");
    if (!mainImage) {
        return;
    }

    const viewer = document.createElement("div");
    viewer.className = "image-viewer";
    viewer.setAttribute("aria-hidden", "true");
    viewer.innerHTML = `
        <button class="image-viewer-close" type="button" aria-label="Close image">&times;</button>
        <img class="image-viewer-content" alt="">
    `;
    document.body.appendChild(viewer);

    const viewerImage = viewer.querySelector(".image-viewer-content");
    const closeViewer = function() {
        viewer.classList.remove("is-open");
        viewer.setAttribute("aria-hidden", "true");
        document.body.classList.remove("image-viewer-open");
    };

    mainImage.addEventListener("click", function() {
        viewerImage.src = mainImage.src;
        viewerImage.alt = mainImage.alt;
        viewer.classList.add("is-open");
        viewer.setAttribute("aria-hidden", "false");
        document.body.classList.add("image-viewer-open");
    });

    viewer.addEventListener("click", function(event) {
        if (event.target === viewer || event.target.classList.contains("image-viewer-close")) {
            closeViewer();
        }
    });

    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            closeViewer();
        }
    });
}

setupImageViewer();

function filterCollection(type) {
    currentFilter = type;
    const buttons = document.querySelectorAll(".filter-button");
    buttons.forEach(function(button) {
        button.classList.remove("active");
    });
    buttons.forEach(function(button) {
        if (button.textContent.trim() === type) {
            button.classList.add("active");
        }
    });
    applyFilters();
}

function updateCollectionCount(count) {
    const countElement = document.getElementById("collectionCount");
    if (!countElement) {
        return;
    }

    const total = typeof count === "number" ? count : 0;
    countElement.textContent = total + (total === 1 ? " object" : " objects");
}

function applyFilters() {
    const searchInput = document.getElementById("searchInput");
    const searchText = searchInput
        ? searchInput.value.toLowerCase()
        : "";
    const cards = document.querySelectorAll(".collection-card");
    cards.forEach(function(card) {
        const cardType = card.getAttribute("data-type");
        const cardText = card.textContent.toLowerCase();
        const matchesType =
            currentFilter === "All" ||
            cardType === currentFilter;
        const matchesSearch =
            cardText.includes(searchText);
        if (matchesType && matchesSearch) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });

    const visibleCards = document.querySelectorAll(
        ".collection-card:not([style*='display: none'])"
    );
    updateCollectionCount(visibleCards.length);
}

const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("input", function() {
        const searchText = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll(".collection-card");

        cards.forEach(function(card) {
            const cardText = card.textContent.toLowerCase();
            if (cardText.includes(searchText)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });

        const visibleCards = document.querySelectorAll(
            ".collection-card:not([style*='display: none'])"
        );
        updateCollectionCount(visibleCards.length);
    });
}

fetch("collection-data.json")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        const container = document.getElementById("collectionContainer");
        if (!container) {
            return;
        }
        data.forEach(function(object) {
            const card = document.createElement("div");
            card.className = "collection-card";
            card.setAttribute("data-type", object.type);
            card.classList.add("compact-image-card");
            if (object.collectionNumber === "FDA011") {
                card.classList.add("tall-image-card");
            }
            // 自动生成详情页链接
            const detailPage =
                `detail.html?id=${encodeURIComponent(object.collectionNumber)}`;
            const period = object.period
                ? `<p>Period: ${object.period}</p>`
                : "";

            card.innerHTML = `
                <a class="collection-card-image"
                   href="${detailPage}"
                   aria-label="View ${object.name}">
                    <img src="${object.image}" alt="${object.name}">
                </a>

                <div class="collection-card-content">

                    <h2>
                        <a href="${detailPage}">
                            ${object.name}
                        </a>
                    </h2>

                    <p>
                        Collection Number: ${object.collectionNumber}
                    </p>

                    ${period}

                    <p>
                        Type: ${object.type}
                    </p>

                </div>
            `;

            container.appendChild(card);

        });

        applyFilters();

    });