import os
from dotenv import load_dotenv
import asyncio
from typing import Optional
import aiohttp

# Load environment variables from .env.local file in root directory
load_dotenv('../.env.local')

os.environ["TOKENIZERS_PARALLELISM"] = "false"
import openai
import chromadb
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# --- CONFIGURATION ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set. Please check your .env.local file.")

CHROMA_COLLECTION_NAME = "tdis_alerts"

# Base corpus that's always available
BASE_CORPUS = """The Texas Disaster Information System (TDIS) is a comprehensive data platform for natural disaster management in Texas. It aims to streamline the ingestion, storage, processing, and utilization of disaster-related data, focusing on improving natural disaster preparedness, response, recovery, and mitigation efforts across the state.

TDIS addresses the current challenges of fragmented, poorly maintained, and inaccessible disaster data in Texas by centralizing and organizing this information. This helps overcome limitations faced by responders, planners, and researchers in effectively supporting disaster resilience.

Key Features:
1. Centralized Data Management: TDIS consolidates disaster-related data from various sources into a single, accessible platform.
2. Real-time Monitoring: The system provides up-to-date information about ongoing disasters and emergency situations.
3. Data Analysis Tools: TDIS includes tools for analyzing disaster patterns and impacts.
4. Resource Coordination: Helps coordinate disaster response resources across different agencies and organizations.
5. Public Information: Provides accessible information to the public about disaster preparedness and response.

Common Disaster Types in Texas:
1. Hurricanes and Tropical Storms
2. Flooding
3. Wildfires
4. Tornadoes
5. Severe Thunderstorms
6. Drought
7. Winter Storms

Emergency Response Resources:
1. Texas Division of Emergency Management (TDEM)
2. National Weather Service
3. Local Emergency Management Offices
4. American Red Cross
5. FEMA

For immediate emergency assistance, always call 911 or your local emergency services."""

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

# --- STEP 1: FETCH LIVE NOAA ALERTS ---
async def fetch_noaa_alerts():
    url = "https://api.weather.gov/alerts/active?area=TX"
    headers = {"User-Agent": "tdis-bot (you@example.com)"}
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
        print("🔄 Fetching live NOAA alerts...")
        print("⏳ Loading... please wait.")
        alerts = await fetch_noaa_alerts()

        print(f"📥 Ingesting {len(alerts)} alerts into ChromaDB...")
        await ingest_to_chroma(alerts)
        is_data_loaded = True
        print("✅ Data loaded!")
    except Exception as e:
        print(f"❌ Error loading data: {str(e)}")
        is_data_loaded = False

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

@app.post("/api/chat")
async def chat_endpoint(question: Question):
    try:
        # Always include the base corpus
        context = BASE_CORPUS

        # If data is loaded, include relevant alerts
        if is_data_loaded:
            results = collection.query(query_texts=[question.text], n_results=3)
            if results["documents"][0]:  # If we have any relevant alerts
                context += "\n\nCurrent Disaster Alerts:\n" + "\n".join(results["documents"][0])

        # Format prompt
        prompt = f"""You are a helpful TDIS (Texas Disaster Information System) assistant. Your primary role is to:
1. Explain what TDIS is and its purpose
2. Describe how TDIS works and its capabilities
3. Provide information about disaster management in Texas
4. Help users understand disaster preparedness and response

Context:
{context}

Question:
{question.text}

Answer:"""

        # Call GPT (OpenAI v1.x)
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        return {"response": response.choices[0].message.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
