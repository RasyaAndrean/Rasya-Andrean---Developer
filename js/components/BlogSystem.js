// Blog System Component
export class BlogSystem {
  constructor(containerElement, articlesData) {
    this.container = containerElement;
    this.articles = articlesData.articles || [];
    this.categories = articlesData.categories || [];
    this.currentFilter = 'all';
    this.searchQuery = '';
    
    this.init();
  }

  init() {
    this.createSearchAndFilters();
    this.renderArticleList();
    this.setupEventListeners();
  }

  createSearchAndFilters() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'blog-controls';
    
    // Search input
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
      <input type="text" class="blog-search" placeholder="Search articles..." />
      <button class="search-btn">🔍</button>
    `;
    
    // Category filters
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'blog-filters';
    
    const allButton = document.createElement('button');
    allButton.className = 'blog-filter-btn active';
    allButton.textContent = 'All';
    allButton.dataset.category = 'all';
    filtersContainer.appendChild(allButton);
    
    this.categories.forEach(category => {
      const button = document.createElement('button');
      button.className = 'blog-filter-btn';
      button.textContent = category.name;
      button.dataset.category = category.id;
      filtersContainer.appendChild(button);
    });
    
    controlsContainer.appendChild(searchContainer);
    controlsContainer.appendChild(filtersContainer);
    this.container.insertBefore(controlsContainer, this.container.firstChild);
  }

  renderArticleList() {
    let articlesContainer = this.container.querySelector('.articles-grid');
    if (!articlesContainer) {
      articlesContainer = document.createElement('div');
      articlesContainer.className = 'articles-grid';
      this.container.appendChild(articlesContainer);
    }
    
    const filteredArticles = this.getFilteredArticles();
    articlesContainer.innerHTML = '';
    
    if (filteredArticles.length === 0) {
      articlesContainer.innerHTML = '<p class="no-articles">No articles found.</p>';
      return;
    }
    
    filteredArticles.forEach(article => {
      const articleCard = this.createArticleCard(article);
      articlesContainer.appendChild(articleCard);
    });
  }

  createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'article-card';
    card.dataset.articleId = article.id;
    
    const categoryName = this.categories.find(cat => cat.id === article.category)?.name || article.category;
    
    card.innerHTML = `
      <div class="article-meta">
        <span class="article-category">${categoryName}</span>
        <span class="article-date">${new Date(article.publishedDate).toLocaleDateString()}</span>
        <span class="reading-time">${article.readingTime} min read</span>
      </div>
      <h3 class="article-title">${article.title}</h3>
      <p class="article-excerpt">${article.excerpt}</p>
      <div class="article-tags">
        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      <button class="read-article-btn">Read Article</button>
    `;
    
    return card;
  }

  getFilteredArticles() {
    let filtered = this.articles;
    
    // Apply category filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(article => article.category === this.currentFilter);
    }
    
    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
  }

  setupEventListeners() {
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('blog-filter-btn')) {
        this.handleFilterClick(e.target);
      }
      
      if (e.target.classList.contains('read-article-btn')) {
        const articleCard = e.target.closest('.article-card');
        const articleId = articleCard.dataset.articleId;
        this.renderArticle(articleId);
      }
      
      if (e.target.classList.contains('back-to-list-btn')) {
        this.renderArticleList();
      }
    });
    
    // Search functionality
    const searchInput = this.container.querySelector('.blog-search');
    const searchBtn = this.container.querySelector('.search-btn');
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderArticleList();
      });
      
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchArticles(e.target.value);
        }
      });
    }
    
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.searchArticles(searchInput.value);
      });
    }
  }

  handleFilterClick(button) {
    this.container.querySelectorAll('.blog-filter-btn').forEach(btn => 
      btn.classList.remove('active'));
    button.classList.add('active');
    
    this.currentFilter = button.dataset.category;
    this.renderArticleList();
  }

  filterByCategory(category) {
    this.currentFilter = category;
    this.renderArticleList();
    
    this.container.querySelectorAll('.blog-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
  }

  searchArticles(query) {
    this.searchQuery = query;
    this.renderArticleList();
  }

  renderArticle(articleId) {
    const article = this.articles.find(a => a.id === articleId);
    if (!article) return;
    
    const categoryName = this.categories.find(cat => cat.id === article.category)?.name || article.category;
    
    this.container.innerHTML = `
      <div class="article-view">
        <button class="back-to-list-btn">← Back to Articles</button>
        <article class="full-article">
          <header class="article-header">
            <div class="article-meta">
              <span class="article-category">${categoryName}</span>
              <span class="article-date">${new Date(article.publishedDate).toLocaleDateString()}</span>
              <span class="reading-time">${article.readingTime} min read</span>
            </div>
            <h1 class="article-title">${article.title}</h1>
            <div class="article-tags">
              ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </header>
          <div class="article-content">
            ${this.parseMarkdown(article.content)}
          </div>
        </article>
      </div>
    `;
  }

  parseMarkdown(content) {
    // Simple markdown parser for basic formatting
    return content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/^(.*)$/gim, '<p>$1</p>')
      .replace(/<p><\/p>/gim, '');
  }
}