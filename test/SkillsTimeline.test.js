// Feature: portfolio-enhancement, Property 22: Timeline Display Completeness
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkillsTimeline } from '../js/components/SkillsTimeline.js';
import fc from 'fast-check';

describe('SkillsTimeline', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'skills-timeline';
    document.body.appendChild(container);
  });

  // Property 22: Timeline Display Completeness
  // **Validates: Requirements 8.1**
  it('should display all experience entries with proper chronological ordering', () => {
    fc.assert(
      fc.property(
        // Generator for timeline data
        fc.record({
          experiences: fc.array(
            fc.record({
              id: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'), { minLength: 1, maxLength: 20 }),
              type: fc.constantFrom('work', 'education'),
              title: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '), { minLength: 5, maxLength: 50 }),
              company: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '), { minLength: 3, maxLength: 40 }),
              location: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ,'), { minLength: 5, maxLength: 30 }),
              startDate: fc.date({ min: new Date('2015-01-01'), max: new Date('2023-12-31') }).map(d => d.toISOString()),
              endDate: fc.option(fc.date({ min: new Date('2016-01-01'), max: new Date('2024-12-31') }).map(d => d.toISOString())),
              current: fc.boolean(),
              description: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,'), { minLength: 20, maxLength: 200 }),
              achievements: fc.array(
                fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,'), { minLength: 10, maxLength: 100 }),
                { minLength: 1, maxLength: 5 }
              ),
              technologies: fc.array(
                fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), { minLength: 2, maxLength: 15 }),
                { minLength: 1, maxLength: 8 }
              )
            }),
            { minLength: 1, maxLength: 6 }
          ),
          skills: fc.array(
            fc.record({
              id: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'), { minLength: 1, maxLength: 20 }),
              category: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '), { minLength: 5, maxLength: 30 }),
              skills: fc.array(
                fc.record({
                  name: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), { minLength: 2, maxLength: 20 }),
                  proficiency: fc.integer({ min: 1, max: 100 }),
                  level: fc.constantFrom('Beginner', 'Intermediate', 'Advanced', 'Expert'),
                  yearsOfExperience: fc.integer({ min: 1, max: 10 })
                }),
                { minLength: 1, maxLength: 6 }
              )
            }),
            { minLength: 1, maxLength: 4 }
          )
        }),
        (timelineData) => {
          // Create fresh container for each test
          const testContainer = document.createElement('div');
          testContainer.className = 'test-skills-timeline';
          document.body.appendChild(testContainer);

          try {
            // Initialize SkillsTimeline with generated data
            const skillsTimeline = new SkillsTimeline(testContainer, timelineData);

            // Verify timeline section exists
            const timelineSection = testContainer.querySelector('.timeline-section');
            expect(timelineSection).toBeTruthy();

            // Verify timeline title exists
            const timelineTitle = timelineSection.querySelector('.timeline-title');
            expect(timelineTitle).toBeTruthy();
            expect(timelineTitle.textContent).toBe('Experience & Education');

            // Verify timeline container and line exist
            const timelineContainer = timelineSection.querySelector('.timeline-container');
            expect(timelineContainer).toBeTruthy();
            
            const timelineLine = timelineContainer.querySelector('.timeline-line');
            expect(timelineLine).toBeTruthy();

            // Verify all experiences are displayed
            const timelineItems = testContainer.querySelectorAll('.timeline-item');
            expect(timelineItems.length).toBe(timelineData.experiences.length);

            // Verify chronological ordering (most recent first)
            const sortedExperiences = [...timelineData.experiences].sort((a, b) => 
              new Date(b.startDate) - new Date(a.startDate)
            );

            timelineItems.forEach((item, index) => {
              const expectedExperience = sortedExperiences[index];
              
              // Verify experience ID matches
              expect(item.dataset.experienceId).toBe(expectedExperience.id);
              
              // Verify experience type class
              expect(item.classList.contains(expectedExperience.type)).toBe(true);
              
              // Verify timeline marker and icon
              const timelineMarker = item.querySelector('.timeline-marker');
              expect(timelineMarker).toBeTruthy();
              
              const timelineIcon = timelineMarker.querySelector('.timeline-icon');
              expect(timelineIcon).toBeTruthy();
              
              // Verify correct icon for type
              const expectedIcon = expectedExperience.type === 'work' ? '💼' : '🎓';
              expect(timelineIcon.textContent.trim()).toBe(expectedIcon);
              
              // Verify timeline content
              const timelineContent = item.querySelector('.timeline-content');
              expect(timelineContent).toBeTruthy();
              
              // Verify title
              const title = timelineContent.querySelector('.timeline-title');
              expect(title).toBeTruthy();
              expect(title.textContent).toBe(expectedExperience.title);
              
              // Verify company
              const company = timelineContent.querySelector('.timeline-company');
              expect(company).toBeTruthy();
              expect(company.textContent).toBe(expectedExperience.company);
              
              // Verify location
              const location = timelineContent.querySelector('.timeline-location');
              expect(location).toBeTruthy();
              expect(location.textContent).toBe(expectedExperience.location);
              
              // Verify description
              const description = timelineContent.querySelector('.timeline-description');
              expect(description).toBeTruthy();
              expect(description.textContent).toBe(expectedExperience.description);
              
              // Verify duration format
              const duration = timelineContent.querySelector('.timeline-duration');
              expect(duration).toBeTruthy();
              
              const startDate = new Date(expectedExperience.startDate);
              const expectedStart = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              const expectedEnd = (expectedExperience.current || !expectedExperience.endDate) ? 'Present' : 
                new Date(expectedExperience.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              const expectedDuration = `${expectedStart} - ${expectedEnd}`;
              expect(duration.textContent).toBe(expectedDuration);
              
              // Verify technologies
              const techTags = timelineContent.querySelectorAll('.tech-tag');
              expect(techTags.length).toBe(expectedExperience.technologies.length);
              
              expectedExperience.technologies.forEach((tech, techIndex) => {
                expect(techTags[techIndex].textContent).toBe(tech);
              });
              
              // Verify details button exists
              const detailsBtn = timelineContent.querySelector('.timeline-details-btn');
              expect(detailsBtn).toBeTruthy();
              expect(detailsBtn.textContent).toBe('View Details');
            });

            // Verify chronological ordering is maintained
            for (let i = 0; i < timelineItems.length - 1; i++) {
              const currentExpId = timelineItems[i].dataset.experienceId;
              const nextExpId = timelineItems[i + 1].dataset.experienceId;
              
              const currentExp = timelineData.experiences.find(exp => exp.id === currentExpId);
              const nextExp = timelineData.experiences.find(exp => exp.id === nextExpId);
              
              const currentDate = new Date(currentExp.startDate);
              const nextDate = new Date(nextExp.startDate);
              
              // Current item should have a more recent or equal start date
              expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
            }

          } finally {
            // Cleanup
            document.body.removeChild(testContainer);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 23: Timeline Detail Interaction
  // **Validates: Requirements 8.2**
  it('should display detailed information when clicking timeline items', () => {
    fc.assert(
      fc.property(
        // Generator for timeline data with detailed information
        fc.record({
          experiences: fc.array(
            fc.record({
              id: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'), { minLength: 1, maxLength: 20 }),
              type: fc.constantFrom('work', 'education'),
              title: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '), { minLength: 5, maxLength: 50 }),
              company: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '), { minLength: 3, maxLength: 40 }),
              location: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ,'), { minLength: 5, maxLength: 30 }),
              startDate: fc.date({ min: new Date('2015-01-01'), max: new Date('2023-12-31') }).map(d => d.toISOString()),
              endDate: fc.option(fc.date({ min: new Date('2016-01-01'), max: new Date('2024-12-31') }).map(d => d.toISOString())),
              current: fc.boolean(),
              description: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,'), { minLength: 20, maxLength: 200 }),
              achievements: fc.array(
                fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,'), { minLength: 10, maxLength: 100 }),
                { minLength: 2, maxLength: 5 }
              ),
              technologies: fc.array(
                fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), { minLength: 2, maxLength: 15 }),
                { minLength: 1, maxLength: 8 }
              )
            }),
            { minLength: 1, maxLength: 3 }
          ),
          skills: fc.array(
            fc.record({
              id: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'), { minLength: 1, maxLength: 20 }),
              category: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '), { minLength: 5, maxLength: 30 }),
              skills: fc.array(
                fc.record({
                  name: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), { minLength: 2, maxLength: 20 }),
                  proficiency: fc.integer({ min: 1, max: 100 }),
                  level: fc.constantFrom('Beginner', 'Intermediate', 'Advanced', 'Expert'),
                  yearsOfExperience: fc.integer({ min: 1, max: 10 })
                }),
                { minLength: 1, maxLength: 6 }
              )
            }),
            { minLength: 1, maxLength: 4 }
          )
        }),
        (timelineData) => {
          // Create fresh container for each test
          const testContainer = document.createElement('div');
          testContainer.className = 'test-skills-timeline-interaction';
          document.body.appendChild(testContainer);

          try {
            // Initialize SkillsTimeline with generated data
            const skillsTimeline = new SkillsTimeline(testContainer, timelineData);

            // Test each experience's detail modal
            timelineData.experiences.forEach(experience => {
              // Find the timeline item for this experience
              const timelineItem = testContainer.querySelector(`[data-experience-id="${experience.id}"]`);
              expect(timelineItem).toBeTruthy();
              
              // Find and click the details button
              const detailsBtn = timelineItem.querySelector('.timeline-details-btn');
              expect(detailsBtn).toBeTruthy();
              
              // Simulate click to open modal
              detailsBtn.click();
              
              // Verify modal exists
              const modal = document.querySelector('.timeline-modal');
              expect(modal).toBeTruthy();
              
              // Verify modal header contains experience information
              const modalHeader = modal.querySelector('.modal-header');
              expect(modalHeader).toBeTruthy();
              
              // Check experience icon
              const experienceIcon = modalHeader.querySelector('.experience-icon');
              expect(experienceIcon).toBeTruthy();
              const expectedIcon = experience.type === 'work' ? '💼' : '🎓';
              expect(experienceIcon.textContent.trim()).toBe(expectedIcon);
              
              // Check experience title and company
              const experienceInfo = modalHeader.querySelector('.experience-info');
              expect(experienceInfo).toBeTruthy();
              
              const modalTitle = experienceInfo.querySelector('h2');
              expect(modalTitle).toBeTruthy();
              expect(modalTitle.textContent).toBe(experience.title);
              
              const modalCompany = experienceInfo.querySelector('h3');
              expect(modalCompany).toBeTruthy();
              expect(modalCompany.textContent).toBe(experience.company);
              
              // Check experience meta information
              const experienceMeta = experienceInfo.querySelector('.experience-meta');
              expect(experienceMeta).toBeTruthy();
              expect(experienceMeta.textContent).toContain(experience.location);
              
              // Verify modal body contains detailed information
              const modalBody = modal.querySelector('.modal-body');
              expect(modalBody).toBeTruthy();
              
              // Check description section
              const descriptionSection = modalBody.querySelector('.experience-description');
              expect(descriptionSection).toBeTruthy();
              
              const descriptionTitle = descriptionSection.querySelector('h4');
              expect(descriptionTitle).toBeTruthy();
              expect(descriptionTitle.textContent).toBe('Description');
              
              const descriptionText = descriptionSection.querySelector('p');
              expect(descriptionText).toBeTruthy();
              expect(descriptionText.textContent).toBe(experience.description);
              
              // Check achievements section
              const achievementsSection = modalBody.querySelector('.experience-achievements');
              expect(achievementsSection).toBeTruthy();
              
              const achievementsTitle = achievementsSection.querySelector('h4');
              expect(achievementsTitle).toBeTruthy();
              expect(achievementsTitle.textContent).toBe('Key Achievements');
              
              const achievementsList = achievementsSection.querySelector('ul');
              expect(achievementsList).toBeTruthy();
              
              const achievementItems = achievementsList.querySelectorAll('li');
              expect(achievementItems.length).toBe(experience.achievements.length);
              
              experience.achievements.forEach((achievement, index) => {
                expect(achievementItems[index].textContent).toBe(achievement);
              });
              
              // Check technologies section
              const technologiesSection = modalBody.querySelector('.experience-technologies');
              expect(technologiesSection).toBeTruthy();
              
              const technologiesTitle = technologiesSection.querySelector('h4');
              expect(technologiesTitle).toBeTruthy();
              expect(technologiesTitle.textContent).toBe('Technologies Used');
              
              const techTags = technologiesSection.querySelectorAll('.tech-tag');
              expect(techTags.length).toBe(experience.technologies.length);
              
              experience.technologies.forEach((tech, index) => {
                expect(techTags[index].textContent).toBe(tech);
              });
              
              // Verify modal can be closed
              const closeButton = modal.querySelector('.modal-close');
              expect(closeButton).toBeTruthy();
              closeButton.click();
              
              // Verify modal is closed
              expect(document.querySelector('.timeline-modal')).toBeFalsy();
            });

          } finally {
            // Cleanup any remaining modals
            const remainingModal = document.querySelector('.timeline-modal');
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

  // Property 24: Skills Categorization and Proficiency Display
  // **Validates: Requirements 8.3, 8.4, 8.5**
  it('should categorize skills by type and display proficiency levels with visual indicators', () => {
    fc.assert(
      fc.property(
        // Generator for skills data with categories and proficiency levels
        fc.record({
          experiences: fc.array(
            fc.record({
              id: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'), { minLength: 1, maxLength: 20 }),
              type: fc.constantFrom('work', 'education'),
              title: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '), { minLength: 5, maxLength: 50 }),
              company: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '), { minLength: 3, maxLength: 40 }),
              location: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ,'), { minLength: 5, maxLength: 30 }),
              startDate: fc.date({ min: new Date('2015-01-01'), max: new Date('2023-12-31') }).map(d => d.toISOString()),
              endDate: fc.option(fc.date({ min: new Date('2016-01-01'), max: new Date('2024-12-31') }).map(d => d.toISOString())),
              current: fc.boolean(),
              description: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,'), { minLength: 20, maxLength: 200 }),
              achievements: fc.array(
                fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,'), { minLength: 10, maxLength: 100 }),
                { minLength: 1, maxLength: 5 }
              ),
              technologies: fc.array(
                fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), { minLength: 2, maxLength: 15 }),
                { minLength: 1, maxLength: 8 }
              )
            }),
            { minLength: 0, maxLength: 2 }
          ),
          skills: fc.array(
            fc.record({
              id: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'), { minLength: 1, maxLength: 20 }),
              category: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '), { minLength: 5, maxLength: 30 }),
              skills: fc.array(
                fc.record({
                  name: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), { minLength: 2, maxLength: 20 }),
                  proficiency: fc.integer({ min: 1, max: 100 }),
                  level: fc.constantFrom('Beginner', 'Intermediate', 'Advanced', 'Expert'),
                  yearsOfExperience: fc.integer({ min: 1, max: 10 })
                }),
                { minLength: 1, maxLength: 6 }
              )
            }),
            { minLength: 1, maxLength: 4 }
          )
        }),
        (timelineData) => {
          // Create fresh container for each test
          const testContainer = document.createElement('div');
          testContainer.className = 'test-skills-categorization';
          document.body.appendChild(testContainer);

          try {
            // Initialize SkillsTimeline with generated data
            const skillsTimeline = new SkillsTimeline(testContainer, timelineData);

            // Verify skills section exists
            const skillsSection = testContainer.querySelector('.skills-section');
            expect(skillsSection).toBeTruthy();

            // Verify skills title exists
            const skillsTitle = skillsSection.querySelector('.skills-title');
            expect(skillsTitle).toBeTruthy();
            expect(skillsTitle.textContent).toBe('Technical Skills');

            // Verify skills categories container exists
            const skillsCategories = skillsSection.querySelector('.skills-categories');
            expect(skillsCategories).toBeTruthy();

            // Verify all skill categories are displayed
            const categoryElements = skillsCategories.querySelectorAll('.skill-category');
            expect(categoryElements.length).toBe(timelineData.skills.length);

            // Test each skill category
            timelineData.skills.forEach((skillCategory, categoryIndex) => {
              const categoryElement = categoryElements[categoryIndex];
              expect(categoryElement).toBeTruthy();
              expect(categoryElement.dataset.categoryId).toBe(skillCategory.id);

              // Verify category title
              const categoryTitle = categoryElement.querySelector('.skill-category-title');
              expect(categoryTitle).toBeTruthy();
              expect(categoryTitle.textContent).toBe(skillCategory.category);

              // Verify skills grid exists
              const skillsGrid = categoryElement.querySelector('.skills-grid');
              expect(skillsGrid).toBeTruthy();

              // Verify all skills in category are displayed
              const skillItems = skillsGrid.querySelectorAll('.skill-item');
              expect(skillItems.length).toBe(skillCategory.skills.length);

              // Test each skill item
              skillCategory.skills.forEach((skill, skillIndex) => {
                const skillItem = skillItems[skillIndex];
                expect(skillItem).toBeTruthy();
                expect(skillItem.dataset.skill).toBe(skill.name);

                // Verify skill header
                const skillHeader = skillItem.querySelector('.skill-header');
                expect(skillHeader).toBeTruthy();

                // Verify skill name
                const skillName = skillHeader.querySelector('.skill-name');
                expect(skillName).toBeTruthy();
                expect(skillName.textContent).toBe(skill.name);

                // Verify skill level badge
                const skillLevel = skillHeader.querySelector('.skill-level');
                expect(skillLevel).toBeTruthy();
                expect(skillLevel.textContent).toBe(skill.level);

                // Verify skill level has correct CSS class
                const expectedLevelClass = `level-${skill.level.toLowerCase()}`;
                expect(skillLevel.classList.contains(expectedLevelClass)).toBe(true);

                // Verify skill progress section
                const skillProgress = skillItem.querySelector('.skill-progress');
                expect(skillProgress).toBeTruthy();

                // Verify progress bar
                const progressBar = skillProgress.querySelector('.skill-progress-bar');
                expect(progressBar).toBeTruthy();

                const progressFill = progressBar.querySelector('.skill-progress-fill');
                expect(progressFill).toBeTruthy();
                expect(progressFill.style.width).toBe(`${skill.proficiency}%`);

                // Verify percentage display
                const skillPercentage = skillProgress.querySelector('.skill-percentage');
                expect(skillPercentage).toBeTruthy();
                expect(skillPercentage.textContent).toBe(`${skill.proficiency}%`);

                // Verify years of experience
                const skillExperience = skillItem.querySelector('.skill-experience');
                expect(skillExperience).toBeTruthy();
                expect(skillExperience.textContent).toBe(`${skill.yearsOfExperience} years`);
              });
            });

            // Test public methods for skill access
            timelineData.skills.forEach(skillCategory => {
              // Test getSkillsByCategory method
              const retrievedSkills = skillsTimeline.getSkillsByCategory(skillCategory.id);
              expect(retrievedSkills).toEqual(skillCategory.skills);

              // Test getSkillByName method for each skill
              skillCategory.skills.forEach(skill => {
                const retrievedSkill = skillsTimeline.getSkillByName(skill.name);
                expect(retrievedSkill).toEqual(skill);
              });
            });

            // Test getSkillsByCategory with invalid category
            const invalidSkills = skillsTimeline.getSkillsByCategory('non-existent-category');
            expect(invalidSkills).toEqual([]);

            // Test getSkillByName with invalid skill name
            const invalidSkill = skillsTimeline.getSkillByName('non-existent-skill');
            expect(invalidSkill).toBeNull();

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
  it('should handle empty timeline data gracefully', () => {
    const emptyData = { experiences: [], skills: [] };
    const skillsTimeline = new SkillsTimeline(container, emptyData);
    
    // Should still create timeline and skills sections
    const timelineSection = container.querySelector('.timeline-section');
    expect(timelineSection).toBeTruthy();
    
    const skillsSection = container.querySelector('.skills-section');
    expect(skillsSection).toBeTruthy();
    
    // But no timeline items or skill categories
    const timelineItems = container.querySelectorAll('.timeline-item');
    expect(timelineItems.length).toBe(0);
    
    const skillCategories = container.querySelectorAll('.skill-category');
    expect(skillCategories.length).toBe(0);
  });

  it('should handle missing optional fields in experience data', () => {
    const timelineData = {
      experiences: [{
        id: 'test-exp',
        type: 'work',
        title: 'Test Position',
        company: 'Test Company',
        location: 'Test Location',
        startDate: '2023-01-01',
        endDate: null,
        current: true,
        description: 'Test description',
        achievements: ['Test achievement'],
        technologies: ['JavaScript']
      }],
      skills: []
    };

    const skillsTimeline = new SkillsTimeline(container, timelineData);
    const timelineItem = container.querySelector('.timeline-item');
    
    expect(timelineItem).toBeTruthy();
    expect(timelineItem.dataset.experienceId).toBe('test-exp');
    
    // Should handle current position correctly
    const duration = timelineItem.querySelector('.timeline-duration');
    expect(duration.textContent).toContain('Present');
  });

  it('should handle different proficiency levels correctly', () => {
    const timelineData = {
      experiences: [],
      skills: [{
        id: 'test-skills',
        category: 'Test Category',
        skills: [
          { name: 'Beginner Skill', proficiency: 25, level: 'Beginner', yearsOfExperience: 1 },
          { name: 'Intermediate Skill', proficiency: 50, level: 'Intermediate', yearsOfExperience: 3 },
          { name: 'Advanced Skill', proficiency: 75, level: 'Advanced', yearsOfExperience: 5 },
          { name: 'Expert Skill', proficiency: 95, level: 'Expert', yearsOfExperience: 8 }
        ]
      }]
    };

    const skillsTimeline = new SkillsTimeline(container, timelineData);
    
    const skillItems = container.querySelectorAll('.skill-item');
    expect(skillItems.length).toBe(4);
    
    // Check each proficiency level has correct styling
    const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
    skillItems.forEach((item, index) => {
      const levelElement = item.querySelector('.skill-level');
      expect(levelElement.classList.contains(`level-${levels[index]}`)).toBe(true);
    });
  });
});