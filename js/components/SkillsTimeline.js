// Skills Timeline Component
export class SkillsTimeline {
  constructor(containerElement, timelineData) {
    this.container = containerElement;
    this.experiences = timelineData.experiences || [];
    this.skillCategories = timelineData.skills || [];
    this.activeTimelineItem = null;
    this.modal = null;
    
    this.init();
  }

  init() {
    this.createTimelineSection();
    this.createSkillsSection();
    this.setupEventListeners();
  }

  createTimelineSection() {
    const timelineSection = document.createElement('div');
    timelineSection.className = 'timeline-section';
    timelineSection.innerHTML = `
      <h3 class="timeline-title">Experience & Education</h3>
      <div class="timeline-container">
        <div class="timeline-line"></div>
        <div class="timeline-items"></div>
      </div>
    `;
    
    this.container.appendChild(timelineSection);
    this.renderTimeline();
  }

  renderTimeline() {
    const timelineItems = this.container.querySelector('.timeline-items');
    
    // Sort experiences by start date (most recent first)
    const sortedExperiences = [...this.experiences].sort((a, b) => 
      new Date(b.startDate) - new Date(a.startDate)
    );
    
    sortedExperiences.forEach((experience, index) => {
      const timelineItem = this.createTimelineItem(experience, index);
      timelineItems.appendChild(timelineItem);
    });
  }

  createTimelineItem(experience, index) {
    const item = document.createElement('div');
    item.className = `timeline-item ${experience.type}`;
    item.dataset.experienceId = experience.id;
    
    const startDate = new Date(experience.startDate);
    const endDate = experience.endDate ? new Date(experience.endDate) : null;
    const duration = this.calculateDuration(startDate, endDate, experience.current);
    
    item.innerHTML = `
      <div class="timeline-marker">
        <div class="timeline-icon">
          ${experience.type === 'work' ? '💼' : '🎓'}
        </div>
      </div>
      <div class="timeline-content">
        <div class="timeline-header">
          <h4 class="timeline-title">${experience.title}</h4>
          <span class="timeline-company">${experience.company}</span>
          <span class="timeline-duration">${duration}</span>
        </div>
        <div class="timeline-location">${experience.location}</div>
        <div class="timeline-description">${experience.description}</div>
        <div class="timeline-technologies">
          ${experience.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
        <button class="timeline-details-btn">View Details</button>
      </div>
    `;
    
    return item;
  }

  calculateDuration(startDate, endDate, isCurrent) {
    const start = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const end = (isCurrent || !endDate) ? 'Present' : endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${start} - ${end}`;
  }

  createSkillsSection() {
    const skillsSection = document.createElement('div');
    skillsSection.className = 'skills-section';
    skillsSection.innerHTML = `
      <h3 class="skills-title">Technical Skills</h3>
      <div class="skills-categories"></div>
    `;
    
    this.container.appendChild(skillsSection);
    this.renderSkills();
  }

  renderSkills() {
    const skillsCategories = this.container.querySelector('.skills-categories');
    
    this.skillCategories.forEach(category => {
      const categoryElement = this.createSkillCategory(category);
      skillsCategories.appendChild(categoryElement);
    });
  }

  createSkillCategory(category) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'skill-category';
    categoryDiv.dataset.categoryId = category.id;
    
    categoryDiv.innerHTML = `
      <h4 class="skill-category-title">${category.category}</h4>
      <div class="skills-grid">
        ${category.skills.map(skill => this.createSkillItem(skill)).join('')}
      </div>
    `;
    
    return categoryDiv;
  }

  createSkillItem(skill) {
    const proficiencyClass = this.getProficiencyClass(skill.level);
    
    return `
      <div class="skill-item" data-skill="${skill.name}">
        <div class="skill-header">
          <span class="skill-name">${skill.name}</span>
          <span class="skill-level ${proficiencyClass}">${skill.level}</span>
        </div>
        <div class="skill-progress">
          <div class="skill-progress-bar">
            <div class="skill-progress-fill" style="width: ${skill.proficiency}%"></div>
          </div>
          <span class="skill-percentage">${skill.proficiency}%</span>
        </div>
        <div class="skill-experience">${skill.yearsOfExperience} years</div>
      </div>
    `;
  }

  getProficiencyClass(level) {
    const levelMap = {
      'Beginner': 'level-beginner',
      'Intermediate': 'level-intermediate', 
      'Advanced': 'level-advanced',
      'Expert': 'level-expert'
    };
    return levelMap[level] || 'level-intermediate';
  }

  setupEventListeners() {
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('timeline-details-btn')) {
        const timelineItem = e.target.closest('.timeline-item');
        const experienceId = timelineItem.dataset.experienceId;
        this.showTimelineDetails(experienceId);
      }
    });
  }

  showTimelineDetails(experienceId) {
    const experience = this.experiences.find(exp => exp.id === experienceId);
    if (!experience) return;
    
    this.createTimelineModal(experience);
  }

  createTimelineModal(experience) {
    // Remove existing modal if any
    this.closeModal();
    
    const modal = document.createElement('div');
    modal.className = 'timeline-modal';
    
    const startDate = new Date(experience.startDate);
    const endDate = experience.endDate ? new Date(experience.endDate) : null;
    const duration = this.calculateDuration(startDate, endDate, experience.current);
    
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <button class="modal-close">&times;</button>
          <div class="modal-header">
            <div class="experience-icon">
              ${experience.type === 'work' ? '💼' : '🎓'}
            </div>
            <div class="experience-info">
              <h2>${experience.title}</h2>
              <h3>${experience.company}</h3>
              <div class="experience-meta">
                <span class="experience-location">${experience.location}</span>
                <span class="experience-duration">${duration}</span>
              </div>
            </div>
          </div>
          <div class="modal-body">
            <div class="experience-description">
              <h4>Description</h4>
              <p>${experience.description}</p>
            </div>
            <div class="experience-achievements">
              <h4>Key Achievements</h4>
              <ul>
                ${experience.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
              </ul>
            </div>
            <div class="experience-technologies">
              <h4>Technologies Used</h4>
              <div class="tech-tags">
                ${experience.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
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

  // Public methods for external access
  getSkillsByCategory(categoryId) {
    const category = this.skillCategories.find(cat => cat.id === categoryId);
    return category ? category.skills : [];
  }

  getExperiencesByType(type) {
    return this.experiences.filter(exp => exp.type === type);
  }

  getSkillByName(skillName) {
    for (const category of this.skillCategories) {
      const skill = category.skills.find(s => s.name === skillName);
      if (skill) return skill;
    }
    return null;
  }
}