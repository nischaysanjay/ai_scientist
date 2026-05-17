"""
FastAPI Backend for AI Scientist

Serves the Next.js frontend by wrapping existing Python agents.
"""
from __future__ import annotations

import asyncio
import logging
import logging.config
import os
import shutil
from typing import Any, List, Optional

from dotenv import load_dotenv
load_dotenv()

# Suppress HuggingFace unauthenticated and symlink warnings
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import json

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger(__name__)

from backend.agents import paper_search, pdf_reader, rag_engine, gap_detector, hypothesis_agent, experiment_agent, validation_engine, vector_store
from backend.utils import text_splitter

app = FastAPI(
    title="AI Scientist API",
    description="API for automated research analysis and hypothesis validation",
    version="0.1.0",
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:8000",  # API itself
        "http://127.0.0.1:3000",
        "http://172.17.14.79:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== Request/Response Models ==========

class PaperModel(BaseModel):
    """Paper model matching arXiv response"""
    title: str
    summary: str
    authors: List[str]
    pdf_url: str
    published: Optional[str] = None


class SearchPapersRequest(BaseModel):
    """Request to search papers"""
    topic: str = Field(..., description="Research topic to search")
    max_results: int = Field(5, ge=1, le=20, description="Number of papers to fetch")


class ProcessPDFsRequest(BaseModel):
    """Request to process PDFs"""
    papers: List[PaperModel] = Field(..., description="List of papers to process")
    download_dir: str = Field("papers", description="Directory to save PDFs")


class ExtractedPaperModel(BaseModel):
    """Extracted text chunk metadata from a processed paper."""
    text: str
    source: str
    title: str


class GenerateSummaryRequest(BaseModel):
    """Request to generate research summary"""
    extracted_data: List[ExtractedPaperModel] = Field(..., description="Extracted text from papers")
    topic: str = Field(..., description="Research topic")
    model_name: str = Field("mistral", description="LLM model to use")


class IdentifyGapsRequest(BaseModel):
    """Request to identify research gaps"""
    summary: str = Field(..., description="Research summary")
    topic: str = Field(..., description="Research topic")
    model_name: str = Field("mistral", description="LLM model to use")


class GenerateHypothesesRequest(BaseModel):
    """Request to generate hypotheses"""
    gaps: str = Field(..., description="Research gaps")
    topic: str = Field(..., description="Research topic")
    model_name: str = Field("mistral", description="LLM model to use")


class PlanExperimentRequest(BaseModel):
    """Request to plan experiments"""
    hypotheses: str = Field(..., description="Hypotheses to plan experiments for")
    model_name: str = Field("mistral", description="LLM model to use")


class ValidateHypothesisRequest(BaseModel):
    """Request to validate hypothesis"""
    hypothesis: str = Field(..., description="Hypothesis to validate")
    extracted_data: List[ExtractedPaperModel] = Field(..., description="Extracted text from papers")
    model_name: str = Field("mistral", description="LLM model to use")
    topic: Optional[str] = Field(None, description="Research topic for caching vector store")


class ValidationResultModel(BaseModel):
    """Validation result with scores"""
    hypothesis: str
    classification: str
    metrics: dict[str, Any]
    cdm: dict[str, Any]
    ndi: dict[str, Any]


class ProcessPDFsResponse(BaseModel):
    status: str
    extracted_data: List[ExtractedPaperModel]


class SummaryResponse(BaseModel):
    status: str
    summary: str


class GapsResponse(BaseModel):
    status: str
    gaps: str


class HypothesesResponse(BaseModel):
    status: str
    hypotheses: str


class ExperimentPlanResponse(BaseModel):
    status: str
    plan: str


class ValidateHypothesisResponse(BaseModel):
    status: str
    validation_result: ValidationResultModel


def _server_error(action: str, exc: Exception) -> HTTPException:
    return HTTPException(status_code=500, detail=f"Error {action}: {exc}")


# ========== Health Check ==========

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "API is running"}


