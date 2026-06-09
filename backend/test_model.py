import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.5-pro-latest"]
api_key = os.getenv("GEMINI_API_KEY")

for m in models:
    try:
        llm = ChatGoogleGenerativeAI(model=m, google_api_key=api_key)
        res = llm.invoke("Hello")
        print(f"{m}: Success")
    except Exception as e:
        print(f"{m}: Failed - {e}")
