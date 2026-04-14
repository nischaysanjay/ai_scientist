from backend.agents.cdm_evaluator import calculate_cdm
from backend.agents.ndi_evaluator import calculate_ndi


def validate_hypothesis(hypothesis, vector_store, model_name="mistral"):
    """
    Runs the full scientific validation pipeline (CDM + NDI).
    
    CDM calculates domain internal consistency (contradiction density among literature claims).
    NDI calculates hypothesis novelty (distance from existing literature).
    """
    cdm_result = calculate_cdm(vector_store, model_name=model_name)
    ndi_result = calculate_ndi(hypothesis, vector_store)

    cdm_score = cdm_result['cdm_score']
    ndi_score = ndi_result['ndi_score']

    cdm_threshold = 0.4
    ndi_threshold = 0.4

    if cdm_score <= cdm_threshold and ndi_score >= ndi_threshold:
        classification = "Strong & Novel"
    elif cdm_score > cdm_threshold and ndi_score >= ndi_threshold:
        classification = "Novel but Weak"
    elif cdm_score <= cdm_threshold and ndi_score < ndi_threshold:
        classification = "Stable but Known"
    else:
        classification = "Weak & Redundant"

    stability_score = 1.0 - cdm_score
    viability_score = (stability_score + ndi_score) / 2.0

    return {
        "hypothesis": hypothesis,
        "classification": classification,
        "metrics": {
            "stability_score": stability_score,
            "novelty_score": ndi_score,
            "viability_score": viability_score
        },
        "cdm": cdm_result,
        "ndi": ndi_result
    }
