import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
import json

class DrugInteractionEngine:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            self.llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", google_api_key=self.api_key, temperature=0.1)
        else:
            self.llm = None

    def check_interaction(self, current_chat_history, new_medicine_suggested):
        if not self.llm:
            return {"has_interaction": False, "message": "Engine not configured."}
            
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a Pharmacogenomics & Drug Interaction Engine. "
                       "Review the patient's medical history (allergies, current medications) from the chat history "
                       "and check if the NEW MEDICINE suggested causes any severe adverse drug interactions or allergic reactions. "
                       "Return ONLY a JSON response in this exact format: "
                       "{\"has_interaction\": true, \"message\": \"Warning text\"} or {\"has_interaction\": false, \"message\": \"Safe\"}"),
            ("human", "Chat History:\n{history}\n\nNew Medicine Suggested: {medicine}")
        ])
        
        try:
            chain = prompt | self.llm
            res = chain.invoke({"history": current_chat_history, "medicine": new_medicine_suggested})
            
            output_text = res.content.strip().replace("```json", "").replace("```", "")
            return json.loads(output_text)
        except Exception as e:
            return {"has_interaction": False, "message": f"Error checking interaction: {e}"}
