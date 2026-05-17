from langchain_ollama import OllamaLLM
from backend.utils.prompts import HYPOTHESIS_PROMPT
from typing import Generator

def generate_hypotheses(research_gaps, topic, model_name="mistral"):
    """
    Generates research hypotheses based on identified gaps.
    """
    llm = OllamaLLM(model=model_name, num_gpu=100, timeout=300)
    chain = HYPOTHESIS_PROMPT | llm
    hypotheses = chain.invoke({"gaps": research_gaps, "topic": topic})
    return hypotheses

def stream_hypotheses(research_gaps, topic, model_name="mistral") -> Generator[str, None, None]:
    """
    Streams generated research hypotheses token-by-token.
    """
    llm = OllamaLLM(model=model_name, num_gpu=100, timeout=300)
    chain = HYPOTHESIS_PROMPT | llm
    for chunk in chain.stream({"gaps": research_gaps, "topic": topic}):
        yield chunk
