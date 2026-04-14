from transformers import AutoTokenizer
from langchain_core.documents import Document

# Token-based chunking uses the same embedding tokenizer to keep chunk size aligned with model input.
tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2", use_fast=True)
MAX_MODEL_TOKENS = min(getattr(tokenizer, "model_max_length", 512), 512)

def split_text(extracted_data, chunk_size=700, chunk_overlap=100):
    """
    Splits extracted paper text into token-based document chunks with metadata.
    """
    safe_chunk_size = min(chunk_size, MAX_MODEL_TOKENS)
    safe_chunk_overlap = min(chunk_overlap, max(safe_chunk_size - 1, 0))
    step = max(safe_chunk_size - safe_chunk_overlap, 1)

    docs = []
    for item in extracted_data:
        text = item["text"]
        encoded = tokenizer(
            text,
            add_special_tokens=False,
            truncation=True,
            max_length=safe_chunk_size,
            stride=safe_chunk_overlap,
            return_overflowing_tokens=True,
        )
        overflow_chunks = encoded["input_ids"]

        for chunk_tokens in overflow_chunks:
            chunk_text = tokenizer.decode(chunk_tokens, skip_special_tokens=True, clean_up_tokenization_spaces=True)
            docs.append(Document(
                page_content=chunk_text,
                metadata={
                    "source": item["source"],
                    "title": item.get("title", item["source"])
                }
            ))

        if not overflow_chunks and text.strip():
            # Fallback for unexpected tokenizer outputs on non-empty text.
            for start in range(0, len(text), step):
                docs.append(Document(
                    page_content=text[start:start + step],
                    metadata={
                        "source": item["source"],
                        "title": item.get("title", item["source"])
                    }
                ))
    return docs
