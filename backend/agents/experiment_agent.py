from langchain_ollama import OllamaLLM
from backend.utils.prompts import EXPERIMENT_PLAN_PROMPT
from typing import Generator
import ollama

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
    Streams an experiment plan token-by-token using Ollama native streaming.
    """
    prompt = EXPERIMENT_PLAN_PROMPT.format(hypothesis=hypotheses)
    stream = ollama.generate(model=model_name, prompt=prompt, stream=True)
    for chunk in stream:
        if chunk.response:
            yield chunk.response
