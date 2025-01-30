# app/api/endpoints.py

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.retriever import get_context
from app.core.llama_utils import create_vector_database
import os

router = APIRouter()

# Caminhos relativos dos arquivos PDF
file_paths = [
    os.path.join('storage', 'raw', 'Leiautes_do_eSocial_v._S-1.2_-_Anexo_I_-_Tabelas_(cons._até_NT_02.2024_rev.).pdf'),
    os.path.join('storage', 'raw', 'Leiautes_do_eSocial_v._S-1.2_(cons._até_NT_02.2024_rev.).pdf'),
    os.path.join('storage', 'raw', 'Leiautes_do_eSocial_v._S-1.2_(cons._até_NT_04.2024).pdf'),
    os.path.join('storage', 'raw', 'Leiautes_do_eSocial_v._S-1.2_-_Anexo_II_-_Regras_(cons._até_NT_02.2024_rev.).pdf'),
    os.path.join('storage', 'raw', 'Leiautes_do_eSocial_v._S-1.2_-_Anexo_I_-_Tabelas_(cons._até_NT_02.2024_rev.).pdf'),
    os.path.join('storage', 'raw', 'Leiautes_do_eSocial_v._S-1.2_-_Anexo_I_-_Tabelas_(cons._até_NT_04.2024).pdf'),
    os.path.join('storage', 'raw', 'Leiautes_do_eSocial_v._S-1.3.pdf'),
    os.path.join('storage', 'raw', 'Leiautes_do_eSocial_v._S-1.3_-_Anexo_II_-_Regras.pdf'),
    os.path.join('storage', 'raw', 'Leiautes_do_eSocial_v._S-1.3_-_Anexo_II_-_Tabelas.pdf')
]

class QueryRequest(BaseModel):
    query: str

@router.post("/create_vector_db/")
def create_vector_db():
    try:
        create_vector_database(file_paths)
        return {"message": "Banco de dados vetorial criado com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/get_context/")
async def ask_question(query_request: QueryRequest):
    from app.main import get_vectorstore
    query = query_request.query
    try:
        vectorstore = get_vectorstore()
        # Agora passamos o vectorstore para a função get_context
        context = get_context(query, vectorstore)
        return {"context": context}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
