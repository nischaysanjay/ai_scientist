import logging
import os
from pathlib import Path
from functools import lru_cache

import torch
from langchain_huggingface import HuggingFaceEmbeddings

logger = logging.getLogger(__name__)
EMBEDDING_MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"


def _resolve_local_embedding_model_path() -> str | None:
    cache_root = Path.home() / ".cache" / "huggingface" / "hub" / "models--sentence-transformers--all-MiniLM-L6-v2"
    ref_file = cache_root / "refs" / "main"
    if ref_file.exists():
        snapshot = cache_root / "snapshots" / ref_file.read_text().strip()
        if snapshot.exists():
            return str(snapshot)
    return None


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
        local_model_path = _resolve_local_embedding_model_path()
        if local_model_path:
            logger.info("Loading embedding model from local Hugging Face cache: %s", local_model_path)
            model_name = local_model_path
            model_kwargs = {"device": device, "local_files_only": True}
        else:
            logger.info("Local embedding cache not found. Downloading '%s' from Hugging Face if needed.", EMBEDDING_MODEL_ID)
            model_name = EMBEDDING_MODEL_ID
            model_kwargs = {"device": device}

        return HuggingFaceEmbeddings(
            model_name=model_name,
            cache_folder=os.path.expanduser("~/.cache/huggingface"),
            model_kwargs=model_kwargs,
            encode_kwargs={"normalize_embeddings": True, "batch_size": 32},
        )
    except Exception as exc:
        raise RuntimeError(
            f"Failed to load the embedding model '{EMBEDDING_MODEL_ID}'. "
            "If it is not already cached locally, make sure the machine can access Hugging Face "
            "at least once to download it."
        ) from exc
