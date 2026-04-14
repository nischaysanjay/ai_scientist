from langchain_community.vectorstores import FAISS
from langchain_community.vectorstores.faiss import DistanceStrategy
from backend.utils.embeddings import get_embedding_model

def create_vector_store(text_chunks):
    """
    Creates a FAISS vector store from LangChain Document objects with metadata.
    Uses cosine distance with normalized embeddings.
    """
    embeddings = get_embedding_model()
    vector_store = FAISS.from_documents(
        text_chunks,
        embedding=embeddings,
        normalize_L2=True,
        distance_strategy=DistanceStrategy.COSINE,
    )
    return vector_store

def load_vector_store(store_path):
    """
    Loads a FAISS vector store from a local path.
    """
    embeddings = get_embedding_model()
    return FAISS.load_local(store_path, embeddings)
