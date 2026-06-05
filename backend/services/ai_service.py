import os
import json
import pickle
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.retrieval_chain = None
        self.history = []
        
        if self.api_key:
            self._configure_model()
            
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
                "MEDICAL GUIDELINES:\n"
                "1. Use the provided context to guide your answers. If the context has specific rules, follow them strictly.\n"
                "2. For minor/basic issues (like mouth ulcers, mild cold, headache), use your general medical knowledge to provide helpful home-care advice or ask diagnostic questions.\n"
                "3. ONLY advise them to seek immediate professional medical help if the symptoms are SEVERE (e.g., chest pain, breathing difficulty, severe bleeding, sudden numbness) or if they ask for prescription medication.\n"
                "4. NEVER invent false medical facts or prescribe actual medicine.\n"
                "5. VISION CAPABILITY: You can now SEE images from the user's webcam. If they show you an image, actively analyze and describe what you see (e.g., injuries, symptoms, reports) and incorporate it into your advice.\n"
                "6. UPLOADED REPORTS: If the user provides text from an uploaded medical report, read it carefully, extract the key findings, explain them in simple terms, and use them to inform your diagnosis and conclusions.\n\n"
                "INTAKE PROCESS (Focus on Diagnostic Quality, Skip the Fluff):\n"
                "1. Language Matching: You MUST reply in the exact same language the user uses. If the user types in Hinglish (Hindi in English letters) or Hindi, you MUST reply in natural Hinglish or Hindi.\n"
                "2. Patient Info (MANDATORY FIRST STEP): In your VERY FIRST message, you MUST ask the user for their Name, Age, and Gender. This is strictly required for their medical report.\n"
                "3. Greeting & Primary Symptom: Along with asking for their details, ask what brings them in today.\n"
                "4. Focused Diagnostic Questions (ONE AT A TIME): Ask up to 4 CRITICAL diagnostic questions, but you MUST ask them ONE BY ONE. Wait for the user's answer before asking the next question.\n"
                "5. Analysis/Advice: Once you have gathered enough diagnostic info, immediately offer a preliminary summary and advice based ON CONTEXT.\n\n"
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
            
        except Exception as e:
            print(f"Error configuring RAG: {e}")

    def get_response(self, user_message, image_base64=None):
        if not self.retrieval_chain:
            return {"text": "System Error: RAG system not initialized. Check your API key or FAISS index.", "audio_text": "System Error"}
            
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
            
            return {
                "text": answer,
                "audio_text": answer.replace("*", "")
            }
        except Exception as e:
            print(f"Gemini/RAG API Error: {e}")
            return {
                "text": "I apologize, but I am currently experiencing a network error. Please try again in a moment.",
                "audio_text": "I am having trouble connecting. Please wait a moment."
            }

    def generate_report(self):
        if not self.history:
            return "No consultation history found."
            
        if not self.retrieval_chain:
             return "RAG System not initialized."
             
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
