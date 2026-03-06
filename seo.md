# SEO Implementation Checklist: leobruno.it
## Target: Rank for "leo bruno writer"

---

## IMMEDIATE WINS (Week 1)

### 1. Google Search Console Setup
- [ ] Verify domain ownership
- [ ] Submit sitemap.xml (should be at `/sitemap.xml`)
- [ ] Submit all individual page URLs manually
- [ ] Set preferred domain (www vs non-www)
- [ ] Check for and fix any crawl errors

### 2. Sitemap Generation/Verification
- [ ] Ensure sitemap.xml exists and is auto-generated
- [ ] Verify it includes ALL published content
- [ ] Add `<changefreq>` and `<priority>` tags
- [ ] Ensure it updates dynamically when new content published
- [ ] Add sitemap URL to robots.txt

### 3. robots.txt Optimization
```txt
User-agent: *
Allow: /
Sitemap: https://leobruno.it/sitemap.xml
```

### 4. Meta Tags - Homepage
```html
<title>Leo Bruno - Writer | Literary Fiction, Essays & Cultural Criticism</title>
<meta name="description" content="Leo Bruno is an American writer living in Sardinia. Author of Reliquary, The Wolf and Other Stories, and the Sweetie or Not essay series. Literary fiction, cultural criticism, and Field Notes from Italy.">
<meta name="keywords" content="leo bruno, leo bruno writer, literary fiction, american writer italy, reliquary novel, sweetie or not">
<link rel="canonical" href="https://leobruno.it">
```

### 5. Meta Tags - Key Pages
**About Page:**
```html
<title>About Leo Bruno - American Writer in Sardinia</title>
<meta name="description" content="Leo Bruno is an American writer and copywriter based in Sardinia, Italy. Literary fiction author working on Reliquary and The Wolf and Other Stories.">
```

**Each Essay/Story Page:**
```html
<title>[Title] - Leo Bruno</title>
<meta name="description" content="[First 155 characters of piece] by Leo Bruno, writer.">
<meta name="author" content="Leo Bruno">
```

### 6. Structured Data (Schema.org JSON-LD)
Add to `<head>` of homepage:
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Leo Bruno",
  "alternateName": "Joe [Last Name if you want]",
  "jobTitle": "Writer",
  "description": "American writer living in Sardinia, author of literary fiction and cultural criticism",
  "url": "https://leobruno.it",
  "sameAs": [
    "https://www.instagram.com/[your_handle]",
    "https://www.youtube.com/@[your_channel]"
  ],
  "knowsAbout": ["Literary Fiction", "Creative Writing", "Cultural Criticism", "Italian Literature"],
  "alumniOf": {
    "@type": "Organization",
    "name": "[Your educational background if relevant]"
  }
}
```

Add to each essay/story page:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Article Title]",
  "author": {
    "@type": "Person",
    "name": "Leo Bruno"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Leo Bruno",
    "logo": {
      "@type": "ImageObject",
      "url": "https://leobruno.it/logo.png"
    }
  },
  "datePublished": "[ISO date]",
  "dateModified": "[ISO date]",
  "description": "[Meta description]"
}
```

---

## TECHNICAL SEO (Week 1-2)

### 7. Site Performance
- [ ] Run Lighthouse audit
- [ ] Optimize images (WebP format, proper sizing)
- [ ] Enable compression (Gzip/Brotli)
- [ ] Minimize JavaScript bundles
- [ ] Implement lazy loading for images
- [ ] Check Core Web Vitals in Search Console

### 8. Mobile Optimization
- [ ] Test all pages on mobile (Google Mobile-Friendly Test)
- [ ] Ensure text is readable without zooming
- [ ] Verify tap targets are properly spaced
- [ ] Check mobile navigation (GSAP animations)

### 9. Internal Linking
- [ ] Add author bio footer to every essay/story with link to about page
- [ ] Create breadcrumb navigation
- [ ] Link between related essays
- [ ] Add "More by Leo Bruno" sections
- [ ] Ensure every page is max 3 clicks from homepage

### 10. URL Structure
- [ ] Verify all URLs are clean and semantic
- [ ] No dynamic parameters in URLs
- [ ] Use hyphens, not underscores
- [ ] Keep URLs short and descriptive

Example:
✅ `leobruno.it/essays/sweetie-or-not-lou-reed`
❌ `leobruno.it/post?id=123&category=essay`

---

## CONTENT OPTIMIZATION (Week 2-3)

### 11. Homepage Content
Add H1 tag:
```html
<h1>Leo Bruno - Writer</h1>
```

Add introductory paragraph that includes target keywords naturally:
```
Leo Bruno is an American writer living in Quartucciu, Sardinia. His work includes literary fiction (Reliquary, The Wolf and Other Stories), cultural criticism (Sweetie or Not), and Field Notes from Italy.
```

### 12. About Page Optimization
- [ ] Include "Leo Bruno" and "writer" in first paragraph
- [ ] Add full bio with literary influences
- [ ] List published works
- [ ] Include current projects
- [ ] Add headshot with alt text: "Leo Bruno, writer"

### 13. Keyword Density
For each major page:
- [ ] "Leo Bruno" appears 3-5 times
- [ ] "writer" appears 2-4 times
- [ ] Related terms: literary fiction, essays, cultural criticism
- [ ] Natural integration (no keyword stuffing)

### 14. Image Alt Text
Every image:
```html
<img src="..." alt="Byzantine-style artwork by Leo Bruno for [Essay Title]">
<img src="..." alt="Leo Bruno, American writer in Sardinia">
```

