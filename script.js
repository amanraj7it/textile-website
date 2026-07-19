gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("scroll-canvas");
const context = canvas.getContext("2d");

// Responsive canvas initialization
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
}
window.addEventListener("resize", resizeCanvas);

// Configuration
const frameCount = 300;
const currentFrame = index => (
    `frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
);

const images = new Array(frameCount);
const imageSeq = { frame: 0 };


const loader = document.getElementById('loader');
const progressText = document.getElementById('load-progress');
let loadedCount = 0;

// Proper Sequential Loader to prevent network bottlenecking
function loadImagesProperly() {
    // First, load frame 0 to show the screen immediately
    const firstImg = new Image();
    firstImg.onload = () => {
        images[0] = firstImg;
        loadedCount++;
        progressText.innerText = Math.round((loadedCount / frameCount) * 100);
        initAnimation();

        // After first image is ready, load the rest in small batches to preserve bandwidth
        loadRestInBatches(1);
    };
    firstImg.src = currentFrame(0);
}

function loadRestInBatches(startIndex) {
    const batchSize = 3; // Load 3 images at a time so Vercel doesn't block requests
    let i = startIndex;

    function loadNextBatch() {
        if (i >= frameCount) return;

        let batchPromises = [];
        for (let j = 0; j < batchSize && i + j < frameCount; j++) {
            const index = i + j;
            batchPromises.push(new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    images[index] = img;
                    loadedCount++;
                    // Update progress softly in the background just in case
                    if (progressText) {
                        progressText.innerText = Math.round((loadedCount / frameCount) * 100);
                    }
                    // Trigger a re-render if the user is currently looking at this frame
                    if (imageSeq.frame === index) render();
                    resolve();
                };
                img.onerror = () => resolve(); // handle missing frames safely
                img.src = currentFrame(index);
            }));
        }

        Promise.all(batchPromises).then(() => {
            i += batchSize;
            loadNextBatch();
        });
    }

    loadNextBatch();
}

function initAnimation() {
    // Hide loader smoothly
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 800);

    resizeCanvas();

    // Global ScrollTrigger animation attached to the body
    gsap.to(imageSeq, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
        },
        onUpdate: render
    });
}

function render() {
    const img = images[imageSeq.frame];
    // Only render if image is fully loaded and decoded
    if (img && img.complete && img.naturalWidth !== 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        const r = Math.max(
            canvas.width / img.width,
            canvas.height / img.height
        );
        const w = img.width * r;
        const h = img.height * r;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        context.drawImage(
            img,
            (canvas.width - w) / 2,
            (canvas.height - h) / 2,
            w, h
        );
    }
}

// Start the loading process
loadImagesProperly();

// Fade in animations for sections as they scroll into view
gsap.utils.toArray('.fade-in').forEach(section => {
    gsap.fromTo(section,
        { opacity: 0, y: 50 },
        {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        }
    );
});

// Fade out the hero text when scrolling down
gsap.to(".hero-section", {
    opacity: 0,
    y: -50,
    scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: 1
    }
});

// Update navbar on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});
