from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from groq import Groq, AuthenticationError, APIConnectionError

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not set. Create a .env file with GROQ_API_KEY"
    )

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=GROQ_API_KEY)


class Message(BaseModel):
    message: str

@app.post("/chat")
def chat(msg: Message):
    if not msg.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty.")

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful assistant. Answer clearly and concisely."
                        "Use markdown formatting where with proper headings, bold, "
                        "bullet points, and code blocks to make responses easy to read."
                    ),
                },
                {
                    "role": "user",
                    "content": msg.message,
                },
            ],
            temperature=0.7,
        )

        reply = response.choices[0].message.content
        return {"reply": reply}

    except AuthenticationError:
        raise HTTPException(
            status_code=503,
            detail="Invalid or expired API key",
        )
    except APIConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Could not connect to Groq API, it may be due to internet",
        )
    except Exception:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(Exception)}")