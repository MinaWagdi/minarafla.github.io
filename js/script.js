/**
 * ============================================
 * JavaScript Architecture: Utility Functions
 * ============================================
 * This script handles:
 * 1. Loading reusable header and footer components
 * 2. Dynamic year in footer
 * 3. Photo placeholder handling (optional)
 * 4. Navigation active state management
 * 5. Dark mode toggle and persistence
 * ============================================
 */

// Dark Mode Functions
function initDarkMode() {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Listen for system theme changes
function watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', function(e) {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

// True when the current page is a blog article folder (blog/<name>/index.html)
function isArticlePage() {
    const path = window.location.pathname;
    return path.includes('/blog/') && path.split('/').length > 3;
}

// True for the blog listing page or any blog article
function isBlogPage() {
    const path = window.location.pathname;
    return path.includes('blog.html') || path.includes('/blog/');
}

// True for the TILs page
function isTilPage() {
    return window.location.pathname.includes('tils.html');
}

// Determine base path: article pages are two levels deep, everything else is at root
function getBasePath() {
    return isArticlePage() ? '../../' : './';
}

// Post-process header HTML once inserted into the DOM
function initHeader(basePath) {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const header = headerPlaceholder.querySelector('.header');
    if (!header) return;

    const img = header.querySelector('#profile-photo');
    if (img) img.src = basePath + 'images/my_photo.jpg';

    const homeLink = header.querySelector('#header-home-link');
    const nameLink = header.querySelector('#header-name-link');
    const navHome  = header.querySelector('#nav-home');
    const navBlog  = header.querySelector('#nav-blog');
    const navTils  = header.querySelector('#nav-tils');

    if (homeLink) homeLink.href = basePath + 'index.html';
    if (nameLink) nameLink.href = basePath + 'index.html';
    if (navHome)  navHome.href  = basePath + 'index.html';
    if (navBlog)  navBlog.href  = basePath + 'blog.html';
    if (navTils)  navTils.href  = basePath + 'tils.html';

    // Highlight the nav tab for the current section (home is the default)
    const activeNav = isTilPage() ? navTils : isBlogPage() ? navBlog : navHome;
    [navHome, navBlog, navTils].forEach(link => {
        if (link) link.classList.toggle('active', link === activeNav);
    });

    if (typeof cvData !== 'undefined' && cvData.personalInfo) {
        const titleEl   = header.querySelector('#professional-title');
        const aboutMeEl = header.querySelector('#about-me-text');
        if (titleEl   && cvData.personalInfo.title)   titleEl.textContent   = cvData.personalInfo.title;
        if (aboutMeEl && cvData.personalInfo.aboutMe) aboutMeEl.textContent = cvData.personalInfo.aboutMe;
    }

    initPhotoHandler();
    setupThemeToggle();
}

// Load header and footer in parallel
function loadComponents() {
    const basePath = getBasePath();
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    const headerFetch = headerPlaceholder
        ? fetch(basePath + 'components/header.html')
            .then(r => r.text())
            .then(html => {
                headerPlaceholder.innerHTML = html;
                initHeader(basePath);
            })
            .catch(err => console.error('Error loading header:', err))
        : Promise.resolve();

    const footerFetch = footerPlaceholder
        ? fetch(basePath + 'components/footer.html')
            .then(r => r.text())
            .then(html => {
                footerPlaceholder.innerHTML = html;
                const yearEl = document.getElementById('current-year');
                if (yearEl) yearEl.textContent = new Date().getFullYear();
            })
            .catch(err => console.error('Error loading footer:', err))
        : Promise.resolve();

    return Promise.all([headerFetch, footerFetch]);
}

// Handle photo placeholder (if image doesn't exist, show placeholder)
function initPhotoHandler() {
    const photo = document.getElementById('profile-photo');
    if (photo) {
        photo.addEventListener('error', function() {
            console.log('Profile photo not found. Please add your photo at images/my_photo.jpg');
        });
    }
}

// Format date for display (e.g., "January 15, 2024")
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Render a data array into a container using a per-item template function.
// No-op if the container is missing or the list is empty.
function renderList(containerId, items, templateFn) {
    const container = document.getElementById(containerId);
    if (!container || !items || !items.length) return;
    container.innerHTML = items.map(templateFn).join('');
}

// Render a list of posts (blog articles or TILs) into a container element.
// posts: data array. folder: parent dir ('blog' or 'tils') used to build links.
// limit: max posts to show (null = all). extraClass: added to each <article>.
// groupByYear: if true, posts are grouped under a year heading.
function renderPosts(containerId, posts, { folder, limit = null, extraClass = '', groupByYear = false } = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!posts || posts.length === 0) {
        container.innerHTML = '<p class="blog-empty">No posts available yet. Check back soon!</p>';
        return;
    }

    const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    const toShow = limit ? sorted.slice(0, limit) : sorted;

    const renderPost = post => `
        <article class="blog-item ${extraClass} ${post.hasThumbnail ? '' : 'no-image'}">
            <a href="${folder}/${post.folder}/index.html" class="blog-link">
                <div class="blog-content">
                    ${post.hasThumbnail ? `
                    <div class="blog-image-container">
                        <img src="${folder}/${post.folder}/thumbnail.jpg" alt="${post.title} thumbnail" class="blog-image">
                    </div>
                    ` : ''}
                    <div class="blog-text">
                        <h3 class="blog-title">${post.title}</h3>
                        <p class="blog-excerpt">${post.excerpt}</p>
                        <p class="blog-date">Published: ${formatDate(post.date)}</p>
                    </div>
                </div>
            </a>
        </article>
    `;

    if (!groupByYear) {
        container.innerHTML = toShow.map(renderPost).join('');
        return;
    }

    const grouped = toShow.reduce((groups, post) => {
        const year = new Date(post.date).getFullYear();
        if (!groups[year]) groups[year] = [];
        groups[year].push(post);
        return groups;
    }, {});

    container.innerHTML = Object.keys(grouped)
        .sort((a, b) => Number(b) - Number(a))
        .map(year => `
            <section class="blog-year-group">
                <h3 class="blog-year-heading">${year}</h3>
                ${grouped[year].map(renderPost).join('')}
            </section>
        `)
        .join('');
}

