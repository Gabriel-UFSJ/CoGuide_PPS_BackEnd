import os
import joblib
from llama_parse import LlamaParse
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_community.vectorstores import Chroma

# Configurações de API
llamaparse_api_key = os.getenv('LLAMAPARSE_API_KEY')

# Definindo o diretório base do projeto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def load_or_parse_data(file_paths):
    parsed_data = []
    for file_path in file_paths:
        print(f"Carregando ou analisando os dados de {file_path} ...")
        file_name = os.path.basename(file_path)
        processed_dir = os.path.join(BASE_DIR, 'storage', 'processed')
        os.makedirs(processed_dir, exist_ok=True)
        data_file = os.path.join(processed_dir, f"{file_name}.pkl")

        if os.path.exists(data_file):
            parsed_data.append(joblib.load(data_file))
        else:
            print(f"Arquivo {file_path} não encontrado. Realizando a análise ...")
            parsing_instruction = "resumo do documento"
            parser = LlamaParse(api_key=llamaparse_api_key, result_type="markdown",
                                parsing_instruction=parsing_instruction, max_timeout=5000)
            llama_parse_documents = parser.load_data(os.path.join(BASE_DIR, file_path))

            print(f"Salvando os resultados de {file_path} em formato .pkl ...")
            joblib.dump(llama_parse_documents, data_file)
            parsed_data.append(llama_parse_documents)

        for doc in parsed_data[-1]:
            print(f"Texto extraído do arquivo {file_path}:")
            print(doc.text[:1000])

    return parsed_data

def create_vector_database(file_paths):
    all_parsed_data = load_or_parse_data(file_paths)
    markdown_text = ""
    for parsed_data in all_parsed_data:
        for doc in parsed_data:
            markdown_text += doc.text + '\n'

    if not markdown_text.strip():
        raise ValueError("Nenhum texto foi extraído dos arquivos fornecidos.")

    markdown_path = os.path.join(BASE_DIR, "output.md")
    with open(markdown_path, 'w', encoding='utf-8') as f:
        f.write(markdown_text)

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=100)
    docs = text_splitter.split_text(markdown_text)

    print(f"Total de fragmentos de documentos gerados: {len(docs)}")

    embed_model = FastEmbedEmbeddings(model_name="BAAI/bge-base-en-v1.5")

    persist_dir = os.path.join(BASE_DIR, "storage", "chroma", "chroma_db_llamaparse")
    vs = Chroma.from_texts(
        texts=docs,
        embedding=embed_model,
        persist_directory=persist_dir,
        collection_name="rag"
    )

    print('Banco de dados vetorial criado com sucesso!')
    return vs