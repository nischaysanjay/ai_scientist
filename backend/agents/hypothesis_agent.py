from langchain_ollama import OllamaLLM
from backend.utils.prompts import HYPOTHESIS_PROMPT
from typing import Generator
import ollama

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
    Streams generated research hypotheses token-by-token using Ollama native streaming.
    """
    prompt = HYPOTHESIS_PROMPT.format(gaps=research_gaps, topic=topic)
    stream = ollama.generate(model=model_name, prompt=prompt, stream=True)
    for chunk in stream:
        if chunk.response:
            yield chunk.response
