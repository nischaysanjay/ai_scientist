from langchain_community.vectorstores import FAISS
from langchain_community.vectorstores.faiss import DistanceStrategy
from backend.utils.embeddings import get_embedding_model

_cache = {"topic": None, "num_chunks": 0, "store": None}

def create_vector_store(text_chunks, topic=None):
    """
    Creates a FAISS vector store from LangChain Document objects with metadata.
    Uses an in-memory cache to avoid re-embedding the same chunks during a single workflow run.
    """
    if topic and _cache["topic"] == topic and _cache["num_chunks"] == len(text_chunks):
        return _cache["store"]

    embeddings = get_embedding_model()
    vector_store = FAISS.from_documents(
        text_chunks,
        embedding=embeddings,
        normalize_L2=True,
        distance_strategy=DistanceStrategy.COSINE,
    )
    
    if topic:
        _cache["topic"] = topic
        _cache["num_chunks"] = len(text_chunks)
        _cache["store"] = vector_store
        
    return vector_store

def load_vector_store(store_path):
    """
    Loads a FAISS vector store from a local path.
    """
    embeddings = get_embedding_model()
    return FAISS.load_local(store_path, embeddings)
