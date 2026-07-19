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

const images = [];
const imageSeq = { frame: 0 };

// Preload Images with Progress
let loadedCount = 0;
const loader = document.getElementById('loader');
const progressText = document.getElementById('load-progress');
let initialized = false;

for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.onload = () => {
        loadedCount++;
        progressText.innerText = Math.round((loadedCount / frameCount) * 100);

        if (!initialized && loadedCount >= 3) {
            initialized = true;
            initAnimation();
        }
    };
    img.src = currentFrame(i);
    images.push(img);
}

function initAnimation() {
    // Hide loader
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
            scrub: 1, // Reduced from 1.5 to 1 for tighter response
        },
        onUpdate: render
    });
}

function render() {
    const img = images[imageSeq.frame];
    if (img && img.complete && img.naturalWidth !== 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        const r = Math.max(
            canvas.width / img.width,
            canvas.height / img.height
        );
        const w = img.width * r;
        const h = img.height * r;

        // High quality image smoothing
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
