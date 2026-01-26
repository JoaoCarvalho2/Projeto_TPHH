import asyncio
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
from .database import engine, Base, SessionLocal
from .routes import ranking
from .routes.ranking import process_player

# --- CORREÇÃO DE INICIALIZAÇÃO ---
# Tenta conectar ao banco 10 vezes antes de desistir
MAX_RETRIES = 10
for i in range(MAX_RETRIES):
    try:
        print(f"🔄 Tentativa de conexão com Banco de Dados ({i+1}/{MAX_RETRIES})...")
        Base.metadata.create_all(bind=engine)
        print("✅ Conectado ao Banco com sucesso!")
        break
    except OperationalError:
        if i == MAX_RETRIES - 1:
            print("❌ Erro crítico: Banco de dados demorou demais para iniciar.")
            raise
        print("⏳ Banco ainda iniciando... aguardando 2 segundos.")
        time.sleep(2)
# ----------------------------------

app = FastAPI(title="LoL Ranking Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ranking.router, prefix="/api")

# --- CONFIGURAÇÃO DOS JOGADORES PADRÃO ---
INITIAL_PLAYERS = [
    {"name": "Larapio", "tag": "Larap"},
    {"name": "sLyyk", "tag": "sLyyk"},
    {"name": "Planutin", "tag": "Vitor"},
    {"name": "Padeira", "tag": "Nagai"},
    {"name": "Sabor Sixty", "tag": "Sabor"},
    {"name": "Didziel", "tag": "luis"},
    {"name": "Naju", "tag": "Anaju"},
    {"name": "u fear cold mind", "tag": "5145"},
    {"name": "Forrest Gump", "tag": "BG62"},
    {"name": "Rammus blindado", "tag": "RMS"}
]

@app.on_event("startup")
async def seed_database():
    print("🌱 Iniciando população do banco de dados...")
    db = SessionLocal()
    try:
        for p in INITIAL_PLAYERS:
            try:
                print(f"Buscando dados de: {p['name']} #{p['tag']}...")
                await process_player(db, p['name'], p['tag'])
                print(f"✅ {p['name']} atualizado!")
            except Exception as e:
                print(f"❌ Falha ao adicionar {p['name']}: {e}")
            await asyncio.sleep(1.5) 
    finally:
        db.close()
    print("✨ Inicialização concluída!")