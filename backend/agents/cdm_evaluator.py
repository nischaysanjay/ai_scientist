import numpy as np
import random
from itertools import combinations
from langchain_ollama import OllamaLLM
from backend.utils.embeddings import get_embedding_model

def _summarize_one_conflict(claim_1, claim_2, model_name):
    """Generates a single plain-English sentence describing what two claims disagree about."""
    prompt = (
        "You are a research analyst. Two scientific claims from different papers appear to conflict.\n"
        "In ONE sentence, explain what these two claims fundamentally disagree about.\n"
        "Do not restate the claims — explain the nature of the disagreement.\n\n"
        f"Claim A: {claim_1}\n"
        f"Claim B: {claim_2}\n\n"
        "Nature of conflict:"
    )
    llm = OllamaLLM(model=model_name, num_gpu=100)
    return llm.invoke(prompt).strip()

def calculate_cdm(vector_store, model_name="mistral", max_claims=10):
    """
    Calculates the Contradiction Density Metric (CDM) for a given research domain.

    Extracts claims (document chunks) from the literature and compares them
    PAIRWISE to see how internally fragmented or consistent the domain is.
    Uses embedding similarity instead of LLM classification for reliability.
    """
    embeddings_model = get_embedding_model()

    # --- Extract Claims (Chunks) ---
    # Sample a smaller subset for faster processing
    all_doc_ids = list(vector_store.docstore._dict.keys())
    sampled_ids = random.sample(all_doc_ids, min(max_claims, len(all_doc_ids)))
    claims = [vector_store.docstore._dict[doc_id] for doc_id in sampled_ids]

    N = len(claims)
    if N < 2:
        return {
            "cdm_score": 0.0,
            "strength_score": 1.0,
            "stability": "Insufficient Data",
            "conflict_summary": "Not enough claims to evaluate.",
            "total_chunks_evaluated": N,
            "total_pairs_evaluated": 0,
            "contradictions": 0,
            "supporting_chunks": 0,
            "neutral_chunks": 0,
            "details": []
        }

    # Generate all unique pairs
    claim_pairs = list(combinations(claims, 2))

    contradiction_count = 0
    support_count = 0
    neutral_count = 0
    results = []

    # Batch embed all claims at once for efficiency
    all_texts = [cl.page_content for cl in claims]
    embeddings_list = []
    
    # Use batch processing if available, otherwise embed individually
    try:
        # Try batch embedding (faster)
        embeddings_list = embeddings_model.embed_documents(all_texts)
    except:
        # Fallback to individual embedding
        embeddings_list = [embeddings_model.embed_query(text) for text in all_texts]
    
    # Pre-compute embeddings and norms
    claim_embeddings = {}
    for i, cl in enumerate(claims):
        embed = np.array(embeddings_list[i])
        norm = np.linalg.norm(embed)
        claim_embeddings[cl.page_content] = (embed, norm)

    # Compare pairs
    for c1, c2 in claim_pairs:
        embed1, norm1 = claim_embeddings[c1.page_content]
        embed2, norm2 = claim_embeddings[c2.page_content]

        # Cosine similarity
        if norm1 == 0 or norm2 == 0:
            similarity = 0.0
        else:
            similarity = float(np.dot(embed1, embed2) / (norm1 * norm2))

        # Classify
        if similarity < 0.35:
            classification = "CONTRADICT"
            contradiction_count += 1
        elif similarity > 0.70:
            classification = "SUPPORT"
            support_count += 1
        else:
            classification = "NEUTRAL"
            neutral_count += 1

        # Only generate summaries for actual contradictions (faster)
        if classification == "CONTRADICT" and len(results) < 3:  # Limit summaries to top 3
            summary = _summarize_one_conflict(
                c1.page_content[:300],
                c2.page_content[:300],
                model_name
            )
            results.append({
                "source": f"{c1.metadata.get('source', 'Unknown')} vs {c2.metadata.get('source', 'Unknown')}",
                "claim": c1.page_content[:200] + "...",
                "classification": classification,
                "raw_response": summary
            })
        elif classification == "CONTRADICT":
            # Skip LLM summary for additional contradictions
            results.append({
                "source": f"{c1.metadata.get('source', 'Unknown')} vs {c2.metadata.get('source', 'Unknown')}",
                "claim": c1.page_content[:200] + "...",
                "classification": classification,
                "raw_response": "(similarity < 0.35 indicates orthogonal claims)"
            })

    total_pairs = len(claim_pairs)
    cdm_score = contradiction_count / total_pairs if total_pairs > 0 else 0.0

    stability = "Stable Domain"
    if cdm_score > 0.6:
        stability = "Highly Fragmented / Contentious"
    elif cdm_score > 0.3:
        stability = "Moderate Disagreement"

    # Generate one summary if we have contradictions
    conflict_summary = "No significant contradictions were detected."
    if results and any(r['classification'] == 'CONTRADICT' for r in results):
        try:
            conflict_summary = results[0]['raw_response']
        except:
            conflict_summary = f"Domain has {contradiction_count} contradicting claim pairs."

    return {
        "cdm_score": cdm_score,
        "strength_score": 1.0 - cdm_score,
        "stability": stability,
        "total_chunks_evaluated": total_pairs,
        "contradictions": contradiction_count,
        "supporting_chunks": support_count,
        "neutral_chunks": neutral_count,
        "conflict_summary": conflict_summary,
        "details": results
    }