# ========== API Endpoints ==========

@app.post("/api/search-papers", response_model=List[PaperModel])
async def search_papers(request: SearchPapersRequest):
    """
    Search arXiv for papers related to a topic.
    
    Returns a list of papers with metadata.
    """
    try:
        papers = await asyncio.wait_for(
            asyncio.to_thread(paper_search.search_papers, request.topic, request.max_results),
            timeout=15.0
        )
        return papers
    except asyncio.TimeoutError as exc:
        logger.error("Timeout searching papers for topic: %s", request.topic)
        raise HTTPException(status_code=504, detail="Timeout searching papers. The arXiv API might be rate limiting us.") from exc
    except Exception as exc:
        if "429" in str(exc) or "HTTP Error 429" in str(exc) or "UnexpectedEmptyPageError" in str(exc):
            logger.warning("arXiv rate limit or block hit for topic: %s", request.topic)
            raise HTTPException(status_code=429, detail="The arXiv API is currently rate limiting requests. Please wait a few seconds and try again.") from exc
        raise _server_error("searching papers", exc) from exc


@app.post("/api/process-pdfs", response_model=ProcessPDFsResponse)
async def process_pdfs(request: ProcessPDFsRequest):
    """
    Download and extract text from PDFs.
    
    Returns extracted data with text, source, and title.
    """
    try:
        # Clear the directory to prevent old papers from piling up across multiple workflow runs
        if os.path.exists(request.download_dir):
            await asyncio.to_thread(shutil.rmtree, request.download_dir, True)
        await asyncio.to_thread(os.makedirs, request.download_dir, exist_ok=True)

        # Convert Pydantic models to dicts for agent compatibility
        papers_data = [p.model_dump() for p in request.papers]
        # Run blocking parallel download + extraction off the event loop thread
        extracted_data = await asyncio.to_thread(
            pdf_reader.process_papers_parallel, papers_data, request.download_dir
        )
        return {"status": "success", "extracted_data": extracted_data}
    except Exception as exc:
        raise _server_error("processing PDFs", exc) from exc


@app.post("/api/generate-summary", response_model=SummaryResponse)
async def generate_summary(request: GenerateSummaryRequest):
    """
    Generate research summary from extracted papers.
    
    Uses RAG (Retrieval-Augmented Generation) with vector store.
    """
    try:
        # Offload CPU-bound embedding + LLM calls off the event loop
        extracted_data = [item.model_dump() for item in request.extracted_data]
        chunks = await asyncio.to_thread(text_splitter.split_text, extracted_data)
        vs = await asyncio.to_thread(vector_store.create_vector_store, chunks, request.topic)
        summary = await asyncio.to_thread(
            rag_engine.generate_summary, vs, request.topic, request.model_name
        )
        return {"status": "success", "summary": summary}
    except Exception as exc:
        raise _server_error("generating summary", exc) from exc


@app.post("/api/identify-gaps", response_model=GapsResponse)
async def identify_gaps(request: IdentifyGapsRequest):
    """
    Identify research gaps from a summary.
    """
    try:
        gaps = await asyncio.to_thread(
            gap_detector.identify_gaps, request.summary, request.topic, request.model_name
        )
        return {"status": "success", "gaps": gaps}
    except Exception as exc:
        raise _server_error("identifying gaps", exc) from exc


@app.post("/api/generate-hypotheses", response_model=HypothesesResponse)
async def generate_hypotheses(request: GenerateHypothesesRequest):
    """
    Generate hypotheses from identified research gaps.
    """
    try:
        hypotheses = await asyncio.to_thread(
            hypothesis_agent.generate_hypotheses, request.gaps, request.topic, request.model_name
        )
        return {"status": "success", "hypotheses": hypotheses}
    except Exception as exc:
        raise _server_error("generating hypotheses", exc) from exc


