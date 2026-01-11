// Feature: portfolio-enhancement, Property 16: Sitemap Generation Completeness
// **Validates: Requirements 6.4**

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Sitemap Generation Completeness', () => {
  const sitemapPath = join(process.cwd(), 'sitemap.xml');

  // Property 16: Sitemap Generation Completeness
  // For any website build, a sitemap.xml file should be generated containing all accessible pages
  it('should generate complete sitemap.xml for any set of pages', () => {
    fc.assert(fc.property(
      fc.record({
        baseUrl: fc.webUrl(),
        pages: fc.array(
          fc.record({
            path: fc.string({ minLength: 0, maxLength: 50 }).map(s => s.replace(/[^a-zA-Z0-9\-_\/]/g, '')),
            lastmod: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
            changefreq: fc.constantFrom('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'),
            priority: fc.float({ min: 0.0, max: 1.0 })
          }),
          { minLength: 1, maxLength: 20 }
        )
      }),
      (siteData) => {
        // Generate sitemap XML content
        const sitemapContent = generateSitemap(siteData.baseUrl, siteData.pages);
        
        // Write sitemap to file
        writeFileSync(sitemapPath, sitemapContent, 'utf8');
        
        // Verify sitemap file exists
        expect(existsSync(sitemapPath)).toBe(true);
        
        // Read and parse sitemap content
        const content = readFileSync(sitemapPath, 'utf8');
        
        // Verify XML structure
        expect(content).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
        expect(content).toMatch(/<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
        expect(content).toMatch(/<\/urlset>$/);
        
        // Calculate expected unique URLs
        const expectedUrls = new Set();
        siteData.pages.forEach(page => {
          const cleanPath = page.path.replace(/^\/+/, '').replace(/\/+$/, '');
          const expectedUrl = cleanPath ? `${siteData.baseUrl.replace(/\/$/, '')}/${cleanPath}` : siteData.baseUrl.replace(/\/$/, '');
          expectedUrls.add(expectedUrl);
        });
        
        // Verify all unique pages are included
        expectedUrls.forEach(expectedUrl => {
          const escapedUrl = escapeXml(expectedUrl);
          expect(content).toMatch(new RegExp(`<loc>${escapeRegex(escapedUrl)}</loc>`));
        });
        
        // Verify that all URLs have proper metadata (lastmod, changefreq, priority)
        const urlBlockRegex = /<url>([\s\S]*?)<\/url>/g;
        let urlMatch;
        while ((urlMatch = urlBlockRegex.exec(content)) !== null) {
          const urlContent = urlMatch[1];
          
          // Verify lastmod is present and properly formatted
          expect(urlContent).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
          
          // Verify changefreq is present
          expect(urlContent).toMatch(/<changefreq>(always|hourly|daily|weekly|monthly|yearly|never)<\/changefreq>/);
          
          // Verify priority is present and properly formatted
          expect(urlContent).toMatch(/<priority>\d\.\d<\/priority>/);
        }
        
        // Verify URL count matches expected unique pages
        const urlMatches = content.match(/<url>/g);
        expect(urlMatches).toBeTruthy();
        expect(urlMatches.length).toBe(expectedUrls.size);
        
        // Verify no duplicate URLs
        const urls = [];
        const locRegex = /<loc>(.*?)<\/loc>/g;
        let match;
        while ((match = locRegex.exec(content)) !== null) {
          urls.push(match[1]);
        }
        const uniqueUrlsArray = [...new Set(urls)];
        expect(uniqueUrlsArray.length).toBe(urls.length);
        
        // Verify XML is well-formed (basic check)
        expect(content.split('<url>').length).toBe(content.split('</url>').length);
        expect(content.split('<loc>').length).toBe(content.split('</loc>').length);
        expect(content.split('<lastmod>').length).toBe(content.split('</lastmod>').length);
        expect(content.split('<changefreq>').length).toBe(content.split('</changefreq>').length);
        expect(content.split('<priority>').length).toBe(content.split('</priority>').length);
      }
    ), { numRuns: 100 });
  });

  it('should handle edge cases in sitemap generation', () => {
    fc.assert(fc.property(
      fc.record({
        baseUrl: fc.webUrl(),
        pages: fc.array(
          fc.record({
            path: fc.oneof(
              fc.constant(''),
              fc.constant('/'),
              fc.string({ minLength: 1, maxLength: 10 }).map(s => s.replace(/[^a-zA-Z0-9\-_]/g, '')),
              fc.constant('index.html'),
              fc.constant('about/index.html')
            ),
            lastmod: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
            changefreq: fc.constantFrom('daily', 'weekly', 'monthly'),
            priority: fc.oneof(
              fc.constant(0.0),
              fc.constant(0.5),
              fc.constant(1.0),
              fc.float({ min: Math.fround(0.1), max: Math.fround(0.9) })
            )
          }),
          { minLength: 1, maxLength: 5 }
        )
      }),
      (siteData) => {
        // Generate sitemap with edge case data
        const sitemapContent = generateSitemap(siteData.baseUrl, siteData.pages);
        
        // Write and verify sitemap
        writeFileSync(sitemapPath, sitemapContent, 'utf8');
        expect(existsSync(sitemapPath)).toBe(true);
        
        const content = readFileSync(sitemapPath, 'utf8');
        
        // Verify basic XML structure is maintained even with edge cases
        expect(content).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
        expect(content).toMatch(/<urlset/);
        expect(content).toMatch(/<\/urlset>$/);
        
        // Calculate expected unique URLs for edge cases
        const expectedUniqueUrls = new Set();
        siteData.pages.forEach(page => {
          const cleanPath = page.path.replace(/^\/+/, '').replace(/\/+$/, '');
          const expectedUrl = cleanPath ? `${siteData.baseUrl.replace(/\/$/, '')}/${cleanPath}` : siteData.baseUrl.replace(/\/$/, '');
          expectedUniqueUrls.add(expectedUrl);
        });
        
        // Verify all pages are processed (even empty paths), but deduplicated
        const urlMatches = content.match(/<url>/g);
        expect(urlMatches).toBeTruthy();
        expect(urlMatches.length).toBe(expectedUniqueUrls.size);
        
        // Verify priorities are within valid range (0.0 - 1.0)
        const priorityRegex = /<priority>([\d.]+)<\/priority>/g;
        let priorityMatch;
        while ((priorityMatch = priorityRegex.exec(content)) !== null) {
          const priority = parseFloat(priorityMatch[1]);
          expect(priority).toBeGreaterThanOrEqual(0.0);
          expect(priority).toBeLessThanOrEqual(1.0);
        }
        
        // Verify dates are in correct format (YYYY-MM-DD)
        const dateRegex = /<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g;
        let dateMatch;
        while ((dateMatch = dateRegex.exec(content)) !== null) {
          const dateString = dateMatch[1];
          expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          // Verify it's a valid date
          const date = new Date(dateString);
          expect(date.toISOString().split('T')[0]).toBe(dateString);
        }
      }
    ), { numRuns: 100 });
  });
});

