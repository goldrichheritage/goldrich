// ========================================
// Get collection number from URL
// ========================================

const params = new URLSearchParams(window.location.search);

const collectionNumber = params.get("id");


// ========================================
// Load collection data
// ========================================

fetch("collection-data.json")

    .then(function(response) {
        return response.json();
    })

    .then(function(data) {


        // Find current object

        const object = data.find(function(item) {

            return item.collectionNumber === collectionNumber;

        });


        // ========================================
        // If object does not exist
        // ========================================

        if (!object) {

            document.querySelector(".object-detail").innerHTML = `
                <div>
                    <h1>Collection Not Found</h1>
                    <p>Sorry, this collection item does not exist.</p>
                </div>
            `;

            return;
        }


        // ========================================
        // Page title
        // ========================================

        document.title =
            `${object.name} | GOLDRICH Collection`;


        // ========================================
        // Basic information
        // ========================================

        document.getElementById("objectName").textContent =
            object.name;


        document.getElementById("englishName").textContent =
            object.englishName || "";


        document.getElementById("collectionNumber").textContent =
            object.collectionNumber;


        document.getElementById("type").textContent =
            object.type || "—";


        document.getElementById("material").textContent =
            object.material || object.type || "—";


        document.getElementById("period").textContent =
            object.period || "—";


        document.getElementById("dimensions").innerHTML =
            object.dimensions
                ? object.dimensions.replace(/[,;]\s*/g, "<br>")
                : "—";


        document.getElementById("collector").textContent =
            object.collector || "—";


        const introductionBlock = document.querySelector(".object-description");
        if (object.introduction) {
            document.getElementById("introduction").textContent = object.introduction;
        } else if (introductionBlock) {
            introductionBlock.hidden = true;
        }


        // ========================================
        // Images
        // ========================================

        const images =
            object.images && object.images.length
                ? object.images
                : [object.image];


        const mainImage =
            document.getElementById("mainImage");


        const imageCounter =
            document.getElementById("imageCounter");


        const thumbnailContainer =
            document.getElementById("thumbnailImages");


        let currentIndex = 0;


        // ========================================
        // Show image
        // ========================================

        function showImage(index) {

            currentIndex = index;


            mainImage.src =
                images[currentIndex];


            mainImage.alt =
                object.name;


            imageCounter.textContent =
                `${currentIndex + 1} / ${images.length}`;


            // Update thumbnail active state

            const thumbnails =
                document.querySelectorAll(
                    ".thumbnail img"
                );


            thumbnails.forEach(function(img, i) {

                if (i === currentIndex) {

                    img.classList.add("active");

                } else {

                    img.classList.remove("active");

                }

            });

        }


        // ========================================
        // Create thumbnails
        // ========================================

        images.forEach(function(image, index) {

            const thumbnail =
                document.createElement("div");


            thumbnail.className =
                "thumbnail";


            const img =
                document.createElement("img");


            img.src = image;


            img.alt =
                `${object.name} - Image ${index + 1}`;


            img.addEventListener(
                "click",
                function() {

                    showImage(index);

                }
            );


            thumbnail.appendChild(img);


            thumbnailContainer.appendChild(
                thumbnail
            );

        });


        // ========================================
        // Initial image
        // ========================================

        showImage(0);


        // ========================================
        // Image Viewer
        // ========================================

        const imageViewer =
            document.getElementById("imageViewer");


        const imageViewerContent =
            document.getElementById(
                "imageViewerContent"
            );


        const imageViewerClose =
            document.getElementById(
                "imageViewerClose"
            );


        // Open large image

        mainImage.addEventListener(
            "click",
            function() {

                imageViewerContent.src =
                    mainImage.src;

                imageViewerContent.alt =
                    mainImage.alt;

                imageViewer.classList.add(
                    "is-open"
                );

                document.body.classList.add(
                    "image-viewer-open"
                );

            }
        );


        // Close

        imageViewerClose.addEventListener(
            "click",
            function() {

                imageViewer.classList.remove(
                    "is-open"
                );

                document.body.classList.remove(
                    "image-viewer-open"
                );

            }
        );


        // Click background to close

        imageViewer.addEventListener(
            "click",
            function(event) {

                if (
                    event.target === imageViewer
                ) {

                    imageViewer.classList.remove(
                        "is-open"
                    );

                    document.body.classList.remove(
                        "image-viewer-open"
                    );

                }

            }
        );


        // ESC to close

        document.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Escape"
                ) {

                    imageViewer.classList.remove(
                        "is-open"
                    );

                    document.body.classList.remove(
                        "image-viewer-open"
                    );

                }

            }
        );

    });
