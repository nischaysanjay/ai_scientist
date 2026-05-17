from langchain_ollama import OllamaLLM
from backend.utils.prompts import EXPERIMENT_PLAN_PROMPT
from typing import Generator

def plan_experiments(hypotheses, model_name="mistral"):
    """
    Generates an experiment plan for the provided hypotheses.
    """
    llm = OllamaLLM(model=model_name, num_gpu=100, timeout=300)
    chain = EXPERIMENT_PLAN_PROMPT | llm
    experiment_plan = chain.invoke({"hypothesis": hypotheses})
    return experiment_plan

def stream_experiment_plan(hypotheses, model_name="mistral") -> Generator[str, None, None]:
    """
    Streams an experiment plan token-by-token.
    """
    llm = OllamaLLM(model=model_name, num_gpu=100, timeout=300)
    chain = EXPERIMENT_PLAN_PROMPT | llm
    for chunk in chain.stream({"hypothesis": hypotheses}):
        yield chunk
