'use client';

import Image from 'next/image';
import { useEffect } from 'react';

const navLinks = [
  { href: '#story', label: 'Our Story' },
  { href: '#creations', label: 'Creations' },
  { href: '#events', label: 'Workshops' },
  { href: '#testimonials', label: 'Praise' },
  { href: '#contact', label: 'Visit' },
];

const featureCards = [
  {
    title: 'Seasonal Signature',
    description:
      "Rotating menus inspired by farmer's market finds, featuring fragrant herbs, ripe stone fruits, and warm spices from around the globe.",
  },
  {
    title: 'Slow Fermentation',
    description:
      'Naturally leavened breads nurtured over 48 hours for complex flavor, glossy crumb, and a delicate crackle.',
  },
  {
    title: 'Edible Artistry',
    description:
      'Hand-painted pastries and floral buttercream techniques that turn each dessert into a personal canvas.',
  },
  {
    title: 'Community Table',
    description:
      'Weekly gatherings, supper clubs, and collaborative pop-ups with local makers to celebrate the joy of sharing.',
  },
];

const carouselSlides = [
  {
    src: '/pictures/DSC06397.jpg',
    alt: 'Layered cake adorned with dried citrus and flowers',
    caption:
      'Layered celebration cake with dried citrus, edible petals, and buttercream ribbons.',
  },
  {
    src: '/pictures/DSC06398.jpg',
    alt: 'Assorted pastries arranged on a wooden board',
    caption:
      'Market morning pastry flight featuring kouign-amann, financiers, and seasonal galettes.',
  },
  {
    src: '/pictures/DSC06399.jpg',
    alt: 'Baker dusting croissants with powdered sugar',
    caption:
      'Golden croissants receiving their snowfall finish before the pastry case opens.',
  },
  {
    src: '/pictures/DSC06424.jpg',
    alt: 'Petite fruit tarts lined on a tray',
    caption:
      'Petite vanilla bean custard tarts topped with jewel-toned berries and micro herbs.',
  },
  {
    src: '/pictures/DSC06432.jpg',
    alt: 'Selection of sourdough loaves on marble',
    caption:
      'Slow-fermented sourdoughs scored with botanical motifs for our weekly bread drop.',
  },
  {
    src: '/pictures/DSC06421.jpg',
    alt: 'Decorated wedding cake with sugar flowers',
    caption:
      'Floral buttercream tiers crafted for a greenhouse wedding under twinkle lights.',
  },
];

const galleryItems = [
  {
    src: '/pictures/DSC06406.jpg',
    alt: 'Close-up of glazed donuts with floral accents',
    caption: 'Glazed brioche donuts finished with edible blossoms.',
  },
  {
    src: '/pictures/DSC06433.jpg',
    alt: 'Chef torching meringue on individual desserts',
    caption: 'Satin meringue torched tableside for citrus tartlets.',
    modifier: 'tall',
  },
  {
    src: '/pictures/DSC06437.jpg',
    alt: 'Chocolate pastries dusted with cocoa powder',
    caption: 'Chocolate choux clouds dusted with heirloom cocoa.',
    modifier: 'wide',
  },
  {
    src: '/pictures/DSC06438.jpg',
    alt: 'Dessert table styled with candles and greenery',
    caption: 'Storybook dessert tablescape for evening gatherings.',
  },
  {
    src: '/pictures/DSC06440.jpg',
    alt: 'Strawberry mousse domes with gold leaf',
    caption: 'Strawberry mousse domes crowned with gold leaf.',
  },
  {
    src: '/pictures/DSC06442.jpg',
    alt: 'Stack of cookies tied with ribbon',
    caption: 'Cookie keepsakes bundled for gifting moments.',
  },
  {
    src: '/pictures/DSC06447.jpg',
    alt: 'Hand-piped buttercream flowers on cupcakes',
    caption: 'Buttercream florals piped petal by petal.',
  },
  {
    src: '/pictures/DSC06448.jpg',
    alt: 'Assortment of seasonal pies on linen',
    caption: 'Seasonal pies layered with orchard fruit and spices.',
  },
  {
    src: '/pictures/DSC06449.jpg',
    alt: 'Decorative charcuterie-style dessert board',
    caption: 'Sweet charcuterie featuring truffles, tarts, and nougat.',
    modifier: 'wide',
  },
];

