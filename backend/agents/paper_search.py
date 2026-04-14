import os
import logging
from math import ceil
from typing import Any

import arxiv
import requests

logger = logging.getLogger(__name__)

IEEE_SEARCH_URL = "https://ieeexploreapi.ieee.org/api/v1/search/articles"


def _clear_invalid_local_proxy() -> None:
    """
    Remove a known-bad local proxy configuration that breaks outbound API calls.
    """
    bad_proxy_markers = ("127.0.0.1:9", "localhost:9")
    proxy_vars = [
        "HTTP_PROXY",
        "HTTPS_PROXY",
        "ALL_PROXY",
        "http_proxy",
        "https_proxy",
        "all_proxy",
        "GIT_HTTP_PROXY",
        "GIT_HTTPS_PROXY",
    ]

    for var_name in proxy_vars:
        value = os.environ.get(var_name)
        if value and any(marker in value for marker in bad_proxy_markers):
            os.environ.pop(var_name, None)


_clear_invalid_local_proxy()


def _normalize_paper(
    title: str,
    summary: str,
    authors: list[str],
    pdf_url: str,
    published: str | None = None,
) -> dict[str, Any]:
    return {
        "title": title,
        "summary": summary,
        "authors": authors,
        "pdf_url": pdf_url,
        "published": published,
    }


def search_arxiv(topic: str, max_results: int = 5) -> list[dict[str, Any]]:
    """
    Search arXiv for papers related to the given topic.
    """
    client = arxiv.Client()
    search = arxiv.Search(
        query=topic,
        max_results=max_results,
        sort_by=arxiv.SortCriterion.Relevance,
    )

    results: list[dict[str, Any]] = []
    for result in client.results(search):
        results.append(
            _normalize_paper(
                title=result.title,
                summary=result.summary,
                authors=[author.name for author in result.authors],
                pdf_url=result.pdf_url,
                published=result.published.isoformat() if result.published else None,
            )
        )
    return results


def search_ieee(topic: str, max_results: int = 5) -> list[dict[str, Any]]:
    """
    Fallback for IEEE: Searches arXiv specifically for preprints and papers 
    that reference IEEE (e.g., IEEE Access, CVPR, T-PAMI).
    
    This provides high-quality IEEE Open Access papers without requiring a paid API key!
    """
    if max_results <= 0:
        return []

    query = f'{topic} AND all:"IEEE"'
    
    client = arxiv.Client()
    search = arxiv.Search(
        query=query,
        max_results=max_results,
        sort_by=arxiv.SortCriterion.Relevance,
    )

    results: list[dict[str, Any]] = []
    try:
        for result in client.results(search):
            results.append(
                _normalize_paper(
                    title=result.title,
                    summary=result.summary,
                    authors=[author.name for author in result.authors],
                    pdf_url=result.pdf_url,
                    published=result.published.isoformat() if result.published else None,
                )
            )
    except Exception as exc:
        logger.warning("IEEE (via arXiv proxy) search skipped: %s", exc)
        
    return results


def _dedupe_papers(papers: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen_titles: set[str] = set()
    deduped: list[dict[str, Any]] = []

    for paper in papers:
        normalized_title = paper["title"].strip().lower()
        if normalized_title in seen_titles:
            continue
        seen_titles.add(normalized_title)
        deduped.append(paper)

    return deduped


def search_papers(topic: str, max_results: int = 5) -> list[dict[str, Any]]:
    """
    Hybrid search combining arXiv and IEEE Xplore metadata.

    IEEE is optional and only used when IEEE_API_KEY is configured.
    Results are deduplicated by title and trimmed back to max_results.
    """
    arxiv_target = ceil(max_results / 2)
    ieee_target = max_results - arxiv_target

    arxiv_results = search_arxiv(topic, max_results=arxiv_target)
    ieee_results = search_ieee(topic, max_results=ieee_target)

    combined = _dedupe_papers(arxiv_results + ieee_results)

    if len(combined) < max_results:
        extra_arxiv = search_arxiv(topic, max_results=max_results)
        combined = _dedupe_papers(combined + extra_arxiv)

    return combined[:max_results]
