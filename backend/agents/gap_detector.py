from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from backend.utils.prompts import RESEARCH_GAP_PROMPT
from typing import Generator

def identify_gaps(research_summary, topic, model_name="mistral"):
    """
    Identifies research gaps based on the provided research summary.
    """
    llm = OllamaLLM(model=model_name, num_gpu=100, timeout=300)
    chain = RESEARCH_GAP_PROMPT | llm
    gaps = chain.invoke({"context": research_summary, "topic": topic})
    return gaps

def stream_gaps(research_summary, topic, model_name="mistral") -> Generator[str, None, None]:
    """
    Streams identified research gaps token-by-token.
    """
    llm = OllamaLLM(model=model_name, num_gpu=100, timeout=300)
    chain = RESEARCH_GAP_PROMPT | llm
    for chunk in chain.stream({"context": research_summary, "topic": topic}):
        yield chunk