const stats = [
  { value: '12+', label: 'Seasonal menus launched each year' },
  { value: '220', label: 'Workshops hosted with joyful bakers' },
  { value: '4.9★', label: 'Average rating across community platforms' },
];

const events = [
  {
    title: 'Botanical Buttercream Lab',
    description: 'Master palette knife florals with seasonal hues.',
    meta: 'Dec 12 · Studio Kitchen',
  },
  {
    title: 'Sourdough & Spreads Brunch',
    description: 'Bake, break, and build toppings from savory to sweet.',
    meta: 'Jan 5 · Garden Courtyard',
  },
  {
    title: 'Family Pie Night',
    description: 'Bring your favorite people for a lattice pie experience.',
    meta: 'Feb 14 · Hearth Room',
  },
];

const testimonials = [
  {
    quote:
      '“The sourdough workshops are therapy. Bekah teaches with so much grace and lets everyone create something truly their own.”',
    author: '— Maya R.',
  },
  {
    quote:
      '“From the decor to the dessert flights, every dinner feels like a story. Our wedding cake was a masterpiece of flavor and florals.”',
    author: '— Chris & Lila',
  },
  {
    quote:
      '“I bring clients here to experience ‘delicious brand storytelling’. Bekah\'s pastries are edible moodboards!”',
    author: '— Jonah P.',
  },
];

const socials = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'Pinterest', href: 'https://pinterest.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
];

function useInteractiveEnhancements() {
  useEffect(() => {
    const nav = document.getElementById('nav');
    const navAnchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.nav-links a'),
    );
    const fadeSections = Array.from(
      document.querySelectorAll<HTMLElement>('.fade-in'),
    );

    const setActiveNav = () => {
      const fromTop = window.scrollY + 100;

      navAnchors.forEach((link) => {
        const selector = link.getAttribute('href');
        if (!selector) return;
        const section = document.querySelector<HTMLElement>(selector);
        if (!section) return;

        const inView =
          section.offsetTop <= fromTop &&
          section.offsetTop + section.offsetHeight > fromTop;
        if (inView) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    };

    const handleScroll = () => {
      if (nav) {
        if (window.scrollY > 60) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
      setActiveNav();
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.3 },
    );

    fadeSections.forEach((section) => observer.observe(section));

    const yearSpan = document.getElementById('year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear().toString();
    }

    const cleanupCarousel = (() => {
      const carousel = document.getElementById('creationsCarousel');
      if (!carousel) return () => {};

      const slides = Array.from(
        carousel.querySelectorAll<HTMLElement>('.carousel-slide'),
      );
      const thumbs = Array.from(
        carousel.querySelectorAll<HTMLButtonElement>('.thumb'),
      );
      const prevBtn = carousel.querySelector<HTMLButtonElement>(
        '.carousel-control.prev',
      );
      const nextBtn = carousel.querySelector<HTMLButtonElement>(
        '.carousel-control.next',
      );
      const shell = carousel.querySelector<HTMLElement>('.carousel-shell');

      if (!slides.length) return () => {};

      let currentIndex = 0;
      let autoRotateId: ReturnType<typeof setInterval> | null = null;

      const setActive = (index: number) => {
        const total = slides.length;
        currentIndex = (index + total) % total;

        slides.forEach((slide, idx) => {
          const isActive = idx === currentIndex;
          slide.classList.toggle('active', isActive);
          slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });

        thumbs.forEach((thumb, idx) => {
          const isActive = idx === currentIndex;
          thumb.classList.toggle('active', isActive);
          thumb.setAttribute('aria-selected', isActive ? 'true' : 'false');
          thumb.setAttribute('tabindex', isActive ? '0' : '-1');
        });
      };

      const goToNext = () => {
        setActive(currentIndex + 1);
      };

      const goToPrevious = () => {
        setActive(currentIndex - 1);
      };

      const stopAutoRotate = () => {
        if (autoRotateId) {
          clearInterval(autoRotateId);
          autoRotateId = null;
        }
      };

      const startAutoRotate = () => {
        stopAutoRotate();
        if (slides.length > 1) {
          autoRotateId = setInterval(() => {
            goToNext();
          }, 6000);
        }
      };

      const resetAutoRotate = () => {
        stopAutoRotate();
        startAutoRotate();
      };

      const handlePrev = () => {
        goToPrevious();
        resetAutoRotate();
      };

      const handleNext = () => {
        goToNext();
        resetAutoRotate();
      };

      prevBtn?.addEventListener('click', handlePrev);
      nextBtn?.addEventListener('click', handleNext);

      const thumbCleanups = thumbs.map((thumb) => {
        const handleThumb = () => {
          const targetIndex = Number(thumb.dataset.index);
          if (!Number.isNaN(targetIndex)) {
            setActive(targetIndex);
            resetAutoRotate();
          }
        };
        thumb.addEventListener('click', handleThumb);
        return () => thumb.removeEventListener('click', handleThumb);
      });

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          goToNext();
          resetAutoRotate();
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goToPrevious();
          resetAutoRotate();
        }
      };

      const handleMouseEnter = () => {
        stopAutoRotate();
      };

      const handleMouseLeave = () => {
        startAutoRotate();
      };

      if (shell) {
        shell.setAttribute('tabindex', '0');
        shell.addEventListener('keydown', handleKeyDown);
        shell.addEventListener('mouseenter', handleMouseEnter);
        shell.addEventListener('mouseleave', handleMouseLeave);
      }

      setActive(0);
      startAutoRotate();

      return () => {
        stopAutoRotate();
        prevBtn?.removeEventListener('click', handlePrev);
        nextBtn?.removeEventListener('click', handleNext);
        thumbCleanups.forEach((cleanup) => cleanup());
        if (shell) {
          shell.removeEventListener('keydown', handleKeyDown);
          shell.removeEventListener('mouseenter', handleMouseEnter);
          shell.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    })();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      cleanupCarousel();
    };
  }, []);
}

