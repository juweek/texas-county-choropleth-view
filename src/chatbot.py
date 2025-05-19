import os
from dotenv import load_dotenv
import asyncio
from typing import Optional, List, Dict
import aiohttp
import pandas as pd
from docx import Document
import json
from PyPDF2 import PdfReader

# Load environment variables from .env.local file in root directory
load_dotenv('../.env.local')

os.environ["TOKENIZERS_PARALLELISM"] = "false"
import openai
import chromadb
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# --- CONFIGURATION ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set. Please check your .env.local file.")

CHROMA_COLLECTION_NAME = "tdis_documents"
DOCUMENTS_DIR = os.path.join(os.path.dirname(__file__), "documents")  # Documents directory in src/

# TDIS Information
TDIS_DESCRIPTION = """The Texas Disaster Information System (TDIS) is a comprehensive data platform for natural disaster management in Texas. It aims to streamline the ingestion, storage, processing, and utilization of disaster-related data, focusing on improving natural disaster preparedness, response, recovery, and mitigation efforts across the state.

TDIS addresses the current challenges of fragmented, poorly maintained, and inaccessible disaster data in Texas by centralizing and organizing this information. This helps overcome limitations faced by responders, planners, and researchers in effectively supporting disaster resilience."""

# --- SETUP FASTAPI ---
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",  # Local development
        "https://juweek.github.io",  # GitHub Pages domain
        "https://juweek.github.io/texas-county-choropleth-view"  # Full GitHub Pages URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SETUP CHROMA ---
client = chromadb.Client()
collection = client.get_or_create_collection(name=CHROMA_COLLECTION_NAME)

# --- SETUP OPENAI CLIENT (v1.x) ---
openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)

# Global state to track data loading
is_data_loaded = False
data_loading_task: Optional[asyncio.Task] = None

# --- MODELS ---
class Question(BaseModel):
    text: str

def process_docx(file_path: str) -> str:
    """Process a Word document and return its text content."""
    doc = Document(file_path)
    return "\n".join([paragraph.text for paragraph in doc.paragraphs])

def process_excel(file_path: str) -> str:
    """Process an Excel file and return its content as text."""
    df = pd.read_excel(file_path)
    return df.to_string()

def process_pdf(file_path: str) -> str:
    """Process a PDF file and return its text content."""
    reader = PdfReader(file_path)
    text = []
    for page in reader.pages:
        text.append(page.extract_text())
    return "\n".join(text)

def process_document(file_path: str) -> Dict:
    """Process a document and return its content and metadata."""
    file_ext = os.path.splitext(file_path)[1].lower()
    
    if file_ext == '.docx':
        content = process_docx(file_path)
    elif file_ext in ['.xlsx', '.xls']:
        content = process_excel(file_path)
    elif file_ext == '.pdf':
        content = process_pdf(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_ext}")
    
    return {
        "content": content,
        "filename": os.path.basename(file_path),
        "type": file_ext[1:],
        "last_modified": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
    }

async def load_local_documents():
    """Load and process all documents in the documents directory."""
    documents = []
    print(f"\n📂 Scanning {DOCUMENTS_DIR} for documents...")
    
    # Check if directory exists
    if not os.path.exists(DOCUMENTS_DIR):
        print(f"⚠️  Documents directory not found at {DOCUMENTS_DIR}")
        return documents
        
    files = os.listdir(DOCUMENTS_DIR)
    print(f"📄 Found {len(files)} files in directory")
    
    for filename in files:
        file_path = os.path.join(DOCUMENTS_DIR, filename)
        if os.path.isfile(file_path):
            try:
                print(f"🔄 Processing {filename}...")
                doc = process_document(file_path)
                documents.append(doc)
                print(f"✅ Successfully processed {filename}")
            except Exception as e:
                print(f"❌ Error processing {filename}: {str(e)}")
    return documents

async def ingest_documents_to_chroma(documents: List[Dict]):
    """Ingest processed documents into ChromaDB."""
    print(f"\n📥 Starting ingestion of {len(documents)} documents into ChromaDB...")
    for i, doc in enumerate(documents, 1):
        try:
            collection.add(
                documents=[doc["content"]],
                metadatas=[{
                    "filename": doc["filename"],
                    "type": doc["type"],
                    "last_modified": doc["last_modified"]
                }],
                ids=[f"doc_{doc['filename']}"]
            )
            print(f"✅ Ingested document {i}/{len(documents)}: {doc['filename']}")
        except chromadb.errors.IDAlreadyExistsError:
            print(f"⚠️  Document already exists: {doc['filename']}")
            continue
    print("✨ Document ingestion complete!")

# --- STEP 1: FETCH LIVE NOAA ALERTS ---
async def fetch_noaa_alerts():
    url = "https://api.weather.gov/alerts/active?area=TX"
    headers = {"User-Agent": "tdis-bot (you@example.com)"}
    print("\n🌤️  Fetching NOAA weather alerts...")
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as resp:
            data = await resp.json()
            alerts = []

            for feature in data["features"]:
                alert = feature["properties"]
                alerts.append({
                    "id": alert["id"],
                    "text": alert["headline"] + " " + alert.get("description", ""),
                    "location": alert.get("areaDesc", "Unknown"),
                    "disaster_type": alert.get("event", "General"),
                    "timestamp": alert.get("sent", datetime.now(timezone.utc).isoformat()),
                    "link": alert.get("uri", "")
                })
            print(f"📊 Retrieved {len(alerts)} active weather alerts")
            return alerts

