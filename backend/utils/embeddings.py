import logging
import os
from pathlib import Path
from functools import lru_cache

import torch
from langchain_huggingface import HuggingFaceEmbeddings

logger = logging.getLogger(__name__)


def _resolve_local_embedding_model_path() -> str:
    cache_root = Path.home() / ".cache" / "huggingface" / "hub" / "models--sentence-transformers--all-MiniLM-L6-v2"
    ref_file = cache_root / "refs" / "main"
    if ref_file.exists():
        snapshot = cache_root / "snapshots" / ref_file.read_text().strip()
        if snapshot.exists():
            return str(snapshot)
    return "sentence-transformers/all-MiniLM-L6-v2"


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
        model_name = _resolve_local_embedding_model_path()
        return HuggingFaceEmbeddings(
            model_name=model_name,
            cache_folder=os.path.expanduser("~/.cache/huggingface"),
            model_kwargs={"device": device, "local_files_only": True},
            encode_kwargs={"normalize_embeddings": True, "batch_size": 32},
        )
    except Exception as exc:
        raise RuntimeError(
            "Failed to load the embedding model 'sentence-transformers/all-MiniLM-L6-v2'. "
            "Make sure the model is available locally or that the machine can access Hugging Face "
            "at least once to download it."
        ) from exc
