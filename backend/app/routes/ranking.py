from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.player import Player
from ..schemas.player import PlayerCreate, PlayerResponse
from ..services.riot_api import (
    get_riot_account, 
    get_summoner_data, 
    get_league_entries_by_puuid,
    calculate_score,
    get_top_champions
)

router = APIRouter()

async def process_player(db: Session, game_name: str, tag_line: str):
    # 1. Buscar Conta (PUUID)
    acc_data = await get_riot_account(game_name, tag_line)
    if not acc_data:
        raise HTTPException(status_code=404, detail="Conta Riot não encontrada")
        
    puuid = acc_data['puuid']
    real_name = acc_data['gameName']
    real_tag = acc_data['tagLine']

    # 2. Buscar Dados de Invocador (Opcional, só para ícone)
    # Se falhar, usamos um ícone padrão (29 = minion básico)
    summ_data = await get_summoner_data(puuid)
    profile_icon = 29
    if summ_data and 'profileIconId' in summ_data:
        profile_icon = summ_data['profileIconId']
    else:
        print(f"⚠️ Aviso: Ícone não encontrado para {real_name}, usando padrão.")

    # 3. Buscar Elo (Usando PUUID direto)
    league_data = await get_league_entries_by_puuid(puuid)

    # 4. Buscar Top Campeões
    top_champs = await get_top_champions(puuid)
    # Dados padrão
    tier, rank, lp, wins, losses = "UNRANKED", "", 0, 0, 0
    
    if league_data:
        tier = league_data.get('tier', "UNRANKED")
        rank = league_data.get('rank', "")
        lp = league_data.get('leaguePoints', 0)
        wins = league_data.get('wins', 0)
        losses = league_data.get('losses', 0)

    total = wins + losses
    win_rate = (wins / total * 100) if total > 0 else 0.0
    score = calculate_score(tier, rank, lp)

    # 4. Salvar/Atualizar no Banco
    db_player = db.query(Player).filter(Player.puuid == puuid).first()
    if not db_player:
        db_player = Player(puuid=puuid)
    
    db_player.game_name = real_name
    db_player.top_champions = top_champs
    db_player.tag_line = real_tag
    db_player.tier = tier
    db_player.rank = rank
    db_player.lp = lp
    if db_player.initial_lp == 0 and lp > 0:
        db_player.initial_lp = lp
    db_player.wins = wins
    db_player.losses = losses
    db_player.win_rate = round(win_rate, 1)
    db_player.profile_icon_id = profile_icon
    db_player.sort_score = score

    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

@router.post("/players", response_model=PlayerResponse)
async def add_player_endpoint(player_in: PlayerCreate, db: Session = Depends(get_db)):
    try:
        return await process_player(db, player_in.game_name, player_in.tag_line)
    except Exception as e:
        # Repassa o erro para o frontend ver
        print(f"Erro no endpoint: {e}")
        raise e

@router.get("/ranking", response_model=list[PlayerResponse])
def get_ranking(db: Session = Depends(get_db)):
    return db.query(Player).order_by(Player.sort_score.desc()).all()