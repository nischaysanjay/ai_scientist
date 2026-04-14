from langchain_core.prompts import PromptTemplate

# Research Summary Prompt
RESEARCH_SUMMARY_PROMPT = PromptTemplate(
    template="""
    You are an expert researcher. Based on the following text from research papers, provide a comprehensive summary of the research topic '{topic}'.
    Focus on key findings, methodologies, and conclusions.

    Context:
    {context}

    Research Topic: {topic}

    Summary:
    """,
    input_variables=["context", "topic"]
)

# Research Gap Prompt
RESEARCH_GAP_PROMPT = PromptTemplate(
    template="""You are a critical research analyst. Identify key gaps, unresolved questions, and areas of disagreement in the literature.

Summary of existing research:
{context}

Topic: {topic}

Identify 4-6 gaps including:
1. Unresolved questions where methods/approaches differ between studies
2. Contradictory findings or conflicting conclusions
3. Areas where evidence is limited or inconclusive
4. Methodological disagreements among researchers
5. Competing approaches or paradigms
6. Limitations acknowledged but not yet addressed

Focus on gaps where there is DEBATE or DISAGREEMENT in the field, not just gaps that need more work.

List the gaps:""",
    input_variables=["context", "topic"]
)

# Hypothesis Generation Prompt
HYPOTHESIS_PROMPT = PromptTemplate(
    template="""You are a research scientist designing a testable hypothesis for validation.

Based on the identified research gaps and the topic, generate ONE specific, falsifiable hypothesis that:
1. Directly addresses a gap in the research
2. Makes a clear, debatable claim (not obviously true or false)
3. Can be validated/contradicted by evidence in the literature
4. Is specific and measurable

Research Gaps:
{gaps}

Topic: {topic}

Requirements:
- Be specific: name the methods, approaches, or outcomes being tested
- Be testable: it should be possible to find supporting or contradicting evidence
- Be novel but grounded: build on the gaps, not wildly speculative
- Make a claim: don't just describe what needs to be done, claim what WILL happen

Generate ONLY the hypothesis statement, no explanation or preamble.""",
    input_variables=["gaps", "topic"]
)

# Experiment Planning Prompt
EXPERIMENT_PLAN_PROMPT = PromptTemplate(
    template="""
    You are a senior principal investigator. Design a high-level experiment plan to test the following hypothesis.
    Include methodology, data requirements, and evaluation metrics.

    Hypothesis:
    {hypothesis}

    Experiment Plan:
    """,
    input_variables=["hypothesis"]
)

# CDM Evaluation Prompt
CDM_PROMPT = PromptTemplate(
    template="""Classify the relationship between a hypothesis and evidence excerpt.

HYPOTHESIS: {hypothesis}

EVIDENCE EXCERPT: {chunk}

Determine if the excerpt:
- SUPPORTS: Provides evidence, data, methods, or examples corroborating the hypothesis
- CONTRADICTS: Provides evidence challenging, opposing, or disproving the hypothesis
- NEUTRAL: Is unrelated to the hypothesis or neither supports nor contradicts it

Consider:
1. Does the excerpt directly relate to the hypothesis topic?
2. If yes, does the evidence/data/methods agree or disagree with the hypothesis?
3. If no clear connection, classify as NEUTRAL

Your response must be exactly one word: SUPPORT, CONTRADICT, or NEUTRAL""",
    input_variables=["hypothesis", "chunk"]
)