# --- STEP 2: INGEST ALERTS INTO CHROMA ---
async def ingest_to_chroma(alerts):
    for alert in alerts:
        try:
            collection.add(
                documents=[alert["text"]],
                metadatas=[{
                    "location": alert["location"],
                    "disaster_type": alert["disaster_type"],
                    "timestamp": alert["timestamp"],
                    "link": alert["link"]
                }],
                ids=[alert["id"]]
            )
        except chromadb.errors.IDAlreadyExistsError:
            continue  # Skip duplicates

async def load_data():
    global is_data_loaded
    try:
        print("\n🚀 Starting data loading process...")
        
        # Step 1: Load local documents
        print("\n📚 Phase 1: Loading local documents")
        documents = await load_local_documents()
        await ingest_documents_to_chroma(documents)
        print(f"✅ Phase 1 complete: Loaded {len(documents)} local documents")

        # Step 2: Load NOAA alerts
        print("\n🌤️  Phase 2: Loading NOAA alerts")
        alerts = await fetch_noaa_alerts()
        print(f"📥 Ingesting {len(alerts)} alerts into ChromaDB...")
        await ingest_to_chroma(alerts)
        print("✅ Phase 2 complete: NOAA alerts loaded")
        
        is_data_loaded = True
        print("\n✨ All data loading complete!")
    except Exception as e:
        print(f"\n❌ Error during data loading: {str(e)}")
        is_data_loaded = False

# --- STEP 3: QUERY CHROMA + PASS TO GPT ---
def answer_question(question):
    print(f"\n🔍 Processing question: {question}")
    
    # Step 3a: Find relevant documents
    print("Searching ChromaDB for relevant documents...")
    results = collection.query(
        query_texts=[question],
        n_results=5,  # Increased to 5 to get more context
        include=['documents', 'metadatas', 'distances']  # Include distances to see relevance scores
    )
    
    print(f"Found {len(results['documents'][0])} relevant documents")
    for i, (doc, metadata, distance) in enumerate(zip(results['documents'][0], results['metadatas'][0], results['distances'][0])):
        print(f"\nDocument {i+1}:")
        print(f"Source: {metadata.get('filename', 'unknown')}")
        print(f"Type: {metadata.get('type', 'unknown')}")
        print(f"Relevance score: {distance}")
        print(f"Preview: {doc[:200]}...")  # Show first 200 chars of each document
    
    context = "\n".join(results["documents"][0])  # documents is a list-of-lists

    # Step 3b: Format prompt
    prompt = f"""You are a helpful TDIS (Texas Disaster Information System) assistant. Your primary role is to:
1. Explain what TDIS is and its purpose
2. Describe how TDIS works and its capabilities
3. Provide information about current disaster alerts in Texas
4. Help users understand disaster management in Texas

TDIS Information:
{TDIS_DESCRIPTION}

Current Disaster Context:
{context}


Question:
{question}

Answer:"""

    print("\n🤖 Sending to GPT...")
    # Step 3c: Call GPT (OpenAI v1.x)
    response = openai_client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    print("✅ Received response from GPT")
    return response.choices[0].message.content.strip()

# --- API ENDPOINTS ---
@app.post("/api/health")
async def health_check():
    """Health check endpoint that triggers data loading if not already started"""
    global data_loading_task, is_data_loaded
    
    # If data isn't loaded and no loading task is running, start one
    if not is_data_loaded and data_loading_task is None:
        data_loading_task = asyncio.create_task(load_data())
    
    return {
        "status": "ok",
        "data_loaded": is_data_loaded,
        "data_loading": data_loading_task is not None and not data_loading_task.done()
    }

@app.get("/api/corpus-status")
async def corpus_status():
    """Get information about the documents in the corpus"""
    try:
        # Get only metadata and IDs, not the full documents
        results = collection.get(
            include=['metadatas', 'ids'],
            limit=100  # Limit to first 100 documents
        )
        
        # Group documents by type
        doc_types = {}
        for metadata in results["metadatas"]:
            doc_type = metadata.get("type", "unknown")
            if doc_type not in doc_types:
                doc_types[doc_type] = 0
            doc_types[doc_type] += 1
        
        return {
            "total_documents": len(results["ids"]),
            "document_types": doc_types,
            "sample_documents": [
                {
                    "id": id,
                    "type": metadata.get("type", "unknown"),
                    "filename": metadata.get("filename", "unknown"),
                    "last_modified": metadata.get("last_modified", "unknown")
                }
                for id, metadata in zip(results["ids"][:5], results["metadatas"][:5])  # Show first 5 documents
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat_endpoint(question: Question):
    try:
        answer = answer_question(question.text)
        return {"response": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)