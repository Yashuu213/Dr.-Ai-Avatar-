import os
import google.generativeai as genai
from dotenv import load_dotenv

# Force reload of .env
load_dotenv(override=True)

api_key = os.getenv("GEMINI_API_KEY")
print(f"Loaded API Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("ERROR: API Key not found in environment!")
else:
    try:
        genai.configure(api_key=api_key)
        # Using the model found in the list
        model = genai.GenerativeModel('gemini-2.5-flash') 
        response = model.generate_content("Hello, can you hear me?")
        print(f"Success! Model Response: {response.text}")
    except Exception as e:
        print(f"API Connection Failed: {e}")
