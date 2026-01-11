// Project Gallery Component
export class ProjectGallery {
  constructor(containerElement, projectsData) {
    this.container = containerElement;
    this.projects = projectsData.projects || [];
    this.categories = projectsData.categories || [];
    this.currentFilter = 'all';
    this.modal = null;
    
    this.init();
  }

  init() {
    this.createFilterButtons();
    this.render();
    this.setupEventListeners();
  }

  createFilterButtons() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'project-filters';
    
    // Add "All" filter
    const allButton = document.createElement('button');
    allButton.className = 'filter-btn active';
    allButton.textContent = 'All';
    allButton.dataset.category = 'all';
    filterContainer.appendChild(allButton);
    
    // Add category filters
    this.categories.forEach(category => {
      const button = document.createElement('button');
      button.className = 'filter-btn';
      button.textContent = category.name;
      button.dataset.category = category.id;
      filterContainer.appendChild(button);
    });
    
    this.container.insertBefore(filterContainer, this.container.firstChild);
  }

  render() {
    const projectsContainer = this.container.querySelector('.projects-grid') || 
                             this.createProjectsGrid();
    
    const filteredProjects = this.currentFilter === 'all' 
      ? this.projects 
      : this.projects.filter(project => project.category === this.currentFilter);
    
    projectsContainer.innerHTML = '';
    
    filteredProjects.forEach(project => {
      const projectCard = this.createProjectCard(project);
      projectsContainer.appendChild(projectCard);
    });
  }

  createProjectsGrid() {
    const grid = document.createElement('div');
    grid.className = 'projects-grid';
    this.container.appendChild(grid);
    return grid;
  }

  createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.projectId = project.id;
    
    card.innerHTML = `
      <div class="project-thumbnail">
        <img src="${project.thumbnail}" alt="${project.title}" loading="lazy">
        <div class="project-overlay">
          <button class="view-project-btn">View Details</button>
        </div>
      </div>
      <div class="project-info">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-technologies">
          ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
      </div>
    `;
    
    return card;
  }

  setupEventListeners() {
    // Filter button listeners
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        this.handleFilterClick(e.target);
      }
      
      if (e.target.classList.contains('view-project-btn')) {
        const projectCard = e.target.closest('.project-card');
        const projectId = projectCard.dataset.projectId;
        this.showProjectModal(projectId);
      }
    });
  }

  handleFilterClick(button) {
    // Update active filter button
    this.container.querySelectorAll('.filter-btn').forEach(btn => 
      btn.classList.remove('active'));
    button.classList.add('active');
    
    // Update current filter and re-render
    this.currentFilter = button.dataset.category;
    this.render();
  }

  filterByCategory(category) {
    this.currentFilter = category;
    this.render();
    
    // Update active button
    this.container.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
  }

  showProjectModal(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;
    
    this.createModal(project);
  }

  createModal(project) {
    // Remove existing modal if any
    this.closeModal();
    
    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <button class="modal-close">&times;</button>
          <div class="modal-header">
            <h2>${project.title}</h2>
            <div class="project-links">
              ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" class="project-link">Live Demo</a>` : ''}
              ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="project-link">Source Code</a>` : ''}
            </div>
          </div>
          <div class="modal-body">
            <div class="project-images">
              ${project.images.map(img => `<img src="${img}" alt="${project.title}">`).join('')}
            </div>
            <div class="project-details">
              <p class="project-full-description">${project.description}</p>
              <div class="project-technologies">
                <h4>Technologies Used:</h4>
                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
              </div>
              <div class="project-meta">
                <p><strong>Completed:</strong> ${new Date(project.completedDate).toLocaleDateString()}</p>
                <p><strong>Category:</strong> ${this.categories.find(cat => cat.id === project.category)?.name || project.category}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.modal = modal;
    
    // Setup modal event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
      if (e.target === modal.querySelector('.modal-overlay')) {
        this.closeModal();
      }
    });
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    if (this.modal) {
      document.body.removeChild(this.modal);
      this.modal = null;
      document.body.style.overflow = '';
    }
  }
}