// Feature: portfolio-enhancement, Property 1: Project Gallery Rendering Completeness
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectGallery } from '../js/components/ProjectGallery.js';
import fc from 'fast-check';

describe('ProjectGallery', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'projects';
    document.body.appendChild(container);
  });

  // Property 1: Project Gallery Rendering Completeness
  // **Validates: Requirements 1.1, 1.4**
  it('should render all projects with thumbnails and valid category assignments', () => {
    fc.assert(
      fc.property(
        // Generator for project data
        fc.record({
          projects: fc.array(
            fc.record({
              id: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'), { minLength: 1, maxLength: 20 }),
              title: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '), { minLength: 1, maxLength: 50 }),
              description: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,'), { minLength: 1, maxLength: 200 }),
              category: fc.constantFrom('web-development', 'mobile-apps', 'apis'),
              technologies: fc.array(fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), { minLength: 1, maxLength: 15 }), { minLength: 1, maxLength: 5 }),
              thumbnail: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'), { minLength: 1, maxLength: 20 }).map(s => `/images/${s}.jpg`),
              images: fc.array(fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'), { minLength: 1, maxLength: 20 }).map(s => `/images/${s}.jpg`), { maxLength: 3 }),
              liveUrl: fc.option(fc.webUrl()),
              githubUrl: fc.option(fc.webUrl()),
              featured: fc.boolean(),
              completedDate: fc.date().map(d => d.toISOString())
            }),
            { minLength: 0, maxLength: 5 }
          ),
          categories: fc.constant([
            { id: 'web-development', name: 'Web Development' },
            { id: 'mobile-apps', name: 'Mobile Apps' },
            { id: 'apis', name: 'APIs & Backend' }
          ])
        }),
        (projectsData) => {
          // Create fresh container for each test
          const testContainer = document.createElement('div');
          testContainer.id = 'test-projects';
          document.body.appendChild(testContainer);

          try {
            // Initialize ProjectGallery with generated data
            const gallery = new ProjectGallery(testContainer, projectsData);

            // Verify all projects are rendered as cards with thumbnails
            const projectCards = testContainer.querySelectorAll('.project-card');
            expect(projectCards.length).toBe(projectsData.projects.length);

            // Verify each project card has required elements
            projectsData.projects.forEach((project, index) => {
              const card = projectCards[index];
              
              // Check that card has project ID
              expect(card.dataset.projectId).toBe(project.id);
              
              // Check thumbnail exists
              const thumbnail = card.querySelector('.project-thumbnail img');
              expect(thumbnail).toBeTruthy();
              // Check that the src attribute ends with the expected path (browser adds full URL)
              expect(thumbnail.src).toMatch(new RegExp(project.thumbnail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
              expect(thumbnail.alt).toBe(project.title);
              
              // Check project info
              const title = card.querySelector('.project-title');
              expect(title.textContent).toBe(project.title);
              
              const description = card.querySelector('.project-description');
              expect(description.textContent).toBe(project.description);
              
              // Check technologies are rendered
              const techTags = card.querySelectorAll('.tech-tag');
              expect(techTags.length).toBe(project.technologies.length);
              
              // Verify category assignment is valid
              const validCategories = projectsData.categories.map(cat => cat.id);
              expect(validCategories).toContain(project.category);
            });

            // Verify filter buttons are created for all categories
            const filterButtons = testContainer.querySelectorAll('.filter-btn');
            // Should have "All" button plus one for each category
            expect(filterButtons.length).toBe(projectsData.categories.length + 1);
            
            // Check "All" button exists
            const allButton = Array.from(filterButtons).find(btn => btn.dataset.category === 'all');
            expect(allButton).toBeTruthy();
            expect(allButton.textContent).toBe('All');
            
            // Check category buttons exist
            projectsData.categories.forEach(category => {
              const categoryButton = Array.from(filterButtons).find(btn => btn.dataset.category === category.id);
              expect(categoryButton).toBeTruthy();
              expect(categoryButton.textContent).toBe(category.name);
            });

          } finally {
            // Cleanup
            document.body.removeChild(testContainer);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 2: Project Detail Modal Consistency
  // **Validates: Requirements 1.2, 1.3**
  it('should display modal with all required project information when clicking project card', () => {
    fc.assert(
      fc.property(
        // Generator for project data with required modal fields
        fc.record({
          projects: fc.array(
            fc.record({
              id: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'), { minLength: 1, maxLength: 20 }),
              title: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '), { minLength: 1, maxLength: 50 }),
              description: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,'), { minLength: 10, maxLength: 200 }),
              category: fc.constantFrom('web-development', 'mobile-apps', 'apis'),
              technologies: fc.array(fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), { minLength: 1, maxLength: 15 }), { minLength: 1, maxLength: 5 }),
              thumbnail: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'), { minLength: 1, maxLength: 20 }).map(s => `/images/${s}.jpg`),
              images: fc.array(fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'), { minLength: 1, maxLength: 20 }).map(s => `/images/${s}.jpg`), { minLength: 1, maxLength: 3 }),
              liveUrl: fc.option(fc.webUrl()),
              githubUrl: fc.option(fc.webUrl()),
              featured: fc.boolean(),
              completedDate: fc.date().map(d => d.toISOString())
            }),
            { minLength: 1, maxLength: 3 }
          ),
          categories: fc.constant([
            { id: 'web-development', name: 'Web Development' },
            { id: 'mobile-apps', name: 'Mobile Apps' },
            { id: 'apis', name: 'APIs & Backend' }
          ])
        }),
        (projectsData) => {
          // Create fresh container for each test
          const testContainer = document.createElement('div');
          testContainer.id = 'test-projects-modal';
          document.body.appendChild(testContainer);

          try {
            // Initialize ProjectGallery with generated data
            const gallery = new ProjectGallery(testContainer, projectsData);

            // Test each project's modal
            projectsData.projects.forEach(project => {
              // Click on the project card to open modal
              const projectCard = testContainer.querySelector(`[data-project-id="${project.id}"]`);
              expect(projectCard).toBeTruthy();
              
              const viewButton = projectCard.querySelector('.view-project-btn');
              expect(viewButton).toBeTruthy();
              
              // Simulate click to open modal
              viewButton.click();
              
              // Verify modal exists and contains required information
              const modal = document.querySelector('.project-modal');
              expect(modal).toBeTruthy();
              
              // Check modal header contains project title
              const modalTitle = modal.querySelector('.modal-header h2');
              expect(modalTitle).toBeTruthy();
              expect(modalTitle.textContent).toBe(project.title);
              
              // Check project description is displayed
              const modalDescription = modal.querySelector('.project-full-description');
              expect(modalDescription).toBeTruthy();
              expect(modalDescription.textContent).toBe(project.description);
              
              // Check technologies are displayed
              const modalTechTags = modal.querySelectorAll('.project-technologies .tech-tag');
              expect(modalTechTags.length).toBe(project.technologies.length);
              project.technologies.forEach((tech, index) => {
                expect(modalTechTags[index].textContent).toBe(tech);
              });
              
              // Check live demo link if available
              if (project.liveUrl) {
                const liveLink = modal.querySelector('a[href="' + project.liveUrl + '"]');
                expect(liveLink).toBeTruthy();
                expect(liveLink.textContent).toBe('Live Demo');
                expect(liveLink.target).toBe('_blank');
              }
              
              // Check source code link if available
              if (project.githubUrl) {
                const githubLink = modal.querySelector('a[href="' + project.githubUrl + '"]');
                expect(githubLink).toBeTruthy();
                expect(githubLink.textContent).toBe('Source Code');
                expect(githubLink.target).toBe('_blank');
              }
              
              // Check project images are displayed
              const modalImages = modal.querySelectorAll('.project-images img');
              expect(modalImages.length).toBe(project.images.length);
              project.images.forEach((image, index) => {
                expect(modalImages[index].src).toMatch(new RegExp(image.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
                expect(modalImages[index].alt).toBe(project.title);
              });
              
              // Check project metadata
              const completedDate = modal.querySelector('.project-meta p');
              expect(completedDate).toBeTruthy();
              expect(completedDate.textContent).toContain(new Date(project.completedDate).toLocaleDateString());
              
              const categoryName = projectsData.categories.find(cat => cat.id === project.category)?.name || project.category;
              const categoryText = Array.from(modal.querySelectorAll('.project-meta p')).find(p => p.textContent.includes('Category:'));
              expect(categoryText).toBeTruthy();
              expect(categoryText.textContent).toContain(categoryName);
              
              // Close modal for next iteration
              const closeButton = modal.querySelector('.modal-close');
              expect(closeButton).toBeTruthy();
              closeButton.click();
              
              // Verify modal is closed
              expect(document.querySelector('.project-modal')).toBeFalsy();
            });

          } finally {
            // Cleanup any remaining modals
            const remainingModal = document.querySelector('.project-modal');
            if (remainingModal) {
              document.body.removeChild(remainingModal);
            }
            document.body.removeChild(testContainer);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 3: Project Filtering Accuracy
  // **Validates: Requirements 1.5**
  it('should display only projects belonging to selected category when filtering', () => {
    fc.assert(
      fc.property(
        // Generator for project data with multiple categories
        fc.record({
          projects: fc.array(
            fc.record({
              id: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'), { minLength: 1, maxLength: 20 }),
              title: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '), { minLength: 1, maxLength: 50 }),
              description: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,'), { minLength: 1, maxLength: 200 }),
              category: fc.constantFrom('web-development', 'mobile-apps', 'apis'),
              technologies: fc.array(fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), { minLength: 1, maxLength: 15 }), { minLength: 1, maxLength: 5 }),
              thumbnail: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'), { minLength: 1, maxLength: 20 }).map(s => `/images/${s}.jpg`),
              images: fc.array(fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'), { minLength: 1, maxLength: 20 }).map(s => `/images/${s}.jpg`), { maxLength: 3 }),
              liveUrl: fc.option(fc.webUrl()),
              githubUrl: fc.option(fc.webUrl()),
              featured: fc.boolean(),
              completedDate: fc.date().map(d => d.toISOString())
            }),
            { minLength: 2, maxLength: 10 }
          ),
          categories: fc.constant([
            { id: 'web-development', name: 'Web Development' },
            { id: 'mobile-apps', name: 'Mobile Apps' },
            { id: 'apis', name: 'APIs & Backend' }
          ])
        }),
        (projectsData) => {
          // Create fresh container for each test
          const testContainer = document.createElement('div');
          testContainer.id = 'test-projects-filter';
          document.body.appendChild(testContainer);

          try {
            // Initialize ProjectGallery with generated data
            const gallery = new ProjectGallery(testContainer, projectsData);

            // Test "All" filter first
            const allButton = testContainer.querySelector('[data-category="all"]');
            expect(allButton).toBeTruthy();
            allButton.click();
            
            let visibleCards = testContainer.querySelectorAll('.project-card');
            expect(visibleCards.length).toBe(projectsData.projects.length);
            
            // Test each category filter
            projectsData.categories.forEach(category => {
              const categoryButton = testContainer.querySelector(`[data-category="${category.id}"]`);
              expect(categoryButton).toBeTruthy();
              
              // Click the category filter button
              categoryButton.click();
              
              // Verify button becomes active
              expect(categoryButton.classList.contains('active')).toBe(true);
              
              // Verify other buttons are not active
              const otherButtons = testContainer.querySelectorAll('.filter-btn:not([data-category="' + category.id + '"])');
              otherButtons.forEach(btn => {
                expect(btn.classList.contains('active')).toBe(false);
              });
              
              // Get visible project cards after filtering
              visibleCards = testContainer.querySelectorAll('.project-card');
              
              // Count expected projects for this category
              const expectedProjects = projectsData.projects.filter(project => project.category === category.id);
              
              // Verify correct number of projects are displayed
              expect(visibleCards.length).toBe(expectedProjects.length);
              
              // Verify all displayed projects belong to the selected category
              visibleCards.forEach(card => {
                const projectId = card.dataset.projectId;
                const project = projectsData.projects.find(p => p.id === projectId);
                expect(project).toBeTruthy();
                expect(project.category).toBe(category.id);
              });
              
              // Verify all projects in this category are displayed
              expectedProjects.forEach(expectedProject => {
                const projectCard = testContainer.querySelector(`[data-project-id="${expectedProject.id}"]`);
                expect(projectCard).toBeTruthy();
              });
            });
            
            // Test programmatic filtering using filterByCategory method
            projectsData.categories.forEach(category => {
              gallery.filterByCategory(category.id);
              
              const visibleCards = testContainer.querySelectorAll('.project-card');
              const expectedProjects = projectsData.projects.filter(project => project.category === category.id);
              
              expect(visibleCards.length).toBe(expectedProjects.length);
              
              // Verify active button is updated
              const activeButton = testContainer.querySelector('.filter-btn.active');
              expect(activeButton).toBeTruthy();
              expect(activeButton.dataset.category).toBe(category.id);
            });
            
            // Test filtering back to "all"
            gallery.filterByCategory('all');
            visibleCards = testContainer.querySelectorAll('.project-card');
            expect(visibleCards.length).toBe(projectsData.projects.length);
            
            const allButtonActive = testContainer.querySelector('.filter-btn.active');
            expect(allButtonActive.dataset.category).toBe('all');

          } finally {
            // Cleanup
            document.body.removeChild(testContainer);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional unit tests for specific scenarios
  it('should handle empty project data gracefully', () => {
    const emptyData = { projects: [], categories: [] };
    const gallery = new ProjectGallery(container, emptyData);
    
    const projectCards = container.querySelectorAll('.project-card');
    expect(projectCards.length).toBe(0);
    
    // Should still create filter container with just "All" button
    const filterButtons = container.querySelectorAll('.filter-btn');
    expect(filterButtons.length).toBe(1);
    expect(filterButtons[0].textContent).toBe('All');
  });

  it('should handle missing optional fields', () => {
    const projectData = {
      projects: [{
        id: 'test-project',
        title: 'Test Project',
        description: 'Test Description',
        category: 'web-development',
        technologies: ['JavaScript'],
        thumbnail: '/images/test.jpg',
        images: ['/images/test1.jpg'],
        featured: false,
        completedDate: '2024-01-01'
        // Missing liveUrl and githubUrl
      }],
      categories: [{ id: 'web-development', name: 'Web Development' }]
    };

    const gallery = new ProjectGallery(container, projectData);
    const projectCard = container.querySelector('.project-card');
    
    expect(projectCard).toBeTruthy();
    expect(projectCard.dataset.projectId).toBe('test-project');
  });
});