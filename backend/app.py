from flask import Flask, request, jsonify
from flask_cors import CORS
import os
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
    
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    response = ai_service.get_response(user_message)
    return jsonify(response)

@app.route('/api/report', methods=['GET'])
def get_report():
    report = ai_service.generate_report()
    return jsonify({"report": report})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
