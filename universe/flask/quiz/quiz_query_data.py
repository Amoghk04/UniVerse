import os
from pymongo import MongoClient
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.prompts import ChatPromptTemplate
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

load_dotenv()

PROMPT_TEMPLATE = """
You are a helpful assistant. Based on the context provided below, generate a multiple-choice question (MCQ) with four options.

Context:
{context}

Question:
Generate an MCQ based on the context above with four options.

Answer:
"""

def get_quiz_questions(query, user, k=10):
    # Prepare embeddings and Chroma database
    CHROMA_PATH = "universe/flask/chroma"+f"_{user}"
    embedding_function = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L12-v2")
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

    # Search for similar contexts
    results = db.similarity_search_with_relevance_scores(query, k=k)
    if not results:
        return "Unable to find matching results."

    # Combine context from search results
    context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])

    # Create the prompt for generating MCQs
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text)

    print("Prompt generated for the query:")
    print(prompt)

    # Call the Hugging Face inference client
    client = InferenceClient(api_key=os.getenv("HUGGINGFACE_API"))

    messages = [
        {
            "role": "user",
            "content": prompt
        }
    ]

    try:
        completion = client.chat.completions.create(
            model="meta-llama/Llama-3.2-3B-Instruct",  
            messages=messages,
            max_tokens=300
        )

        # Extract generated text
        generated_text = completion.choices[0].message["content"].strip()
        
    except Exception as e:
        return f"Error calling the inference API: {e}"

    # Format and print the response
    formatted_response = f"Generated MCQ:\n{generated_text}"
    print(formatted_response)
    return formatted_response
