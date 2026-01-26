import httpx
import os
from fastapi import HTTPException

RIOT_API_KEY = os.getenv("RIOT_API_KEY")
REGION_ACCOUNT = "americas"
REGION_LEAGUE = "br1"

TIER_VALUES = {
    "CHALLENGER": 9000, "GRANDMASTER": 8000, "MASTER": 7000,
    "DIAMOND": 6000, "EMERALD": 5000, "PLATINUM": 4000,
    "GOLD": 3000, "SILVER": 2000, "BRONZE": 1000, "IRON": 0, "UNRANKED": -1000
}
RANK_VALUES = {"I": 300, "II": 200, "III": 100, "IV": 0}

async def request_riot(url: str):
    headers = {"X-Riot-Token": RIOT_API_KEY}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        
        # Logs de erro detalhados
        if resp.status_code == 403:
            print(f"⛔ ERRO 403: Chave inválida ou expirada para {url}")
            raise HTTPException(status_code=403, detail="API Key expirada.")
        if resp.status_code == 404:
            print(f"⚠️ ERRO 404: Dado não encontrado em {url}")
            # Retorna None para tratarmos no código sem quebrar tudo
            return None
        if resp.status_code != 200:
            print(f"🔥 ERRO RIOT {resp.status_code}: {resp.text}")
            raise HTTPException(status_code=resp.status_code, detail="Erro Riot API")
            
        return resp.json()

async def get_riot_account(game_name: str, tag_line: str):
    url = f"https://{REGION_ACCOUNT}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
    return await request_riot(url)

async def get_summoner_data(puuid: str):
    # Tenta pegar ícone e level
    url = f"https://{REGION_LEAGUE}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}"
    data = await request_riot(url)
    if data:
        # Debug: Mostrar chaves recebidas para entender o erro 'id'
        print(f"🔎 Dados Summoner recebidos: {list(data.keys())}")
    return data

async def get_league_entries_by_puuid(puuid: str):
    # ATENÇÃO: Usando endpoint by-puuid que é mais seguro segundo sua lista
    url = f"https://{REGION_LEAGUE}.api.riotgames.com/lol/league/v4/entries/by-puuid/{puuid}"
    data = await request_riot(url)
    if not data:
        return None
        
    # Filtra apenas Solo/Duo
    solo_q = next((item for item in data if item["queueType"] == "RANKED_SOLO_5x5"), None)
    return solo_q

def calculate_score(tier, rank, lp):
    base = TIER_VALUES.get(tier, 0)
    sub = RANK_VALUES.get(rank, 0)
    return base + sub + lp

async def get_top_champions(puuid: str):
    # Pega os top 3 campeões por maestria
    url = f"https://{REGION_LEAGUE}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top?count=3"
    data = await request_riot(url)
    if not data:
        return []
    # Retorna apenas os IDs dos campeões (ex: [266, 103, 81])
    return [c['championId'] for c in data]