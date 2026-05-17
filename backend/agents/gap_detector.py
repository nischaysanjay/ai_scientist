from langchain_ollama import OllamaLLM
from backend.utils.prompts import RESEARCH_GAP_PROMPT

def identify_gaps(research_summary, topic, model_name="mistral"):
    """
    Identifies research gaps based on the provided research summary.
    """
    llm = OllamaLLM(model=model_name, num_gpu=100, timeout=300)
    chain = RESEARCH_GAP_PROMPT | llm
    gaps = chain.invoke({"context": research_summary, "topic": topic})
    return gaps
