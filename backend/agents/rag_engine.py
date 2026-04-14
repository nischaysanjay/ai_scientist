from langchain_ollama import OllamaLLM
from backend.utils.prompts import RESEARCH_SUMMARY_PROMPT

def generate_summary(vector_store, topic, model_name="mistral"):
    """
    Generates a research summary using RAG and Ollama.
    """
    llm = OllamaLLM(model=model_name, num_gpu=100)
    docs = vector_store.similarity_search(topic, k=5)
    context = "\n\n".join([doc.page_content for doc in docs])
    chain = RESEARCH_SUMMARY_PROMPT | llm
    summary = chain.invoke({"context": context, "topic": topic})
    return summary
