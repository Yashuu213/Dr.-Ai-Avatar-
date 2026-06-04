import os
from dotenv import load_dotenv
from services.ai_service import AIService

load_dotenv()

def test():
    print("Initializing AIService...")
    service = AIService()
    print("Testing chat response...")
    try:
        res = service.get_response("My name is Yash sharma")
        print("Response:", res)
    except Exception as e:
        print("Exception caught in script:", e)

if __name__ == "__main__":
    test()
