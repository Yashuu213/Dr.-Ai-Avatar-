import os
import glob
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader, PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# Ensure environment variables are loaded
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

KB_DIR = os.path.join(os.path.dirname(__file__), "..", "knowledge_base")
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "chroma_db")

def ingest_data():
    print(f"Scanning directory: {KB_DIR}")
    documents = []
    
    # Load TXT files
    for file in glob.glob(os.path.join(KB_DIR, "*.txt")):
        print(f"Loading text file: {file}")
        loader = TextLoader(file, encoding="utf-8")
        documents.extend(loader.load())
        
    # Load PDF files
    for file in glob.glob(os.path.join(KB_DIR, "*.pdf")):
        print(f"Loading PDF file: {file}")
        loader = PyMuPDFLoader(file)
        documents.extend(loader.load())
        
    if not documents:
        print(f"No documents found in {KB_DIR}")
        return

    print(f"Loaded {len(documents)} document sections.")
    
    # Split text into manageable chunks for semantic search
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Split into {len(chunks)} chunks for vector embedding.")
    
    # Create Embeddings using local HuggingFace model
    print("Initializing HuggingFace Embeddings...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    print("Creating and persisting Chroma Vector Database...")
    db = Chroma.from_documents(
        chunks, 
        embeddings, 
        persist_directory=CHROMA_PATH
    )
    
    print(f"Successfully ingested {len(chunks)} chunks into ChromaDB at {CHROMA_PATH}")

if __name__ == "__main__":
    ingest_data()
