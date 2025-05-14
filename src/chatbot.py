import os
from dotenv import load_dotenv

# Load environment variables from .env.local file in root directory
load_dotenv('../.env.local')

os.environ["TOKENIZERS_PARALLELISM"] = "false"
import requests
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

CHROMA_COLLECTION_NAME = "tdis_alerts"

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

# --- MODELS ---
class Question(BaseModel):
    text: str

# --- STEP 1: FETCH LIVE NOAA ALERTS ---
def fetch_noaa_alerts():
    url = "https://api.weather.gov/alerts/active?area=TX"
    headers = {"User-Agent": "tdis-bot (you@example.com)"}
    resp = requests.get(url, headers=headers)
    data = resp.json()
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

    return alerts

# --- STEP 2: INGEST ALERTS INTO CHROMA ---
def ingest_to_chroma(alerts):
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

# --- STEP 3: QUERY CHROMA + PASS TO GPT ---
def answer_question(question):
    # Step 3a: Find relevant documents
    results = collection.query(query_texts=[question], n_results=3)

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

    # Step 3c: Call GPT (OpenAI v1.x)
    response = openai_client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()

# --- API ENDPOINTS ---
@app.post("/api/chat")
async def chat_endpoint(question: Question):
    try:
        answer = answer_question(question.text)
        return {"response": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
async def startup_event():
    print("🔄 Fetching live NOAA alerts...")
    print("⏳ Loading... please wait.")
    alerts = fetch_noaa_alerts()

    print(f"📥 Ingesting {len(alerts)} alerts into ChromaDB...")
    ingest_to_chroma(alerts)
    print("✅ Data loaded!")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
