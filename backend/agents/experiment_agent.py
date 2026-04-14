from langchain_ollama import OllamaLLM
from backend.utils.prompts import EXPERIMENT_PLAN_PROMPT

def plan_experiments(hypotheses, model_name="mistral"):
    """
    Generates an experiment plan for the provided hypotheses.
    """
    llm = OllamaLLM(model=model_name, num_gpu=100)
    chain = EXPERIMENT_PLAN_PROMPT | llm
    experiment_plan = chain.invoke({"hypothesis": hypotheses})
    return experiment_plan
