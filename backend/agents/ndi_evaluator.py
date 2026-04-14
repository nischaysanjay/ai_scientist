import numpy as np
from backend.utils.embeddings import get_embedding_model


def calculate_ndi(hypothesis, vector_store):
    """
    Calculates the Novelty Distance Index (NDI) for a given hypothesis.
    
    NDI = 1 - Max(Cosine Similarity with existing literature)
    
    Args:
        hypothesis (str): The hypothesis to evaluate.
        vector_store (FAISS): The vector store containing research paper chunks.
        
    Returns:
        dict: A dictionary containing the NDI score and novelty classification.
    """
    embeddings_model = get_embedding_model()
    
    # Embed the hypothesis
    hypothesis_embedding = embeddings_model.embed_query(hypothesis)
    
    # Retrieve top relevant chunks with scores (distance)
    # FAISS returns L2 distance by default, but LangChain wrapper handles conversion if using cosine
    # We will compute cosine similarity manually to be sure
    
    docs_and_scores = vector_store.similarity_search_with_score(hypothesis, k=5)
    
    max_similarity = 0.0
    
    for doc, score in docs_and_scores:
        chunk_embedding = embeddings_model.embed_query(doc.page_content)
        
        # Calculate exact Cosine Similarity
        similarity = float(np.dot(hypothesis_embedding, chunk_embedding) / (
            np.linalg.norm(hypothesis_embedding) * np.linalg.norm(chunk_embedding)
        ))
        
        if similarity > max_similarity:
            max_similarity = similarity
            
    ndi_score = 1 - max_similarity
    
    # Classify Novelty
    novelty = "Low Novelty (Incremental)"
    if ndi_score > 0.4:
        novelty = "High Novelty (Radical)"
    elif ndi_score > 0.15:
        novelty = "Moderate Novelty"
        
    return {
        "ndi_score": ndi_score,
        "max_similarity": max_similarity,
        "novelty": novelty
    }
