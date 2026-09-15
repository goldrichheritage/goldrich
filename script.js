let currentFilter = "All";
const availableFilters = new Set(
    Array.from(document.querySelectorAll(".filter-button"))
        .map(function(button) { return button.dataset.filter; })
);

function normalizeText(value) {
    return (value || "").trim().toLocaleLowerCase();
}

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
    currentFilter = availableFilters.has(type) ? type : "All";
    const buttons = document.querySelectorAll(".filter-button");
    buttons.forEach(function(button) {
        const isActive = button.dataset.filter === currentFilter;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
    applyFilters();
}

function updateCollectionCount(count) {
    const countElement = document.getElementById("collectionCount");
    const emptyState = document.getElementById("emptyCollectionState");
    if (!countElement) {
        return;
    }

    const total = typeof count === "number" ? count : 0;
    countElement.textContent = total + (total === 1 ? " object" : " objects");
    if (emptyState) {
        emptyState.hidden = total > 0;
    }
}

function applyFilters() {
    const searchInput = document.getElementById("searchInput");
    const searchText = normalizeText(searchInput ? searchInput.value : "");
    const cards = Array.from(document.querySelectorAll(".collection-card"));
    const matchingCards = cards.filter(function(card) {
        const cardType = card.getAttribute("data-type") || "";
        const cardText = card.dataset.searchIndex || "";
        const matchesType =
            currentFilter === "All" ||
            cardType === currentFilter;
        const matchesSearch =
            cardText.includes(searchText);
        return matchesType && matchesSearch;
    });

    cards.forEach(function(card) {
        const visibleIndex = matchingCards.indexOf(card);
        card.style.display = visibleIndex !== -1
            ? ""
            : "none";
    });

    updateCollectionCount(matchingCards.length);
    updateCardFocus();
}

const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("input", function() {
        applyFilters();
    });
}

document.querySelectorAll(".filter-button").forEach(function(button) {
    button.addEventListener("click", function() {
        filterCollection(button.dataset.filter);
    });
});

function setupCardReveal() {
    const cards = document.querySelectorAll(".collection-card");
    if (!("IntersectionObserver" in window)) {
        cards.forEach(function(card) {
            card.classList.add("is-visible");
        });
        return;
    }

    const revealGroups = [];
    for (let index = 0; index < cards.length; index += 4) {
        revealGroups.push(Array.from(cards).slice(index, index + 4));
    }

    const observer = new IntersectionObserver(function(entries, revealObserver) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) {
                return;
            }
            const group = revealGroups.find(function(items) {
                return items.includes(entry.target);
            });
            if (!group) {
                return;
            }
            group.forEach(function(card, groupIndex) {
                card.style.setProperty("--reveal-delay", `${groupIndex * 45}ms`);
                card.classList.add("is-visible");
                revealObserver.unobserve(card);
            });
        });
    }, { threshold: 0.08 });

    cards.forEach(function(card) {
        observer.observe(card);
    });
}

let cardFocusFrame;

function updateCardFocus() {
    const cards = Array.from(document.querySelectorAll(".collection-card"));
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const fullyVisibleCards = cards.filter(function(card) {
        if (card.style.display === "none") {
            return false;
        }
        const image = card.querySelector(".collection-card-image");
        if (!image) {
            return false;
        }
        const bounds = image.getBoundingClientRect();
        return bounds.top >= 0 && bounds.bottom <= viewportHeight;
    });
    const focusedCards = fullyVisibleCards.slice(0, 5);
    const shouldDim = focusedCards.length >= 5;

    cards.forEach(function(card) {
        card.classList.toggle("is-muted", shouldDim && !focusedCards.includes(card));
    });
}

function scheduleCardFocus() {
    if (cardFocusFrame) {
        return;
    }
    cardFocusFrame = window.requestAnimationFrame(function() {
        cardFocusFrame = undefined;
        updateCardFocus();
    });
}

window.addEventListener("scroll", scheduleCardFocus, { passive: true });
window.addEventListener("resize", scheduleCardFocus);

fetch("collection-data.json")
    .then(function(response) {
        if (!response.ok) {
            throw new Error(`Could not load collection data (${response.status})`);
        }
        return response.json();
    })
    .then(function(data) {
        const container = document.getElementById("collectionContainer");
        if (!container) {
            return;
        }
        data.forEach(function(object) {
            const card = document.createElement("div");
            const catalogRatio = ["4 / 5", "1 / 1", "3 / 4"][
                container.children.length % 3
            ];
            card.className = "collection-card";
            card.setAttribute("data-type", object.type);
            card.dataset.searchIndex = normalizeText([
                object.name,
                object.englishName,
                object.collectionNumber,
                object.type,
                object.period,
                object.dimensions
            ].join(" "));
            card.setAttribute("data-catalog-ratio", catalogRatio);
            card.classList.add(`object-${object.collectionNumber.toLowerCase()}`);
            card.classList.add("compact-image-card");
            if (/[盏碗盘]/.test(object.name)) {
                card.classList.add("shallow-vessel-card");
            }
            // 自动生成详情页链接
            const detailPage =
                `detail.html?id=${encodeURIComponent(object.collectionNumber)}`;
            const period = object.period
                ? `<p class="collection-card-meta"><span>Period</span>${object.period}</p>`
                : "";
            const englishName = object.englishName
                ? `<p class="collection-card-english">${object.englishName}</p>`
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

                    ${englishName}

                    <p class="collection-card-meta">
                        <span>Collection No.</span>${object.collectionNumber}
                    </p>

                    ${period}

                    <p class="collection-card-meta">
                        <span>Type</span>${object.type}
                    </p>

                </div>
            `;

            container.appendChild(card);

            const imageElement = card.querySelector("img");
            const imageFrame = card.querySelector(".collection-card-image");

            const applyImageRatio = function() {
                if (!imageElement || !imageFrame) {
                    return;
                }

                imageFrame.style.setProperty("--image-ratio", catalogRatio);
            };

            if (imageElement.complete) {
                applyImageRatio();
            } else {
                imageElement.addEventListener("load", applyImageRatio, { once: true });
            }

        });

        setupCardReveal();

        const requestedType = new URLSearchParams(window.location.search).get("type");
        if (requestedType) {
            filterCollection(requestedType);
        } else {
            applyFilters();
        }

        scheduleCardFocus();

        if (window.location.hash === "#collection") {
            document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
        }

    })
    .catch(function(error) {
        console.error("Unable to load collection objects.", error);
        updateCollectionCount(0);
    });
