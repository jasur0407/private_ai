from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class Message(BaseModel):
    message: str

@app.post("/chat")
def chat(msg: Message):
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {"role": "user", "content": msg.message}
            ]
        )

        reply = response.choices[0].message.content
        return {"reply": reply}

    except Exception as e:
        return {"reply": f"Error: {str(e)}"}