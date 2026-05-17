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

// Configuration: Determine base path based on current page location
function getBasePath() {
    const path = window.location.pathname;
    // If we're in a blog article folder (e.g., /blog/article-1/)
    if (path.includes('/blog/') && path.split('/').length > 3) {
        return '../../';
    }
    // If we're in blog.html
    if (path.includes('blog.html')) {
        return './';
    }
    // Default (index.html or root)
    return './';
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

    if (homeLink) homeLink.href = basePath + 'index.html';
    if (nameLink) nameLink.href = basePath + 'index.html';
    if (navHome)  navHome.href  = basePath + 'index.html';
    if (navBlog)  navBlog.href  = basePath + 'blog.html';

    const currentPage = window.location.pathname;
    if (currentPage.includes('blog.html') || currentPage.includes('/blog/')) {
        if (navBlog) navBlog.classList.add('active');
        if (navHome) navHome.classList.remove('active');
    } else {
        if (navHome) navHome.classList.add('active');
        if (navBlog) navBlog.classList.remove('active');
    }

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

// Render a list of blog articles into a container element.
// limit: max articles to show (null = all). extraClass: added to each <article>.
function renderArticles(containerId, { limit = null, extraClass = '' } = {}) {
    const container = document.getElementById(containerId);
    if (!container || typeof blogArticles === 'undefined') return;

    if (!blogArticles || blogArticles.length === 0) {
        container.innerHTML = '<p class="blog-empty">No posts available yet. Check back soon!</p>';
        return;
    }

    const sorted = [...blogArticles].sort((a, b) => new Date(b.date) - new Date(a.date));
    const toShow = limit ? sorted.slice(0, limit) : sorted;

    container.innerHTML = toShow.map(article => `
        <article class="blog-item ${extraClass} ${article.hasThumbnail ? '' : 'no-image'}">
            <a href="blog/${article.folder}/index.html" class="blog-link">
                <div class="blog-content">
                    ${article.hasThumbnail ? `
                    <div class="blog-image-container">
                        <img src="blog/${article.folder}/thumbnail.jpg" alt="${article.title} thumbnail" class="blog-image">
                    </div>
                    ` : ''}
                    <div class="blog-text">
                        <h3 class="blog-title">${article.title}</h3>
                        <p class="blog-excerpt">${article.excerpt}</p>
                        <p class="blog-date">Published: ${formatDate(article.date)}</p>
                    </div>
                </div>
            </a>
        </article>
    `).join('');
}

function generateBlogListing() {
    renderArticles('blog-list');
}

function generateBlogPreview() {
    renderArticles('blog-preview-list', { limit: 2, extraClass: 'blog-preview-item' });
}

// Generate CV sections from data
function generateCVSections() {
    if (typeof cvData === 'undefined') return;
    
    generateWorkExperience();
    generateEducation();
    generatePublications();
    generateSkills();
    generateHighlights();
}

// Generate Work Experience section
function generateWorkExperience() {
    const container = document.getElementById('work-experience-list');
    if (!container || !cvData.workExperience) return;
    
    container.innerHTML = '';
    cvData.workExperience.forEach(job => {
        // Only show description if it exists and has items
        const hasDescription = job.description && job.description.length > 0;
        const descriptionHTML = hasDescription 
            ? `<ul class="item-description">${job.description.map(item => `<li>${item}</li>`).join('')}</ul>`
            : '';
        
        const jobHTML = `
            <article class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <h3 class="item-title">${job.title}</h3>
                    <p class="item-organization">${job.organization}</p>
                    <p class="item-period">${job.period}</p>
                    ${descriptionHTML}
                </div>
            </article>
        `;
        container.innerHTML += jobHTML;
    });
}

// Generate Education section
function generateEducation() {
    const container = document.getElementById('education-list');
    if (!container || !cvData.education) return;
    
    container.innerHTML = '';
    cvData.education.forEach(edu => {
        const descriptionHTML = edu.description ? `<p class="item-description">${edu.description}</p>` : '';
        const thesisHTML = edu.thesisLink
            ? `<div class="education-links"><a href="${edu.thesisLink}" target="_blank" rel="noopener noreferrer" class="link-button">📄 Thesis</a></div>`
            : '';
        const eduHTML = `
            <article class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <h3 class="item-title">${edu.degree}</h3>
                    <p class="item-organization">${edu.institution}</p>
                    <p class="item-period">${edu.period}</p>
                    ${descriptionHTML}
                    ${thesisHTML}
                </div>
            </article>
        `;
        container.innerHTML += eduHTML;
    });
}

// Generate Publications section
function generatePublications() {
    const container = document.getElementById('publications-list');
    if (!container || !cvData.publications) return;
    
    container.innerHTML = '';
    cvData.publications.forEach(pub => {
        const linksHTML = pub.links.map(link => 
            `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-button">${link.label}</a>`
        ).join('');
        
        const pubHTML = `
            <article class="publication-item">
                <h3 class="publication-title">${pub.title}</h3>
                <p class="publication-authors">${pub.authors}</p>
                <p class="publication-venue">${pub.venue}</p>
                <div class="publication-links">${linksHTML}</div>
            </article>
        `;
        container.innerHTML += pubHTML;
    });
}

// Generate Skills section
function generateSkills() {
    const container = document.getElementById('skills-list');
    if (!container || !cvData.skills) return;
    
    container.innerHTML = '';
    cvData.skills.forEach(category => {
        const tagsHTML = category.items.map(item => 
            `<span class="skill-tag">${item}</span>`
        ).join('');
        
        const categoryHTML = `
            <div class="skill-category">
                <h3 class="skill-category-title">${category.category}</h3>
                <div class="skill-tags">${tagsHTML}</div>
            </div>
        `;
        container.innerHTML += categoryHTML;
    });
}

// Generate Highlights section
function generateHighlights() {
    const container = document.getElementById('highlights-list');
    if (!container || !cvData.highlights) return;
    
    container.innerHTML = '';
    cvData.highlights.forEach(highlight => {
        const linkHTML = highlight.link ? 
            `<div class="achievement-links">
                <a href="${highlight.link}" target="_blank" rel="noopener noreferrer" class="link-button">View</a>
            </div>` : '';
        
        const highlightHTML = `
            <article class="award-item">
                <div class="award-icon">${highlight.icon || '🏆'}</div>
                <div class="award-content">
                    <h3 class="award-title">${highlight.title}</h3>
                    <p class="award-organization">${highlight.organization}</p>
                    <p class="award-year">${highlight.year}</p>
                    <p class="award-description">${highlight.description}</p>
                    ${linkHTML}
                </div>
            </article>
        `;
        container.innerHTML += highlightHTML;
    });
}

// Setup CV navigation smooth scrolling and active state
function setupCVNavigation() {
    const cvSidebar = document.getElementById('cv-sidebar');
    const cvNav = document.getElementById('cv-nav');
    
    // Only setup on homepage
    if (!cvSidebar || !cvNav) return;
    
    // Hide sidebar on blog pages
    const currentPage = window.location.pathname;
    if (currentPage.includes('blog.html') || currentPage.includes('/blog/')) {
        cvSidebar.style.display = 'none';
        document.querySelector('.main-content-with-sidebar')?.classList.remove('main-content-with-sidebar');
        return;
    }
    
    const navLinks = cvNav.querySelectorAll('.cv-nav-link');
    const sections = ['recent-posts', 'work-experience', 'education', 'highlights', 'publications'];
    
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
    
    // Generate blog listing (for blog.html) or preview (for index.html)
    generateBlogListing();
    generateBlogPreview();
    
    generateCVSections();
    
    // Setup CV navigation after a short delay to ensure DOM is ready
    setTimeout(() => {
        setupCVNavigation();
    }, 200);
    
    // Fallback: Set year if footer wasn't loaded dynamically
    setTimeout(() => {
        const yearElement = document.getElementById('current-year');
        if (yearElement && !yearElement.textContent) {
            yearElement.textContent = new Date().getFullYear();
        }
    }, 100);
});

