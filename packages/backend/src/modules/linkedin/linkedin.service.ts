import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';

import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ExperienceDto {
  @IsString()
  role: string;

  @IsString()
  company: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];
}

export class LinkedInProfileDto {
  @IsString()
  fullName: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  headline?: string;

  @IsString()
  about: string;

  @IsOptional()
  @IsString()
  profileText?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetRoles?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experience: ExperienceDto[];

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

type ProfileData = {
  fullName: string;
  title: string;
  headline: string;
  about: string;
  profileText: string;
  targetRoles: string[];
  skills: string[];
  avatarUrl: string;
  experience: Array<{
    role: string;
    company: string;
    description: string;
    startDate?: string;
    endDate?: string;
  }>;
};

@Injectable()
export class LinkedinService {
  private readonly logger = new Logger(LinkedinService.name);

  constructor(private readonly aiService: AiService) {}

  /**
   * High-level method that scrapes a profile and runs AI analysis
   */
  async analyzeProfileFromUrl(url: string) {
    this.logger.log(`Starting full LinkedIn analysis for: ${url}`);

    const scrapeResult = await this.scrapeLinkedInProfile(url);
    const { scrapingLimited, ...profileData } = scrapeResult as ProfileData & {
      scrapingLimited?: boolean;
    };

    const hasData = !scrapingLimited && Boolean(profileData.about || profileData.title);

    const aiAnalysis = await this.aiService.generateLinkedinAnalysis(profileData, {
      limitedEvidence: !hasData,
      sourceLimitations: hasData
        ? []
        : [
            scrapingLimited
              ? 'LinkedIn limited the public view for this profile. Add your About and Skills text below for a complete analysis.'
              : 'Only basic profile info could be extracted publicly. Add your About and Skills text below for a complete analysis.',
          ],
    });

    return {
      profile: profileData,
      analysis: aiAnalysis,
      timestamp: new Date().toISOString(),
      url,
    };
  }

  async analyzeProfile(data: LinkedInProfileDto) {
    this.logger.log(`Analyzing LinkedIn profile for ${data.fullName}`);

    const aiAnalysis = await this.aiService.generateLinkedinAnalysis(data);

    return {
      profile: data,
      analysis: aiAnalysis,
      timestamp: new Date().toISOString(),
    };
  }

  async scrapeLinkedInProfile(url: string): Promise<ProfileData & { scrapingLimited?: boolean }> {
    this.logger.log(`Scraping LinkedIn profile from ${url}`);

    const usernameMatch = url.match(/linkedin\.com\/in\/([^/?#]+)/);
    const slug = usernameMatch ? usernameMatch[1] : 'user';
    const fallback = this.buildSlugFallback(slug);

    try {
      const response = await axios.get(`https://www.linkedin.com/in/${slug}/`, {
        timeout: 12000,
        maxRedirects: 3,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          Referer: 'https://www.linkedin.com/',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none',
          'Upgrade-Insecure-Requests': '1',
        },
        validateStatus: (status) => status < 500,
      });

      const body: string = typeof response.data === 'string' ? response.data : '';

      if (
        response.status === 999 ||
        body.includes('/authwall/') ||
        body.includes('authwall') ||
        body.includes('login') && body.length < 5000
      ) {
        this.logger.warn(`LinkedIn limited public access for slug: ${slug} (status ${response.status})`);
        return { ...fallback, scrapingLimited: true };
      }

      const parsed = this.parseLinkedInHtml(body, slug);
      this.logger.log(
        `Scraped LinkedIn for ${slug}: name="${parsed.fullName}", title="${parsed.title}", about=${parsed.about.length} chars, skills=${parsed.skills.length}`,
      );
      return parsed;
    } catch (err) {
      const msg = err instanceof AxiosError ? err.message : String(err);
      this.logger.warn(`LinkedIn scrape failed for ${slug}: ${msg}`);
      return fallback;
    }
  }

  private parseLinkedInHtml(html: string, slug: string): ProfileData {
    const $ = cheerio.load(html);
    const formattedName = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    // ── Tier 1: JSON-LD ──────────────────────────────────────────────
    let ldName = '';
    let ldTitle = '';
    let ldDescription = '';
    let ldImage = '';

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const raw = $(el).html() ?? '';
        const parsed: unknown = JSON.parse(raw);
        const nodes = Array.isArray(parsed) ? parsed : [parsed];
        const person = nodes.find(
          (n): n is Record<string, unknown> =>
            typeof n === 'object' && n !== null && (n as Record<string, unknown>)['@type'] === 'Person',
        );
        if (person) {
          ldName = typeof person.name === 'string' ? person.name : '';
          ldTitle = typeof person.jobTitle === 'string' ? person.jobTitle : '';
          ldDescription = typeof person.description === 'string' ? person.description : '';
          const img = person.image;
          if (typeof img === 'string') ldImage = img;
          else if (img && typeof img === 'object' && 'url' in img) ldImage = String((img as Record<string, unknown>).url);
        }
      } catch {
        // ignore malformed JSON-LD blocks
      }
    });

