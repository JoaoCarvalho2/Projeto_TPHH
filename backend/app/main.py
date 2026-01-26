import asyncio
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError # Import necessário para o try/except
from .database import engine, Base, SessionLocal
from .routes import ranking
from .routes.ranking import process_player
from .models.player import Player 

# --- 1. CORREÇÃO DE INICIALIZAÇÃO DO BANCO ---
# Tenta conectar ao banco 10 vezes antes de desistir (Race Condition Fix)
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
# ----------------------------------------------

app = FastAPI(title="LoL Ranking Tracker")

# Permite conexões do Vercel/Localhost
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

# --- 2. SISTEMA UNIFICADO DE BACKGROUND ---
async def background_worker():
    """
    Função mestre que roda em segundo plano.
    1. Faz o cadastro inicial (Seed) assim que liga.
    2. Entra em loop infinito para atualizar a cada 30 min.
    """
    print("🚀 Background worker iniciado.")

    # --- FASE 1: SEED (População Inicial) ---
    print("🌱 [Seed] Verificando jogadores iniciais...")
    db_seed = SessionLocal()
    try:
        for p in INITIAL_PLAYERS:
            try:
                print(f"   > [Seed] Processando: {p['name']} #{p['tag']}...")
                await process_player(db_seed, p['name'], p['tag'])
                # Pausa leve para não estourar a API key na inicialização
                await asyncio.sleep(2) 
            except Exception as e:
                print(f"   ❌ [Seed] Falha ao adicionar {p['name']}: {e}")
    finally:
        db_seed.close()
    
    print("✨ [Seed] Finalizado. Entrando em modo de atualização contínua.")

    # --- FASE 2: LOOP INFINITO (Auto-Update) ---
    while True:
        # Espera 30 minutos (1800 segundos)
        print("⏳ [Auto-Update] Aguardando 30 minutos para o próximo ciclo...")
        await asyncio.sleep(900)

        print("🔄 [Auto-Update] Iniciando atualização geral...")
        db = SessionLocal()
        try:
            # Pega TODOS os jogadores do banco (iniciais + adicionados manualmente)
            players = db.query(Player).all()
            
            for p in players:
                try:
                    print(f"   > Atualizando {p.game_name}...")
                    await process_player(db, p.game_name, p.tag_line)
                    await asyncio.sleep(2) # Respeita limite da Riot
                except Exception as e:
                    print(f"   ❌ Erro ao atualizar {p.game_name}: {e}")
            
            print("✅ [Auto-Update] Ciclo concluído com sucesso.")
        except Exception as e:
            print(f"⚠️ [Auto-Update] Erro crítico no ciclo: {e}")
        finally:
            db.close()

# --- 3. GATILHO DE INICIALIZAÇÃO ---
@app.on_event("startup")
async def startup_event():
    # Cria a tarefa em background sem travar o servidor principal
    # Isso permite que o site abra imediatamente enquanto os dados carregam no fundo
    asyncio.create_task(background_worker())