export default function Home() {
  useInteractiveEnhancements();

  return (
    <>
      <header className="nav" id="nav">
        <div className="logo">
          Bekah<span>&apos;s</span> Baking
        </div>
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <h1>Handcrafted Bakes with Heart &amp; Artistry</h1>
            <p>
              From sunrise sourdough to celebration cakes, Bekah&apos;s Baking Studio is where
              seasonal ingredients, slow craftsmanship, and a sprinkle of magic come together.
            </p>
            <a href="#events" className="primary-btn">
              Instagram
            </a>
          </div>
        </section>

        <section id="story">
          <h2 className="section-title">A Slice of Bekah&apos;s World</h2>
          <p className="section-subtitle">
            Every loaf tells a story. Our kitchen is a playground where heritage techniques meet
            contemporary flavors, guided by the belief that baking is a love language meant to be
            shared.
          </p>
          <div className="feature-grid fade-in">
            {featureCards.map((card) => (
              <article className="feature-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
          <div className="signature-line">
            <span>Bakes that taste like</span>
            <span className="signature">home + heaven</span>
          </div>
        </section>

        <section id="creations">
          <h2 className="section-title">Signature Collage</h2>
          <p className="section-subtitle">
            Dive into a visual tasting menu. Swipe through our most-loved bakes, each styled to
            spotlight texture, layering, and the playful color palette of our pastry case.
          </p>
          <div className="creations-carousel fade-in" id="creationsCarousel">
            <div className="carousel-shell" role="region" aria-label="Signature creations">
              <button
                className="carousel-control prev"
                type="button"
                aria-label="View previous creation"
              >
                ‹
              </button>
              <div className="carousel-track" role="listbox">
                {carouselSlides.map((slide, index) => (
                  <article
                    key={slide.src}
                    className={`carousel-slide${index === 0 ? ' active' : ''}`}
                    data-index={index}
                    aria-hidden={index === 0 ? 'false' : 'true'}
                    aria-label={slide.alt}
                  >
                    <div className="carousel-image">
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 900px) 85vw, 960px"
                        className="image-cover"
                        priority={index === 0}
                      />
                    </div>
                    <div className="carousel-caption">{slide.caption}</div>
                  </article>
                ))}
              </div>
              <button
                className="carousel-control next"
                type="button"
                aria-label="View next creation"
              >
                ›
              </button>
            </div>
            <div className="carousel-thumbs" role="tablist" aria-label="Select creation to view">
              {carouselSlides.map((slide, index) => (
                <button
                  key={slide.src}
                  className={`thumb${index === 0 ? ' active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={index === 0 ? 'true' : 'false'}
                  tabIndex={index === 0 ? 0 : -1}
                  data-index={index}
                >
                  <div className="thumb-image">
                    <Image
                      src={slide.src}
                      alt={`${slide.alt} thumbnail`}
                      fill
                      sizes="(max-width: 640px) 90px, 110px"
                      className="image-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="creations-gallery fade-in">
            <h3 className="gallery-title">More From The Pastry Case</h3>
            <div className="gallery-grid">
              {galleryItems.map((item) => (
                <figure
                  key={item.src}
                  className={`gallery-item${item.modifier ? ` ${item.modifier}` : ''}`}
                >
                  <div className="gallery-image">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 900px) 45vw, 360px"
                      className="image-cover"
                    />
                  </div>
                  <figcaption>{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="experience fade-in">
            <div className="experience-text">
              <h3>Crafting Experiences Beyond Pastry Cases</h3>
              <p>
                From kitchen collaborations to bespoke celebrations, we curate immersive sensory
                journeys. Sip on hand-brewed botanicals, savor house-made spreads, and learn
                techniques tailored to your skill level. Whether it&apos;s intimate gatherings or
                full-scale events, Bekah&apos;s brings warmth to the table.
              </p>
            </div>
            <div className="experience-stats">
              {stats.map((stat) => (
                <div className="stat" key={stat.label}>
                  <h4>{stat.value}</h4>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="events">
          <div className="events fade-in">
            <h3>Upcoming Workshops &amp; Gatherings</h3>
            <div className="event-list">
              {events.map((event) => (
                <div className="event" key={event.title}>
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.description}</p>
                  </div>
                  <span>{event.meta}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials">
          <h2 className="section-title">Baked-In Love Notes</h2>
          <p className="section-subtitle">
            Our community has become family. Here&apos;s what they taste, feel, and remember.
          </p>
          <div className="testimonials fade-in">
            {testimonials.map((testimonial) => (
              <div className="testimonial" key={testimonial.author}>
                <p>{testimonial.quote}</p>
                <span>{testimonial.author}</span>
              </div>
            ))}
          </div>
          <div className="newsletter fade-in" id="contact">
            <h3>Join the Bake Letter</h3>
            <p>
              Early access to seasonal drops, secret recipes, and invite-only gatherings. Delivered
              once a week.
            </p>
            <form>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@delicious.com"
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <h3>Bekah&apos;s Baking</h3>
          <p>
            241 Hearthstone Ave, Suite 12 <br />
            Willow &amp; Main, Portland
          </p>
        </div>
        <div className="footer-links">
          <a href="#story">Our Story</a>
          <a href="#creations">Creations</a>
          <a href="#events">Workshops</a>
          <a href="#testimonials">Community</a>
        </div>
        <div className="footer-contact">
          <span>hello@bekahsbaking.com</span>
          <span>Open Wed–Sun · 8 AM – 6 PM</span>
          <div className="socials">
            {socials.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noreferrer">
                {social.label}
              </a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © <span id="year" /> Bekah&apos;s Baking Studio. All rights reserved.
          </span>
          <span>Crafted with butter, sugar, and soul.</span>
        </div>
      </footer>
    </>
  );
}