    // ── Tier 2: Open Graph meta tags ─────────────────────────────────
    const ogTitle = $('meta[property="og:title"]').attr('content') ?? '';
    const ogDescription = $('meta[property="og:description"]').attr('content') ?? '';
    const ogImage = $('meta[property="og:image"]').attr('content') ?? '';

    // og:title is typically "Name - Headline | LinkedIn" or "Name | LinkedIn"
    let ogName = '';
    let ogHeadline = '';
    if (ogTitle) {
      const withoutLinkedIn = ogTitle.replace(/\s*\|\s*LinkedIn\s*$/i, '').trim();
      const dashIdx = withoutLinkedIn.indexOf(' - ');
      if (dashIdx !== -1) {
        ogName = withoutLinkedIn.slice(0, dashIdx).trim();
        ogHeadline = withoutLinkedIn.slice(dashIdx + 3).trim();
      } else {
        ogName = withoutLinkedIn;
      }
    }

    // ── Tier 3: CSS selectors ─────────────────────────────────────────
    const cssName =
      $('h1.top-card-layout__title').first().text().trim() ||
      $('h1[class*="profile-header"]').first().text().trim() ||
      $('h1').first().text().trim();

    const cssHeadline =
      $('h2.top-card-layout__headline').first().text().trim() ||
      $('.top-card-layout__headline').first().text().trim() ||
      $('[class*="headline"]').first().text().trim();

    const cssAbout = (() => {
      const candidates = [
        $('.pv-about__summary-text').first().text().trim(),
        $('.pv-profile-section__summary-text').first().text().trim(),
        $('section.summary .pv-about__summary-text').first().text().trim(),
        $('[data-section="summary"] p').map((_, e) => $(e).text().trim()).get().join(' '),
      ];
      return candidates.find((c) => c.length > 20) ?? '';
    })();

    // Skills (limited availability in public view)
    const cssSkills: string[] = [];
    $(
      '.pv-skill-category-entity__name span, .skill-name, [class*="skill"] span',
    ).each((_, el) => {
      const s = $(el).text().trim();
      if (s && s.length < 60 && !cssSkills.includes(s)) cssSkills.push(s);
    });

    // ── Merge with priority: JSON-LD > OG > CSS > slug ───────────────
    const fullName = ldName || cssName || ogName || formattedName;
    const title = ldTitle || cssHeadline || ogHeadline || '';
    const about = ldDescription.length >= (cssAbout.length || 0)
      ? ldDescription
      : cssAbout || ogDescription || '';
    const avatarUrl =
      ldImage ||
      ogImage ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0284c7&color=fff&size=256`;

    const profileText = [title, about].filter(Boolean).join('\n\n');

    return {
      fullName,
      title,
      headline: title,
      about,
      profileText,
      targetRoles: [],
      skills: cssSkills.slice(0, 30),
      avatarUrl,
      experience: [],
    };
  }

  fetchProfile(url: string): ProfileData {
    return this.buildSlugFallback(
      (url.match(/linkedin\.com\/in\/([^/?#]+)/) ?? [])[1] ?? 'user',
    );
  }

  private buildSlugFallback(slug: string): ProfileData {
    const formattedName = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return {
      fullName: formattedName,
      title: '',
      headline: '',
      about: '',
      profileText: '',
      targetRoles: [],
      skills: [],
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=0284c7&color=fff&size=256`,
      experience: [],
    };
  }
}
