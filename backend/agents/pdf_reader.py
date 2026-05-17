import os
import re
import logging
import concurrent.futures
import requests
import fitz  # PyMuPDF

logger = logging.getLogger(__name__)

def download_pdf(pdf_url, save_path):
    """
    Downloads a PDF from a URL to a local path.
    """
    headers = {
        'User-Agent': 'AIScientist/1.0 (Mozilla/5.0; Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    response = requests.get(pdf_url, headers=headers, timeout=30)
    response.raise_for_status()
    with open(save_path, 'wb') as f:
        f.write(response.content)
    return save_path

def extract_text_from_pdf(pdf_path):
    """
    Extracts text from a local PDF file using PyMuPDF.
    Cleans the text by removing short lines, excessive symbols, and normalizing whitespace.
    """
    with fitz.open(pdf_path) as doc:
        text_chunks = []
        for page in doc:
            text_chunks.append(page.get_text())
    text = "\n".join(text_chunks)

    lines = text.splitlines()
    cleaned_lines = []
    for line in lines:
        line = line.strip()
        if len(line) < 10:
            continue
        line = re.sub(r'[^A-Za-z0-9\s\.,;:\-_\'"()/\[\]%=+<>*^~]+', ' ', line)
        line = re.sub(r'([^\w\s])\1{2,}', r'\1', line)
        cleaned_lines.append(line)

    cleaned_text = ' '.join(cleaned_lines)
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()
    return cleaned_text

def process_paper(paper, download_dir="papers"):
    """
    Downloads and extracts text from a paper.
    """
    if not os.path.exists(download_dir):
        os.makedirs(download_dir)
        
    # Sanitize filename for Windows
    safe_title = re.sub(r'[\\/*?:"<>|]', "", paper['title'])
    filename = safe_title.replace(' ', '_') + ".pdf"
    
    # limit filename length to avoid OS errors
    filename = filename[:200]
    if not filename.endswith(".pdf"):
        filename += ".pdf"
        
    save_path = os.path.join(download_dir, filename)
    
    # Always download fresh
    logger.info("Downloading '%s'...", paper['title'])
    try:
        download_pdf(paper['pdf_url'], save_path)
    except Exception as e:
        logger.warning("Failed to download '%s': %s", paper['title'], e)
        return ""
    
    logger.info("Extracting text from '%s'...", save_path)
    try:
        text = extract_text_from_pdf(save_path)
        return text
    except Exception as e:
        logger.warning("Failed to extract text from '%s': %s", paper['title'], e)
        return ""

def process_papers_parallel(papers, download_dir="papers"):
    """
    Downloads and extracts text from multiple papers in parallel.
    Returns a list of dictionaries with paper text and source metadata.
    """
    extracted_data = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_paper = {executor.submit(process_paper, paper, download_dir): paper for paper in papers}
        for future in concurrent.futures.as_completed(future_to_paper):
            paper = future_to_paper[future]
            try:
                text = future.result()
                if text:
                    extracted_data.append({
                        "text": text,
                        "source": paper["title"],
                        "title": paper["title"]
                    })
            except Exception as exc:
                logger.error("'%s' generated an exception: %s", paper["title"], exc)
    return extracted_data
