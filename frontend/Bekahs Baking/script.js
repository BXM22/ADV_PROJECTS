const nav = document.getElementById("nav");
const navLinks = document.querySelectorAll(".nav-links a");
const fadeSections = document.querySelectorAll(".fade-in");

function handleScroll() {
  if (window.scrollY > 60) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
}

function observeSections() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.3,
    }
  );

  fadeSections.forEach((section) => observer.observe(section));
}

function setActiveNav() {
  const fromTop = window.scrollY + 100;

  navLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (!section) return;

    if (
      section.offsetTop <= fromTop &&
      section.offsetTop + section.offsetHeight > fromTop
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function setYear() {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

function initCarousel() {
  const carousel = document.getElementById("creationsCarousel");
  if (!carousel) return;

  const slides = carousel.querySelectorAll(".carousel-slide");
  const thumbs = carousel.querySelectorAll(".thumb");
  const prevBtn = carousel.querySelector(".carousel-control.prev");
  const nextBtn = carousel.querySelector(".carousel-control.next");
  const shell = carousel.querySelector(".carousel-shell");

  if (!slides.length) return;

  let currentIndex = 0;
  let autoRotateId = null;

  function setActive(index) {
    const total = slides.length;
    if (!total) return;

    currentIndex = (index + total) % total;

    slides.forEach((slide, idx) => {
      const isActive = idx === currentIndex;
      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", (!isActive).toString());
    });

    thumbs.forEach((thumb, idx) => {
      const isActive = idx === currentIndex;
      thumb.classList.toggle("active", isActive);
      thumb.setAttribute("aria-selected", isActive.toString());
      thumb.setAttribute("tabindex", isActive ? "0" : "-1");
    });
  }

  function goToNext() {
    setActive(currentIndex + 1);
  }

  function goToPrevious() {
    setActive(currentIndex - 1);
  }

  function stopAutoRotate() {
    if (autoRotateId) {
      clearInterval(autoRotateId);
      autoRotateId = null;
    }
  }

  function startAutoRotate() {
    stopAutoRotate();
    if (slides.length > 1) {
      autoRotateId = setInterval(() => {
        goToNext();
      }, 6000);
    }
  }

  function resetAutoRotate() {
    stopAutoRotate();
    startAutoRotate();
  }

  prevBtn?.addEventListener("click", () => {
    goToPrevious();
    resetAutoRotate();
  });

  nextBtn?.addEventListener("click", () => {
    goToNext();
    resetAutoRotate();
  });

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const targetIndex = Number(thumb.dataset.index);
      if (!Number.isNaN(targetIndex)) {
        setActive(targetIndex);
        resetAutoRotate();
      }
    });
  });

  if (shell) {
    shell.setAttribute("tabindex", "0");
    shell.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNext();
        resetAutoRotate();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevious();
        resetAutoRotate();
      }
    });

    shell.addEventListener("mouseenter", stopAutoRotate);
    shell.addEventListener("mouseleave", startAutoRotate);
  }

  setActive(0);
  startAutoRotate();
}

window.addEventListener("scroll", () => {
  handleScroll();
  setActiveNav();
});

window.addEventListener("DOMContentLoaded", () => {
  handleScroll();
  observeSections();
  setActiveNav();
  setYear();
  initCarousel();
});