### 15. Heading Hierarchy
Ensure proper structure:
```html
<h1>Main page title (one per page)</h1>
<h2>Major sections</h2>
<h3>Subsections</h3>
```

---

## BACKLINK STRATEGY (Ongoing)

### 16. Literary Platform Profiles
Create profiles with links back to leobruno.it:
- [ ] Goodreads author profile
- [ ] Poets & Writers directory
- [ ] Literary Hub
- [ ] The Rumpus contributor page
- [ ] Electric Literature
- [ ] Duotrope (if submitting)
- [ ] NewPages directory

### 17. Social Profiles
Ensure bio includes "writer" and link:
- [ ] Instagram: "Leo Bruno - Writer. Literary fiction & cultural criticism. ✍️ leobruno.it"
- [ ] YouTube: Same format
- [ ] LinkedIn (if you want): Professional writer profile

### 18. Guest Posting/Cross-Posting
- [ ] Medium: Cross-post excerpts with canonical link back to leobruno.it
- [ ] Substack comments: Engage with literary Substacks, signature with link
- [ ] Literary blog guest posts
- [ ] Interview opportunities

### 19. Citation Links
- [ ] Submit work to literary journals (they link to author bios)
- [ ] Get featured in "writers to watch" roundups
- [ ] Pitch to literary podcasts
- [ ] Author interviews on writing blogs

### 20. Community Engagement
- [ ] Comment on Goodreads discussions (author profile linked)
- [ ] Participate in writing subreddits with flair/signature
- [ ] Join online writing communities
- [ ] Engage with #WritingCommunity on social media

---

## CONTENT PUBLISHING STRATEGY (Ongoing)

### 21. Publishing Cadence
- [ ] Set consistent schedule (weekly ideal)
- [ ] Each new piece includes:
  - Proper meta tags
  - Schema markup
  - Internal links to related content
  - Author bio with link to about page

### 22. Content Types That Build Authority
- [ ] Long-form essays (1500+ words)
- [ ] Craft essays about writing process
- [ ] Book reviews/literary criticism
- [ ] Writing advice/how-to content
- [ ] "Behind the scenes" of your work

### 23. Virgin River Strategy
- [ ] Create Virgin River content hub on site
- [ ] Individual pages for each script/analysis
- [ ] Optimize for "virgin river season 8" and related terms
- [ ] Link to from fan communities (Reddit, Facebook groups)
- [ ] YouTube videos linking back to scripts on site

---

## ANALYTICS & MONITORING (Week 1, then ongoing)

### 24. Google Analytics 4
- [ ] Install GA4
- [ ] Set up conversion tracking (newsletter signups, etc.)
- [ ] Monitor traffic sources
- [ ] Track "leo bruno writer" as custom search term

### 25. Search Console Monitoring
Weekly check:
- [ ] Search query performance
- [ ] Click-through rates
- [ ] Average position for target keywords
- [ ] Crawl errors
- [ ] Mobile usability issues

### 26. Rank Tracking
- [ ] Track position for "leo bruno writer" weekly
- [ ] Track related terms: "leo bruno author", "leo bruno sardinia", "reliquary novel"
- [ ] Monitor branded searches

---

## ADVANCED TACTICS (Month 2+)

### 27. Wikipedia Presence
- [ ] If/when you get significant press, create Wikipedia article
- [ ] Cite published works, press coverage
- [ ] Link to leobruno.it as official website

### 28. Google Knowledge Panel
Once you have:
- Verified Google Search Console
- Structured data implemented
- Social profiles established
- Press mentions

You can claim/suggest a Knowledge Panel.

### 29. Press & Media
- [ ] Press page on leobruno.it with media kit
- [ ] Pitch local Sardinian press (expat writer angle)
- [ ] Pitch Italian literary magazines
- [ ] Pitch US literary sites

### 30. Newsletter SEO
- [ ] Archive newsletters on website (not just email)
- [ ] Optimize archive pages
- [ ] Create newsletter-specific landing page

---

## PRIORITY ORDER

**This week:**
1. Google Search Console (1)
2. Sitemap verification (2)
3. Homepage meta tags (4)
4. Structured data - Person schema (6)

**Next week:**
5. All page meta tags (5)
6. About page optimization (12)
7. Internal linking (9)
8. Literary platform profiles (16)

**Ongoing:**
9. Consistent publishing with SEO optimization (21-23)
10. Backlink building (17-20)
11. Monitoring and adjustment (25-26)

---

## SUCCESS METRICS

**3 months:**
- Google Search Console shows "leo bruno writer" query
- Impressions for target keyword > 100/month
- Site appears in top 50 results

**6 months:**
- Target keyword in top 20
- 500+ monthly organic visitors
- 5+ quality backlinks from literary sites

**12 months:**
- Page 1 for "leo bruno writer"
- 2000+ monthly organic visitors
- Google Knowledge Panel
- Wikipedia presence

---

## NOTES

- Every time you publish, manually submit URL to Search Console
- After major publications (Nuovi Argomenti, Paris Review), push hard on backlinks
- Don't use AI-generated SEO content - keep voice authentic
- Quality > quantity on backlinks (one Paris Review link > 100 random blogs)
- Byzantine aesthetic is differentiation - lean into it in image alt text and descriptions
- Virgin River content could be sleeper SEO win - optimize heavily

---

**Timeline estimate: 3-6 months to crack page 1, assuming:**
- Weekly publishing cadence
- Proper technical SEO implementation
- Active backlink building
- At least one major publication placement