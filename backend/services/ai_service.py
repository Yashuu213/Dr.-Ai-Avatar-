import os
import json
import pickle
import base64
import requests
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
        self.retrieval_chain = None
        self.history = []
        self.is_configured = False
        
        if self.api_key:
            self._configure_model()
            
    def set_keys(self, gemini_key, elevenlabs_key=None):
        self.api_key = gemini_key
        if elevenlabs_key:
            self.elevenlabs_api_key = elevenlabs_key
        self._configure_model()
        return self.is_configured
            
    def _configure_model(self):
        try:
            # 1. Load TFIDF Retriever
            index_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "tfidf_retriever.pkl"))
            if os.path.exists(index_path):
                with open(index_path, 'rb') as f:
                    retriever = pickle.load(f)
            else:
                print(f"Retriever not found at {index_path}. Make sure to run ingest_data.py first.")
                return
            
            # 2. Setup LLM
            self.llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", google_api_key=self.api_key, temperature=0.2)
            llm = self.llm
            
            # 3. Setup Prompt
            system_prompt = (
                "You are Dr. Aegis, an advanced AI Medical Consultant.\n"
                "Your goal is to conduct a professional, empathetic, and structured patient intake.\n\n"
                "MEDICAL GUIDELINES & CLINICAL PROTOCOLS:\n"
                "1. EVIDENCED-BASED: Use the provided context to guide your answers. If the context has specific rules, follow them strictly.\n"
                "2. DIFFERENTIAL DIAGNOSIS: Internally consider multiple potential causes for the symptoms before focusing on the most likely one.\n"
                "3. RED FLAG SCREENING: Always assess for critical red flags (e.g., chest pain, sudden numbness, severe bleeding). If present, immediately direct to emergency care without further questioning.\n"
                "4. ALLERGIES & HISTORY: Before suggesting ANY home remedy or OTC medication, ask if they have allergies or existing medical conditions if not already known.\n"
                "5. PRESCRIPTIONS & REPORTS: If the user uploads a prescription or medical report (via text or image), analyze it carefully. Explain the diagnosis, the prescribed medications, their purpose, dosages, and common side effects in simple terms. Never alter the prescribed dosage.\n"
                "6. NO PRESCRIBING: NEVER prescribe prescription-only medications. You may suggest basic Over-The-Counter (OTC) items (e.g., paracetamol) only if safe based on their history.\n"
                "7. VISION CAPABILITY: You can SEE images from the user's webcam or uploads. Actively analyze and describe what you see (e.g., skin lesions, reports, pill bottles) and incorporate it into your advice.\n\n"
                "INTAKE PROCESS (Focus on Diagnostic Quality, Skip the Fluff):\n"
                "1. Language Matching: You MUST reply in the exact same language the user uses. If the user types in Hinglish or Hindi, you MUST reply in natural Hinglish or Hindi.\n"
                "2. Patient Info (MANDATORY FIRST STEP): In your VERY FIRST message, you MUST ask the user for their Name, Age, and Gender. This is strictly required for their medical report.\n"
                "3. Greeting & Primary Symptom: Along with asking for their details, ask what brings them in today.\n"
                "4. Focused Diagnostic Questions (ONE AT A TIME): Ask up to 4 CRITICAL diagnostic questions, but you MUST ask them ONE BY ONE. Wait for the user's answer before asking the next question.\n"
                "5. Analysis/Advice: Once you have gathered enough diagnostic info, immediately offer a preliminary summary and advice based ON CONTEXT.\n"
                "6. CHAT VS REPORT: In this chat, your responses MUST be EXTREMELY short (1-2 sentences maximum). DO NOT write long paragraphs. Tell the patient that detailed explanations, home care, and medicine side effects will be provided in their final Medical Report.\n"
                "7. SHORT QUESTIONS: When asking diagnostic questions, ask them directly and briefly. Do not over-explain why you are asking.\n"
                "8. BRIEF CONCLUSIONS: Your conclusion or advice in chat MUST be just ONE short sentence. Do NOT list out detailed advice in the chat—save all the detailed analysis for the Report.\n\n"
                "CONTEXT FROM KNOWLEDGE BASE:\n{context}\n\n"
                "Remember: Always include a medical disclaimer if the situation sounds serious."
            )
            self.system_prompt_str = system_prompt
            
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                MessagesPlaceholder(variable_name="chat_history"),
                ("human", "{input}")
            ])
            
            # 4. Create RAG Chain
            question_answer_chain = create_stuff_documents_chain(llm, prompt)
            self.retrieval_chain = create_retrieval_chain(retriever, question_answer_chain)
            self.is_configured = True
            
        except Exception as e:
            print(f"Error configuring RAG: {e}")
            self.is_configured = False

    def get_response(self, user_message, image_base64=None):
        if not self.is_configured or not self.retrieval_chain:
            return {"text": "System Error: Please configure your API Key first.", "audio_text": "System Error"}
            
        try:
            if image_base64:
                content = [{"type": "text", "text": user_message}]
                content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}})
                
                sys_msg = self.system_prompt_str.replace("{context}", "No additional text context available for image analysis.")
                messages = [("system", sys_msg)] + self.history + [HumanMessage(content=content)]
                
                ai_msg = self.llm.invoke(messages)
                answer = ai_msg.content
            else:
                response = self.retrieval_chain.invoke({
                    "input": user_message,
                    "chat_history": self.history
                })
                answer = response["answer"]
            
            # Update memory
            self.history.append(HumanMessage(content=user_message))
            self.history.append(AIMessage(content=answer))
            
            # Generate Audio
            audio_base64 = self._generate_audio_base64(answer)
            
            response_data = {
                "text": answer,
                "audio_text": answer.replace("*", "")
            }
            if audio_base64:
                response_data["audio_base64"] = audio_base64
                
            return response_data
        except Exception as e:
            print(f"Gemini/RAG API Error: {e}")
            return {
                "text": "I apologize, but I am currently experiencing a network error. Please try again in a moment.",
                "audio_text": "I am having trouble connecting. Please wait a moment."
            }

    def _generate_audio_base64(self, text):
        if not self.elevenlabs_api_key:
            return None
            
        try:
            # Voice ID for "Rachel" (calm, professional female) or similar
            voice_id = "21m00Tcm4TlvDq8ikWAM" 
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
            
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.elevenlabs_api_key
            }
            
            data = {
                "text": text.replace("*", ""),
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75
                }
            }
            
            response = requests.post(url, json=data, headers=headers)
            
            if response.status_code == 200:
                audio_bytes = response.content
                return base64.b64encode(audio_bytes).decode('utf-8')
            else:
                print(f"ElevenLabs API Error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"Failed to generate ElevenLabs audio: {e}")
            return None

    def generate_report(self):
        if not self.history:
            return "No consultation history found."
            
        if not self.is_configured or not self.retrieval_chain:
             return "RAG System not initialized. Please configure API keys."
             
        try:
            prompt = (
                "GENERATE PROFESSIONAL MEDICAL REPORT\n"
                "Based on our conversation history, generate a highly structured, professional medical report in beautiful Markdown.\n"
                "Use bold headings and clear bullet points. Follow this strict template exactly:\n\n"
                "# 🏥 AI MEDICAL CONSULTATION REPORT\n\n"
                "## 👤 Patient Demographics\n"
                "- **Name:** [Extract or 'Not Provided']\n"
                "- **Age:** [Extract or 'Not Provided']\n"
                "- **Gender:** [Extract or 'Not Provided']\n\n"
                "## 🩺 Primary Complaint\n"
                "[Detailed summary of symptoms]\n\n"
                "## 🔍 Diagnostic Analysis\n"
                "[Detailed analysis of the condition based on the symptoms provided]\n\n"
                "## ⚠️ Triage & Risk Assessment\n"
                "[Clearly state if it's High, Medium, or Low criticality based on the rules]\n\n"
                "## 📋 Recommended Action Plan\n"
                "[Point-wise recommendations and home-care advice]\n\n"
                "---\n"
                "*Disclaimer: This report was generated by an AI (Dr. Aegis). It does not constitute professional medical advice, diagnosis, or treatment. Please consult a qualified healthcare provider for medical emergencies.*"
            )
            response = self.retrieval_chain.invoke({
                "input": prompt,
                "chat_history": self.history
            })
            return response["answer"]
        except Exception as e:
            return f"Failed to generate report: {e}"
