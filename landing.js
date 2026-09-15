const featuredCollectionNumbers = ["FDA002", "FDA005", "FDA009", "TPS003"];
const rotationInterval = 5200;

const featuredLink = document.getElementById("featuredObjectLink");
const featuredImage = document.getElementById("featuredObjectImage");
const featuredIndex = document.getElementById("featuredObjectIndex");
const featuredCaption = document.getElementById("featuredObjectCaption");

if (featuredLink && featuredImage && featuredIndex && featuredCaption) {
    fetch("collection-data.json")
        .then(function(response) {
            return response.json();
        })
        .then(function(objects) {
            const featuredObjects = objects
                .filter(function(object) {
                    return featuredCollectionNumbers.includes(object.collectionNumber) && object.image;
                })
                .sort(function(firstObject, secondObject) {
                    return featuredCollectionNumbers.indexOf(firstObject.collectionNumber) -
                        featuredCollectionNumbers.indexOf(secondObject.collectionNumber);
                });

            if (!featuredObjects.length) {
                return;
            }

            let currentIndex = 0;

            const updateFeaturedObject = function(nextIndex, immediate) {
                const object = featuredObjects[nextIndex];
                const detailPage = `detail.html?id=${encodeURIComponent(object.collectionNumber)}`;
                const updateImage = function() {
                    featuredLink.href = detailPage;
                    featuredImage.src = object.image;
                    featuredImage.alt = object.name;
                    featuredIndex.textContent = String(nextIndex + 1).padStart(2, "0");
                    featuredCaption.innerHTML = `${object.name}<br>${object.period || object.type}`;
                    featuredLink.classList.remove("is-changing");
                };

                if (immediate) {
                    updateImage();
                    return;
                }

                featuredLink.classList.add("is-changing");
                window.setTimeout(updateImage, 280);
            };

            updateFeaturedObject(currentIndex, true);

            if (featuredObjects.length > 1) {
                window.setInterval(function() {
                    currentIndex = (currentIndex + 1) % featuredObjects.length;
                    updateFeaturedObject(currentIndex, false);
                }, rotationInterval);
            }
        })
        .catch(function(error) {
            console.error("Unable to load featured collection objects.", error);
        });
}
