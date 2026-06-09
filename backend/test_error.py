import sys
import traceback
from services.ai_service import AIService
from dotenv import load_dotenv

load_dotenv()

try:
    service = AIService()
    if service.is_configured:
        res = service.get_response("Yash")
        print(res)
    else:
        print("Not configured")
except Exception as e:
    traceback.print_exc()