function generateBlogListing() {
    if (typeof blogArticles === 'undefined') return;
    renderPosts('blog-list', blogArticles, { folder: 'blog', groupByYear: true });
}

function generateBlogPreview() {
    if (typeof blogArticles === 'undefined') return;
    renderPosts('blog-preview-list', blogArticles, { folder: 'blog', limit: 2, extraClass: 'blog-preview-item' });
}

// Anchor id for a TIL (so the homepage can deep-link into the tils.html feed)
function tilAnchorId(til) {
    const slug = (til.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return `til-${til.date}-${slug}`;
}

// Render TILs (newest first) into a container.
// limit:   max to show (null = all).
// compact: render one-line title + date links (homepage) instead of full content.
function renderTils(containerId, { limit = null, compact = false } = {}) {
    const container = document.getElementById(containerId);
    if (!container || typeof tilPosts === 'undefined') return;

    if (!tilPosts.length) {
        container.innerHTML = '<p class="blog-empty">No TILs yet. Check back soon!</p>';
        return;
    }

    const sorted = [...tilPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
    const toShow = limit ? sorted.slice(0, limit) : sorted;

    container.innerHTML = toShow.map(til => {
        const anchor = tilAnchorId(til);

        if (compact) {
            return `
                <a href="tils.html#${anchor}" class="til-compact-item">
                    <span class="til-compact-title">${til.title}</span>
                    <span class="til-compact-date">${formatDate(til.date)}</span>
                </a>
            `;
        }

        const image = til.image
            ? `<div class="til-image-container"><img src="${til.image}" alt="${til.title}" class="til-image"></div>`
            : '';
        return `
            <article class="til-item" id="${anchor}">
                <h3 class="til-title">${til.title}</h3>
                <p class="til-date">${formatDate(til.date)}</p>
                ${image}
                <div class="article-content">${til.content}</div>
            </article>
        `;
    }).join('');
}

function generateTilListing() {
    renderTils('til-list', {});
}

function generateTilPreview() {
    renderTils('tils-preview-list', { limit: 3, compact: true });
}

// Generate all CV sections from cvData (each section is data → template → container)
function generateCVSections() {
    if (typeof cvData === 'undefined') return;

    renderList('work-experience-list', cvData.workExperience, workItemTemplate);
    renderList('education-list', cvData.education, educationItemTemplate);
    renderList('publications-list', cvData.publications, publicationItemTemplate);
    renderList('highlights-list', cvData.highlights, highlightItemTemplate);
}

function workItemTemplate(job) {
    const description = job.description && job.description.length
        ? `<ul class="item-description">${job.description.map(item => `<li>${item}</li>`).join('')}</ul>`
        : '';
    return `
        <article class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <h3 class="item-title">${job.title}</h3>
                <p class="item-organization">${job.organization}</p>
                <p class="item-period">${job.period}</p>
                ${description}
            </div>
        </article>
    `;
}

function educationItemTemplate(edu) {
    const description = edu.description ? `<p class="item-description">${edu.description}</p>` : '';
    const thesis = edu.thesisLink
        ? `<div class="education-links"><a href="${edu.thesisLink}" target="_blank" rel="noopener noreferrer" class="link-button">📄 Thesis</a></div>`
        : '';
    return `
        <article class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <h3 class="item-title">${edu.degree}</h3>
                <p class="item-organization">${edu.institution}</p>
                <p class="item-period">${edu.period}</p>
                ${description}
                ${thesis}
            </div>
        </article>
    `;
}

function publicationItemTemplate(pub) {
    const links = pub.links.map(link =>
        `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-button">${link.label}</a>`
    ).join('');
    return `
        <article class="publication-item">
            <h3 class="publication-title">${pub.title}</h3>
            <p class="publication-authors">${pub.authors}</p>
            <p class="publication-venue">${pub.venue}</p>
            <div class="publication-links">${links}</div>
        </article>
    `;
}

function highlightItemTemplate(highlight) {
    const link = highlight.link
        ? `<div class="achievement-links"><a href="${highlight.link}" target="_blank" rel="noopener noreferrer" class="link-button">View</a></div>`
        : '';
    return `
        <article class="award-item">
            <div class="award-icon">${highlight.icon || '🏆'}</div>
            <div class="award-content">
                <h3 class="award-title">${highlight.title}</h3>
                <p class="award-organization">${highlight.organization}</p>
                <p class="award-year">${highlight.year}</p>
                <p class="award-description">${highlight.description}</p>
                ${link}
            </div>
        </article>
    `;
}

// Setup CV navigation smooth scrolling and active state
function setupCVNavigation() {
    const cvSidebar = document.getElementById('cv-sidebar');
    const cvNav = document.getElementById('cv-nav');
    
    // Only setup on homepage
    if (!cvSidebar || !cvNav) return;
    
    // Hide sidebar on blog pages
    if (isBlogPage()) {
        cvSidebar.style.display = 'none';
        document.querySelector('.main-content-with-sidebar')?.classList.remove('main-content-with-sidebar');
        return;
    }
    
    const navLinks = cvNav.querySelectorAll('.cv-nav-link');
    // Order must match the order of the '#'-anchor links in the sidebar
    const sections = ['recent-posts', 'latest-tils', 'work-experience', 'education', 'highlights', 'publications'];
    
    // Handle click events for smooth scrolling (only for section anchors)
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Skip external links (those that don't start with #)
        if (!href.startsWith('#')) {
            // Close sidebar on mobile after clicking external link
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    cvSidebar.classList.remove('open');
                }
            });
            return;
        }
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 100; // Account for fixed header
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Update active state
                navLinks.forEach(l => {
                    // Only update active state for section links (starting with #)
                    if (l.getAttribute('href').startsWith('#')) {
                        l.classList.remove('active');
                    }
                });
                this.classList.add('active');
                
                // Close sidebar on mobile after click
                if (window.innerWidth <= 768) {
                    cvSidebar.classList.remove('open');
                }
            }
        });
    });
    
    // Update active state on scroll
    function updateActiveNav() {
        const scrollPosition = window.pageYOffset + 120;
        
        // Get only section links (those starting with #)
        const sectionLinks = Array.from(navLinks).filter(l => l.getAttribute('href').startsWith('#'));
        
        sections.forEach((sectionId, index) => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    // Remove active state from all section links
                    sectionLinks.forEach(l => l.classList.remove('active'));
                    // Add active state to current section link
                    if (sectionLinks[index]) {
                        sectionLinks[index].classList.add('active');
                    }
                }
            }
        });
    }
    
    // Throttle scroll events for performance
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateActiveNav();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Initial active state
    updateActiveNav();
    
    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileOverlay = document.getElementById('mobile-overlay');
    
    if (mobileToggle && mobileOverlay) {
        mobileToggle.addEventListener('click', function() {
            cvSidebar.classList.toggle('open');
            mobileOverlay.classList.toggle('active');
        });
        
        mobileOverlay.addEventListener('click', function() {
            cvSidebar.classList.remove('open');
            mobileOverlay.classList.remove('active');
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode first (before loading components)
    initDarkMode();
    watchSystemTheme();

    loadComponents();

    // Generate blog + TIL listings (on their pages) and homepage previews
    generateBlogListing();
    generateBlogPreview();
    generateTilListing();
    generateTilPreview();

    // CV sections are static placeholders in index.html, so they (and the
    // navigation that measures them) are ready synchronously after generation.
    generateCVSections();
    setupCVNavigation();
});