@app.post("/api/plan-experiment", response_model=ExperimentPlanResponse)
async def plan_experiment(request: PlanExperimentRequest):
    """
    Plan experiments for given hypotheses.
    """
    try:
        plan = await asyncio.to_thread(
            experiment_agent.plan_experiments, request.hypotheses, request.model_name
        )
        return {"status": "success", "plan": plan}
    except Exception as exc:
        raise _server_error("planning experiment", exc) from exc


@app.post("/api/validate-hypothesis", response_model=ValidateHypothesisResponse)
async def validate_hypothesis(request: ValidateHypothesisRequest):
    """
    Validate hypothesis using CDM + NDI metrics.
    
    - CDM (Contradiction Density Metric): Measures stability
    - NDI (Novelty Distance Index): Measures novelty
    
    Returns classification: Strong & Novel, Novel but Weak, Stable but Known, or Weak & Redundant
    """
    try:
        # Offload CPU-bound embedding + LLM calls off the event loop
        extracted_data = [item.model_dump() for item in request.extracted_data]
        chunks = await asyncio.to_thread(text_splitter.split_text, extracted_data)
        vs = await asyncio.to_thread(vector_store.create_vector_store, chunks, request.topic)
        result = await asyncio.to_thread(
            validation_engine.validate_hypothesis, request.hypothesis, vs, request.model_name
        )
        return {"status": "success", "validation_result": result}
    except Exception as exc:
        raise _server_error("validating hypothesis", exc) from exc


# ========== Streaming Endpoints ==========

_SENTINEL = object()

async def _iter_sync_gen(gen):
    """
    Safely iterate a synchronous generator inside an async context.
    Each call to next() is offloaded to a thread pool executor so the
    event loop is never blocked, allowing SSE bytes to flush between tokens.
    """
    loop = asyncio.get_event_loop()
    while True:
        token = await loop.run_in_executor(None, next, gen, _SENTINEL)
        if token is _SENTINEL:
            break
        yield token


@app.post("/api/stream-summary")
async def stream_summary(request: GenerateSummaryRequest):
    """
    Stream research summary token-by-token via Server-Sent Events.
    """
    async def event_generator():
        try:
            extracted_data = [item.model_dump() for item in request.extracted_data]
            chunks = await asyncio.to_thread(text_splitter.split_text, extracted_data)
            vs = await asyncio.to_thread(vector_store.create_vector_store, chunks, request.topic)
            gen = rag_engine.stream_summary(vs, request.topic, request.model_name)
            async for token in _iter_sync_gen(gen):
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as exc:
            logger.error("Error streaming summary: %s", exc)
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.post("/api/stream-gaps")
async def stream_gaps(request: IdentifyGapsRequest):
    """
    Stream research gaps token-by-token via Server-Sent Events.
    """
    async def event_generator():
        try:
            gen = gap_detector.stream_gaps(request.summary, request.topic, request.model_name)
            async for token in _iter_sync_gen(gen):
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as exc:
            logger.error("Error streaming gaps: %s", exc)
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.post("/api/stream-hypotheses")
async def stream_hypotheses(request: GenerateHypothesesRequest):
    """
    Stream hypotheses token-by-token via Server-Sent Events.
    """
    async def event_generator():
        try:
            gen = hypothesis_agent.stream_hypotheses(request.gaps, request.topic, request.model_name)
            async for token in _iter_sync_gen(gen):
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as exc:
            logger.error("Error streaming hypotheses: %s", exc)
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.post("/api/stream-experiment")
async def stream_experiment(request: PlanExperimentRequest):
    """
    Stream experiment plan token-by-token via Server-Sent Events.
    """
    async def event_generator():
        try:
            gen = experiment_agent.stream_experiment_plan(request.hypotheses, request.model_name)
            async for token in _iter_sync_gen(gen):
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as exc:
            logger.error("Error streaming experiment plan: %s", exc)
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
