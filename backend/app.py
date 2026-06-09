from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import fitz  # PyMuPDF
import pydicom
import io
from dotenv import load_dotenv
from services.ai_service import AIService
from utils.drug_engine import DrugInteractionEngine

load_dotenv()

app = Flask(__name__)
CORS(app)

ai_service = AIService()
drug_engine = DrugInteractionEngine()

@app.route('/', methods=['GET'])
def index():
    return jsonify({"status": "AI Avatar Backend is Running! 🚀", "endpoints": ["/api/chat", "/api/report", "/api/config-status", "/api/config"]})

@app.route('/api/config-status', methods=['GET'])
def config_status():
    return jsonify({"configured": ai_service.is_configured})

@app.route('/api/config', methods=['POST'])
def set_config():
    data = request.json
    gemini_key = data.get('gemini_key')
    elevenlabs_key = data.get('elevenlabs_key')
    
    if not gemini_key:
        return jsonify({"success": False, "error": "Gemini API Key is required"}), 400
        
    success = ai_service.set_keys(gemini_key, elevenlabs_key)
    return jsonify({"success": success})

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    image_base64 = data.get('image', None)
    attached_file = data.get('attached_file', None)
    voice_gender = data.get('voice_gender', 'female')
    emotion = data.get('emotion', 'neutral')
    
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

    response = ai_service.get_response(user_message, image_base64, voice_gender, emotion)
    return jsonify(response)

@app.route('/api/report', methods=['GET'])
def get_report():
    report = ai_service.generate_report()
    return jsonify({"report": report})

@app.route('/api/generate_soap', methods=['GET'])
def generate_soap():
    soap_note = ai_service.generate_soap()
    return jsonify({"soap_note": soap_note})

@app.route('/api/check_interaction', methods=['POST'])
def check_interaction():
    data = request.json
    medicine = data.get('medicine', '')
    
    # We can pass the stringified chat history from ai_service
    history_str = "\n".join([f"{msg.type}: {msg.content}" for msg in ai_service.history])
    
    result = drug_engine.check_interaction(history_str, medicine)
    return jsonify(result)

@app.route('/api/upload_dicom', methods=['POST'])
def upload_dicom():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file:
        try:
            dicom_bytes = file.read()
            dataset = pydicom.dcmread(io.BytesIO(dicom_bytes))
            
            # Extract safe metadata
            metadata = {
                "PatientName": str(dataset.get('PatientName', 'Unknown')),
                "PatientID": str(dataset.get('PatientID', 'Unknown')),
                "Modality": str(dataset.get('Modality', 'Unknown')),
                "BodyPartExamined": str(dataset.get('BodyPartExamined', 'Unknown')),
                "StudyDate": str(dataset.get('StudyDate', 'Unknown'))
            }
            return jsonify({"success": True, "metadata": metadata})
        except Exception as e:
            return jsonify({"error": f"Failed to parse DICOM: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
