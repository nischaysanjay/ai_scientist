from langchain_ollama import OllamaLLM
from backend.utils.prompts import RESEARCH_SUMMARY_PROMPT
from typing import Generator
import ollama

def generate_summary(vector_store, topic, model_name="mistral"):
    """
    Generates a research summary using RAG and Ollama.
    """
    llm = OllamaLLM(model=model_name, num_gpu=100, timeout=300)
    docs = vector_store.similarity_search(topic, k=5)
    context = "\n\n".join([doc.page_content for doc in docs])
    chain = RESEARCH_SUMMARY_PROMPT | llm
    summary = chain.invoke({"context": context, "topic": topic})
    return summary

def stream_summary(vector_store, topic, model_name="mistral") -> Generator[str, None, None]:
    """
    Streams a research summary token-by-token using Ollama native streaming.
    """
    docs = vector_store.similarity_search(topic, k=5)
    context = "\n\n".join([doc.page_content for doc in docs])
    prompt = RESEARCH_SUMMARY_PROMPT.format(context=context, topic=topic)
    stream = ollama.generate(model=model_name, prompt=prompt, stream=True)
    for chunk in stream:
        if chunk.response:
            yield chunk.response
