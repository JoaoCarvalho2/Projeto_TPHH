from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PlayerCreate(BaseModel):
    game_name: str
    tag_line: str

class PlayerResponse(BaseModel):
    game_name: str
    tag_line: str
    tier: str
    rank: str
    lp: int
    wins: int
    losses: int
    win_rate: float
    profile_icon_id: int
    top_champions: Optional[List[int]] = []
    initial_lp: int = 0
    
    class Config:
        from_attributes = True