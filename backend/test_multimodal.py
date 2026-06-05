import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage

api_key = os.getenv("GEMINI_API_KEY")
llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", google_api_key=api_key)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an AI assistant. Answer the user."),
    MessagesPlaceholder(variable_name="human_input")
])

chain = prompt | llm

response = chain.invoke({
    "human_input": [HumanMessage(content=[{"type": "text", "text": "What is 1+1?"}])]
})
print(response.content)
