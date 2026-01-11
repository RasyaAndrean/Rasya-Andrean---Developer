// Feature: portfolio-enhancement, Property 9: Blog Article Display Completeness
import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { BlogSystem } from '../js/components/BlogSystem.js';

describe('BlogSystem Property Tests', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'blog';
    document.body.appendChild(container);
  });

  // Property 9: Blog Article Display Completeness
  // **Validates: Requirements 4.1, 4.3, 4.4**
  it('should display all articles with complete metadata', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        id: fc.string({ minLength: 1, maxLength: 10 }),
        title: fc.string({ minLength: 5, maxLength: 20 }),
        slug: fc.string({ minLength: 5, maxLength: 15 }),
        excerpt: fc.string({ minLength: 10, maxLength: 50 }),
        content: fc.string({ minLength: 20, maxLength: 100 }),
        category: fc.constantFrom('tutorials', 'insights', 'project-breakdowns'),
        tags: fc.array(fc.string({ minLength: 3, maxLength: 8 }), { minLength: 1, maxLength: 3 }),
        publishedDate: fc.constantFrom('2024-01-01', '2024-06-01', '2024-12-01'),
        readingTime: fc.integer({ min: 1, max: 10 }),
        featured: fc.boolean()
      }), { minLength: 1, maxLength: 3 }),
      fc.constant([
        { id: 'tutorials', name: 'Tutorials' },
        { id: 'insights', name: 'Insights' },
        { id: 'project-breakdowns', name: 'Project Breakdowns' }
      ]),
      (articles, categories) => {
        const articlesData = { articles, categories };
        const blogSystem = new BlogSystem(container, articlesData);
        
        // Check that all articles are rendered
        const articleCards = container.querySelectorAll('.article-card');
        expect(articleCards.length).toBe(articles.length);
        
        // Check first article has all required metadata
        if (articles.length > 0) {
          const firstArticle = articles[0];
          const firstCard = articleCards[0];
          
          // Check publication date is displayed
          const dateElement = firstCard.querySelector('.article-date');
          expect(dateElement).toBeTruthy();
          
          // Check reading time is displayed
          const readingTimeElement = firstCard.querySelector('.reading-time');
          expect(readingTimeElement).toBeTruthy();
          expect(readingTimeElement.textContent).toContain(`${firstArticle.readingTime} min read`);
          
          // Check tags are displayed
          const tagsContainer = firstCard.querySelector('.article-tags');
          expect(tagsContainer).toBeTruthy();
          const tagElements = tagsContainer.querySelectorAll('.tag');
          expect(tagElements.length).toBe(firstArticle.tags.length);
          
          // Check category is displayed
          const categoryElement = firstCard.querySelector('.article-category');
          expect(categoryElement).toBeTruthy();
        }
      }
    ), { numRuns: 5 });
  });

  // Property 10: Blog Navigation Consistency
  // **Validates: Requirements 4.2**
  it('should display full article content when clicking article preview', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        id: fc.string({ minLength: 1, maxLength: 10 }),
        title: fc.string({ minLength: 5, maxLength: 20 }),
        slug: fc.string({ minLength: 5, maxLength: 15 }),
        excerpt: fc.string({ minLength: 10, maxLength: 50 }),
        content: fc.string({ minLength: 20, maxLength: 100 }),
        category: fc.constantFrom('tutorials', 'insights'),
        tags: fc.array(fc.string({ minLength: 3, maxLength: 8 }), { minLength: 1, maxLength: 2 }),
        publishedDate: fc.constantFrom('2024-01-01', '2024-06-01'),
        readingTime: fc.integer({ min: 1, max: 5 }),
        featured: fc.boolean()
      }), { minLength: 1, maxLength: 2 }),
      fc.constant([
        { id: 'tutorials', name: 'Tutorials' },
        { id: 'insights', name: 'Insights' }
      ]),
      (articles, categories) => {
        const articlesData = { articles, categories };
        const blogSystem = new BlogSystem(container, articlesData);
        
        // Test first article
        const firstArticle = articles[0];
        
        // Find and click the corresponding article card
        const articleCards = container.querySelectorAll('.article-card');
        const selectedCard = Array.from(articleCards).find(card => 
          card.dataset.articleId === firstArticle.id
        );
        
        expect(selectedCard).toBeTruthy();
        
        // Click the "Read Article" button
        const readButton = selectedCard.querySelector('.read-article-btn');
        expect(readButton).toBeTruthy();
        readButton.click();
        
        // Check that the full article view is displayed
        const articleView = container.querySelector('.article-view');
        expect(articleView).toBeTruthy();
        
        // Check that the full article contains the expected content
        const fullArticle = container.querySelector('.full-article');
        expect(fullArticle).toBeTruthy();
        
        // Check article title is displayed
        const titleElement = fullArticle.querySelector('.article-title');
        expect(titleElement).toBeTruthy();
        expect(titleElement.textContent).toBe(firstArticle.title);
        
        // Check back button is present
        const backButton = container.querySelector('.back-to-list-btn');
        expect(backButton).toBeTruthy();
      }
    ), { numRuns: 3 });
  });

  // Property 11: Blog Search Accuracy
  // **Validates: Requirements 4.5**
  it('should return articles containing search keywords in title, content, or tags', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        id: fc.string({ minLength: 1, maxLength: 10 }),
        title: fc.constantFrom('JavaScript Tutorial', 'React Guide', 'Node.js Tips'),
        slug: fc.string({ minLength: 5, maxLength: 15 }),
        excerpt: fc.string({ minLength: 10, maxLength: 30 }),
        content: fc.constantFrom('Learn JavaScript basics', 'React components guide', 'Node.js server setup'),
        category: fc.constantFrom('tutorials', 'insights'),
        tags: fc.constantFrom(['JavaScript'], ['React'], ['Node.js']),
        publishedDate: fc.constantFrom('2024-01-01', '2024-06-01'),
        readingTime: fc.integer({ min: 1, max: 5 }),
        featured: fc.boolean()
      }), { minLength: 2, maxLength: 3 }),
      fc.constant([
        { id: 'tutorials', name: 'Tutorials' },
        { id: 'insights', name: 'Insights' }
      ]),
      fc.constantFrom('JavaScript', 'React', 'Node'),
      (articles, categories, searchQuery) => {
        const articlesData = { articles, categories };
        const blogSystem = new BlogSystem(container, articlesData);
        
        // Perform search
        blogSystem.searchArticles(searchQuery);
        
        // Get displayed articles after search
        const displayedCards = container.querySelectorAll('.article-card');
        
        // Check that all displayed articles contain the search query
        displayedCards.forEach(card => {
          const articleId = card.dataset.articleId;
          const article = articles.find(a => a.id === articleId);
          expect(article).toBeTruthy();
          
          const queryLower = searchQuery.toLowerCase();
          const titleMatch = article.title.toLowerCase().includes(queryLower);
          const contentMatch = article.content.toLowerCase().includes(queryLower);
          const tagMatch = article.tags.some(tag => tag.toLowerCase().includes(queryLower));
          
          // At least one of these should match
          expect(titleMatch || contentMatch || tagMatch).toBe(true);
        });
      }
    ), { numRuns: 3 });
  });
});