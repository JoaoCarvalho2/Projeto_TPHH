from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.sql import func
from ..database import Base

# TEM QUE SER "class Player" (com P maiúsculo)
class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    puuid = Column(String, unique=True, index=True)
    game_name = Column(String)
    tag_line = Column(String)
    tier = Column(String, default="UNRANKED")
    rank = Column(String, default="")
    lp = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    win_rate = Column(Float, default=0.0)
    profile_icon_id = Column(Integer, default=0)
    sort_score = Column(Float, default=0.0)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), default=func.now())
    top_champions = Column(JSON, default=[])
    initial_lp = Column(Integer, default=0)