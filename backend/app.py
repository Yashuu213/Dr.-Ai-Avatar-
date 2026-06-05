from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import fitz  # PyMuPDF
from dotenv import load_dotenv
from services.ai_service import AIService

load_dotenv()

app = Flask(__name__)
CORS(app)

ai_service = AIService()

@app.route('/', methods=['GET'])
def index():
    return jsonify({"status": "AI Avatar Backend is Running! 🚀", "endpoints": ["/api/chat", "/api/report"]})

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    image_base64 = data.get('image', None)
    attached_file = data.get('attached_file', None)
    
    if attached_file:
        file_type = attached_file.get('type', '')
        file_data = attached_file.get('data', '')
        
        if file_type.startswith('image/'):
            # Override webcam frame with uploaded image
            image_base64 = file_data
        elif file_type == 'application/pdf':
            try:
                pdf_bytes = base64.b64decode(file_data)
                doc = fitz.open(stream=pdf_bytes, filetype="pdf")
                extracted_text = ""
                for page in doc:
                    extracted_text += page.get_text() + "\n"
                
                user_message = f"Uploaded Medical Report Content:\n---\n{extracted_text}\n---\n\nUser Question: {user_message}"
            except Exception as e:
                print(f"Error parsing PDF: {e}")
    
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    response = ai_service.get_response(user_message, image_base64)
    return jsonify(response)

@app.route('/api/report', methods=['GET'])
def get_report():
    report = ai_service.generate_report()
    return jsonify({"report": report})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
