from transformers import AutoTokenizer
from langchain_core.documents import Document

# Token-based chunking uses the same embedding tokenizer to keep chunk size aligned with model input.
tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2", use_fast=True)

def split_text(extracted_data, chunk_size=700, chunk_overlap=100):
    """
    Splits extracted paper text into token-based document chunks with metadata.
    """
    docs = []
    for item in extracted_data:
        text = item["text"]
        token_ids = tokenizer.encode(text, add_special_tokens=False)
        start = 0
        while start < len(token_ids):
            end = min(start + chunk_size, len(token_ids))
            chunk_tokens = token_ids[start:end]
            chunk_text = tokenizer.decode(chunk_tokens, skip_special_tokens=True, clean_up_tokenization_spaces=True)
            docs.append(Document(
                page_content=chunk_text,
                metadata={
                    "source": item["source"],
                    "title": item.get("title", item["source"])
                }
            ))
            if end == len(token_ids):
                break
            start += chunk_size - chunk_overlap
    return docs
