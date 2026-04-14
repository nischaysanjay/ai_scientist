# AI Scientist - Scientific Validation Edition

A research assistant that combines RAG-based literature analysis with automated scientific validation.
It discovers papers, extracts knowledge, generates hypotheses, and quantifies stability and novelty using CDM + NDI.

## Features

- Paper search on arXiv
- Local PDF download and text extraction
- FAISS-backed semantic retrieval
- Research summaries, gap detection, hypothesis generation, and experiment planning
- Hypothesis validation with CDM + NDI
- Local LLM inference through Ollama

## Prerequisites

- Python 3.12+
- Node.js 22+
- [Ollama](https://ollama.com/)

Pull the default local model before starting:

```bash
ollama pull mistral
```

## Installation

1. Clone the repository and enter it:

```bash
git clone https://github.com/nischaysanjay/ai_scientist.git
cd ai_scientist
```

2. Install the backend Python dependencies:

```bash
pip install -r backend/requirements.txt
```

3. Choose your PyTorch setup:

CPU only:

```bash
pip install --upgrade --force-reinstall torch --index-url https://download.pytorch.org/whl/cpu
```

NVIDIA GPU with CUDA:

```bash
pip install --upgrade --force-reinstall torch --index-url https://download.pytorch.org/whl/cu126
```

Notes:
- The backend automatically uses CUDA when `torch.cuda.is_available()` is `True`.
- The project does not require `torchvision` for text embeddings.
- On first run, the embedding model `sentence-transformers/all-MiniLM-L6-v2` is loaded from the local Hugging Face cache if present; otherwise it is downloaded automatically from Hugging Face.

4. Install the frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

5. Copy the environment file:

On macOS/Linux:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

6. Update `.env` as needed:

```env
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=mistral
IEEE_API_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running

Terminal 1 - backend:

```bash
uvicorn backend.main:app --reload --port 8000
```

Terminal 2 - frontend:

```bash
cd frontend
npm run dev
```

Open:

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`

## Verifying GPU Usage

To confirm PyTorch can see your NVIDIA GPU:

```bash
python -c "import torch; print(torch.__version__); print(torch.cuda.is_available()); print(torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU only')"
```

If this prints `False`, the backend will run embeddings on CPU.

## Using the App

1. Enter a research topic in the sidebar.
2. Choose how many papers to analyze.
3. Click `Run Analysis`.
4. Review the generated papers, summary, gaps, hypotheses, experiment plan, and validation output.

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

## Project Structure

```text
ai_scientist/
|-- .env.example
|-- README.md
|-- backend/
|   |-- main.py
|   |-- requirements.txt
|   |-- agents/
|   |-- utils/
|-- frontend/
|   |-- src/
```
