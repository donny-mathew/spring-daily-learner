import { NewsItem, NewsSource, NewsCategory } from "@/types";
import { generateId, truncate, stripHtml } from "./utils";

interface GitHubRelease {
  html_url: string;
  tag_name: string;
  name: string;
  published_at: string;
  body: string;
  prerelease: boolean;
  draft: boolean;
}

const REPOS: { owner: string; repo: string; category: NewsCategory }[] = [
  { owner: "spring-projects", repo: "spring-boot", category: "spring-boot" },
  { owner: "spring-projects", repo: "spring-ai", category: "spring-ai" },
  { owner: "spring-projects", repo: "spring-framework", category: "spring-framework" },
];

async function fetchRepoReleases(
  owner: string,
  repo: string,
  category: NewsCategory
): Promise<NewsItem[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/releases?per_page=10`,
    { headers, next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    console.error(`[github] ${owner}/${repo} → ${res.status}`);
    return [];
  }

  const releases: GitHubRelease[] = await res.json();

  return releases
    .filter((r) => !r.draft && !r.prerelease)
    .slice(0, 5)
    .map((r) => ({
      id: generateId(r.html_url),
      title: `${repo} ${r.tag_name} released`,
      summary: truncate(stripHtml(r.body ?? ""), 200) || `New ${repo} release: ${r.tag_name}`,
      url: r.html_url,
      publishedAt: r.published_at,
      source: "github-releases" as NewsSource,
      category,
      isRelease: true,
      version: r.tag_name,
    }));
}

export async function fetchGitHubReleases(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    REPOS.map((r) => fetchRepoReleases(r.owner, r.repo, r.category))
  );
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