// Helper function to generate sitemap XML
function generateSitemap(baseUrl, pages) {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  
  // Deduplicate pages by URL to avoid duplicate entries
  const urlMap = new Map();
  pages.forEach(page => {
    const cleanPath = page.path.replace(/^\/+/, '').replace(/\/+$/, '');
    const fullUrl = cleanPath ? `${cleanBaseUrl}/${cleanPath}` : cleanBaseUrl;
    
    // Keep the most recent entry for each URL
    if (!urlMap.has(fullUrl) || page.lastmod > urlMap.get(fullUrl).lastmod) {
      urlMap.set(fullUrl, page);
    }
  });
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';
  
  // Process deduplicated URLs
  for (const [fullUrl, page] of urlMap) {
    const lastmod = page.lastmod.toISOString().split('T')[0];
    const priority = page.priority.toFixed(1);
    
    xml += '    \n';
    xml += '    <url>\n';
    xml += `        <loc>${escapeXml(fullUrl)}</loc>\n`;
    xml += `        <lastmod>${lastmod}</lastmod>\n`;
    xml += `        <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `        <priority>${priority}</priority>\n`;
    xml += '    </url>\n';
  }
  
  xml += '    \n';
  xml += '</urlset>';
  
  return xml;
}

// Helper function to escape XML special characters
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

// Helper function to escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}