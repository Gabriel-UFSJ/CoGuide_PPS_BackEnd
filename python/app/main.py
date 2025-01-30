from fastapi import FastAPI, HTTPException, Depends
from app.api import endpoints
import sys
import os

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings

# Adicionando o diretório pai ao path do sistema
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI()

# Definir o diretório base corretamente (três níveis acima do arquivo atual)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Inicialize uma variável global para o vectorstore
vectorstore = None

@app.on_event("startup")
async def load_vector_database():
    global vectorstore  #variável global

    # Inicializar o modelo de embeddings
    embed_model = FastEmbedEmbeddings(model_name="BAAI/bge-base-en-v1.5")

    # Caminho de persistência do banco de dados vetorial
    persist_dir = os.path.join(BASE_DIR, "storage", "chroma", "chroma_db_llamaparse")

    # Carregar o banco de dados vetorial Chroma
    vectorstore = Chroma(
        embedding_function=embed_model,
        persist_directory=persist_dir,
        collection_name="rag"
    )

    print("Banco de dados vetorial carregado com sucesso!")

# Função de dependência para injetar o vectorstore nas rotas
def get_vectorstore():
    if vectorstore is None:
        raise HTTPException(status_code=500, detail="Vectorstore não carregado.")
    return vectorstore

# Registrando as rotas da API
app.include_router(endpoints.router)

@app.get("/")
def read_root():
    return {"message": "API para processamento de PDFs e geração de banco vetorial."}
