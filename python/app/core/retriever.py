import os

# Definindo o diretório base do projeto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Configuração da API
groq_cloud_key = os.getenv('GROQ_API_KEY')

def get_context(query, vectorstore):
    # Configura o retriever com o vectorstore
    retriever = vectorstore.as_retriever(search_kwargs={'k': 3})
    print("Retriever configurado com sucesso!")
    print("Iniciando a recuperação de contexto...")
    
    # Realiza a consulta no banco vetorial
    context = retriever.invoke(query)
    return context