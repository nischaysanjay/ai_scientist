import logging
from functools import lru_cache

import torch
from langchain_huggingface import HuggingFaceEmbeddings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_embedding_model():
    """
    Returns a singleton instance of the HuggingFaceEmbeddings model.
    Uses GPU if available, falls back to CPU otherwise.
    The instance is cached for the lifetime of the process.
    """
    if torch.cuda.is_available():
        device = "cuda"
        logger.info("Loading embedding model on GPU (%s)...", torch.cuda.get_device_name(0))
    else:
        device = "cpu"
        logger.warning("GPU not found. Loading embedding model on CPU (expect slower performance).")

    try:
        return HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": device},
        )
    except Exception as exc:
        raise RuntimeError(
            "Failed to load the embedding model 'sentence-transformers/all-MiniLM-L6-v2'. "
            "Make sure the model is available locally or that the machine can access Hugging Face "
            "at least once to download it."
        ) from exc
