# AI Scientist – Scientific Validation Edition 🧪

A research assistant that combines RAG-based literature analysis with automated scientific validation.
It discovers papers, extracts knowledge, generates hypotheses, and quantifies stability and novelty using CDM + NDI.

## Features

- **Paper Search**: Automatically finds relevant papers on arXiv.
- **PDF Processing**: Downloads and extracts text from PDFs locally.
- **Vector Database (RAG)**: Builds a FAISS vector store for semantic search.
- **Research Analysis**:
    - Generates Research Summaries
    - Identifies Research Gaps
    - Proposes Novel Hypotheses
    - Designs Experiment Plans
    - Validates hypotheses using CDM + NDI
- **Local Privacy**: Uses a local LLM (Ollama) and local document storage.

## Prerequisites

1. **Python 3.12+**
2. **Node.js 22+**
3. **Ollama**: Install [Ollama](https://ollama.com/) and pull the Mistral model:
    ```bash
    ollama pull mistral
    ```

## Installation

### Setup Instructions

1. Navigate to the project folder:
    ```bash
    cd ai_scientist
    ```

2. Install backend dependencies:
    ```bash
    pip install -r backend/requirements.txt
    ```

3. Install frontend dependencies:
    ```bash
    cd frontend && npm install
    ```

4. Copy and configure environment variables:
    ```bash
    cp .env.example .env
    # Edit .env and set OLLAMA_API_URL, OLLAMA_MODEL, and optionally IEEE_API_KEY
    ```

## Running

**Terminal 1 – Backend:**
```bash
uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run dev
```

**Access the app:**
- Frontend: http://localhost:3000
- Backend API Docs: http://localhost:8000/docs

## Using the App

1. Enter a **Research Topic** in the sidebar
2. Adjust the **Number of Papers** slider
3. Click **Run Analysis**
4. Review the generated output:
   - Papers Found
   - Research Summary
   - Research Gaps
   - Generated Hypothesis
   - Experiment Plan
   - Scientific Validation (CDM + NDI scores)
   - Stability Classification
   - Viability Conclusion

## Research Contribution Statement

This system extends traditional RAG research assistants by introducing:

- Quantitative contradiction analysis (CDM)
- Embedding-based novelty quantification (NDI)
- Integrated scientific validation pipeline for generated hypotheses

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/search-papers` | Search arXiv for papers |
| POST | `/api/process-pdfs` | Download and extract PDF text |
| POST | `/api/generate-summary` | Generate research summary via RAG |
| POST | `/api/identify-gaps` | Identify research gaps |
| POST | `/api/generate-hypotheses` | Generate hypotheses from gaps |
| POST | `/api/plan-experiment` | Plan experiments for hypotheses |
| POST | `/api/validate-hypothesis` | Validate with CDM + NDI metrics |

Interactive Swagger UI available at `http://localhost:8000/docs`.

## Project Structure

```
ai_scientist/
├── .env.example            # Environment variable template
├── README.md
├── backend/                # FastAPI Backend (Python)
│   ├── main.py             # FastAPI entrypoint & all endpoints
│   ├── requirements.txt    # Python dependencies
│   ├── agents/             # AI agent modules
│   │   ├── paper_search.py     # arXiv paper search
│   │   ├── pdf_reader.py       # PDF download & text extraction
│   │   ├── vector_store.py     # FAISS vector DB
│   │   ├── rag_engine.py       # RAG summary generation
│   │   ├── gap_detector.py     # Research gap identification
│   │   ├── hypothesis_agent.py # Hypothesis generation
│   │   ├── experiment_agent.py # Experiment planning
│   │   ├── cdm_evaluator.py    # Contradiction Density Metric
│   │   ├── ndi_evaluator.py    # Novelty Distance Index
│   │   └── validation_engine.py# CDM + NDI validation pipeline
│   └── utils/              # Shared utilities
│       ├── embeddings.py       # Singleton embedding model
│       ├── text_splitter.py    # Token-based text chunking
│       └── prompts.py          # LangChain prompt templates
└── frontend/               # Next.js Frontend
    └── src/                # Application source
```
