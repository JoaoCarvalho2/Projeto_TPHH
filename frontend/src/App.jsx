import React, { useEffect, useState } from 'react';
import { getRanking, addPlayer } from './services/api';
import { Search, UserPlus, RefreshCw, X, TrendingUp, Activity, Trophy, Crown, Medal } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Tooltip do Gráfico
const CustomTooltip = ({ active, payload, label, tier }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e1b2e] border border-gray-700 p-3 rounded-lg shadow-xl min-w-[150px] z-50">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-[#2de0a5] font-bold text-sm uppercase font-mono">
          {tier} {payload[0].value} LP
        </p>
      </div>
    );
  }
  return null;
};

function App() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [newPlayer, setNewPlayer] = useState({ name: '', tag: '' });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [chartData, setChartData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getRanking();
      setPlayers(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Simulação de Histórico (igual ao anterior)
  useEffect(() => {
    if (selectedPlayer) {
      const history = [];
      const currentLP = selectedPlayer.lp;
      const daysToShow = 7;
      let simLP = currentLP;
      for (let i = 0; i < daysToShow; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (daysToShow - 1 - i));
        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        if (i === daysToShow - 1) {
          history.push({ name: 'Hoje', lp: currentLP });
        } else {
          const randomChange = Math.floor(Math.random() * 30) - 10;
          simLP = Math.max(0, Math.min(100, simLP - randomChange));
          history.push({ name: dateStr, lp: simLP });
        }
      }
      setChartData(history);
    }
  }, [selectedPlayer]);

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayer.name || !newPlayer.tag) return;
    setLoading(true);
    try {
      await addPlayer(newPlayer.name, newPlayer.tag);
      setNewPlayer({ name: '', tag: '' });
      await fetchData();
    } catch (err) { setErrorMsg("Erro ao adicionar."); } 
    finally { setLoading(false); }
  };

  const getRankStyle = (tier) => {
    const styles = {
      CHALLENGER: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]',
      GRANDMASTER: 'bg-red-500/10 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
      MASTER: 'bg-purple-500/10 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
      DIAMOND: 'bg-blue-500/10 text-blue-300 border-blue-500/50',
      EMERALD: 'bg-green-500/10 text-green-300 border-green-500/50',
      PLATINUM: 'bg-teal-500/10 text-teal-300 border-teal-500/50',
      GOLD: 'bg-yellow-600/10 text-yellow-500 border-yellow-600/50',
      SILVER: 'bg-gray-400/10 text-gray-300 border-gray-400/50',
      BRONZE: 'bg-orange-700/10 text-orange-400 border-orange-700/50',
      IRON: 'bg-gray-600/10 text-gray-500 border-gray-600/50',
      UNRANKED: 'bg-gray-800 text-gray-500 border-gray-700'
    };
    return styles[tier] || styles.UNRANKED;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-orange-500 selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="border-b border-gray-800 bg-[#0a0a0c]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="TPHH Logo" className="h-12 w-auto object-contain drop-shadow-lg" />
            <h1 className="text-xl font-bold tracking-wide italic">TPHH<span className="text-orange-500 not-italic">TRACKER</span></h1>
          </div>
          <form onSubmit={handleAddPlayer} className="flex bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/50 transition-all w-full md:w-auto shadow-inner">
            <div className="flex items-center px-3 text-gray-500 border-r border-gray-700"><Search className="w-4 h-4" /></div>
            <input type="text" placeholder="Nome" className="bg-transparent px-3 py-2 outline-none text-sm w-full md:w-40 placeholder-gray-600" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})}/>
            <div className="flex items-center px-2 text-gray-600 bg-gray-800 border-l border-r border-gray-700 text-sm font-mono">#</div>
            <input type="text" placeholder="TAG" className="bg-transparent px-3 py-2 outline-none text-sm w-20 placeholder-gray-600" value={newPlayer.tag} onChange={e => setNewPlayer({...newPlayer, tag: e.target.value})}/>
            <button type="submit" disabled={loading} className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 px-4 py-2 font-medium transition-all shadow-lg shadow-orange-900/20">
              {loading ? <RefreshCw className="animate-spin w-4 h-4"/> : <UserPlus className="w-4 h-4"/>}
            </button>
          </form>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        
        {/* --- TOP 3 DESTAQUES (VISUAL ELOS) --- */}
        {players.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 mt-8 items-end relative">
             
             {/* 2º Lugar - GRANDMASTER STYLE (Red) */}
             {players[1] && (
              <div 
                onClick={() => window.open(`https://www.leagueofgraphs.com/summoner/br/${players[1].game_name}-${players[1].tag_line}`.replace('#', '-'), '_blank')} 
                className="relative bg-gradient-to-b from-[#2a1010] to-[#120a0a] border border-red-900/60 rounded-2xl p-6 flex flex-col items-center order-2 md:order-1 hover:-translate-y-2 transition-transform duration-300 cursor-pointer shadow-[0_0_30px_rgba(220,38,38,0.15)] group"
              >
                {/* Glow Vermelho */}
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(220,38,38,0.2)] pointer-events-none"></div>
                
                <div className="absolute -top-4 bg-red-900 text-red-100 px-3 py-1 rounded border border-red-500 shadow-lg shadow-red-900/50 font-bold text-xs tracking-wider flex items-center gap-1">
                  <span className="text-red-300">#2</span>
                </div>

                <div className="relative mt-4">
                  <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 rounded-full"></div>
                  <img src={`http://ddragon.leagueoflegends.com/cdn/16.1.3/img/profileicon/${players[1].profile_icon_id}.png`} className="w-20 h-20 rounded-full border-[3px] border-red-500 shadow-2xl relative z-10 group-hover:scale-105 transition-transform" />
                </div>
                
                <h3 className="font-bold text-lg mt-4 text-red-100">{players[1].game_name}</h3>
                
                {/* Elo Real */}
                <span className={`px-3 py-0.5 rounded text-[10px] font-bold border mt-2 uppercase tracking-wide ${getRankStyle(players[1].tier)}`}>
                  {players[1].tier} {players[1].rank}
                </span>
                
                <div className="text-center mt-3 w-full border-t border-red-900/30 pt-3">
                  <p className="text-gray-400 text-xs">PDL</p>
                  <p className="text-red-400 font-mono font-bold text-lg">{players[1].lp}</p>
                  <p className="text-green-500/80 text-xs font-bold mt-1">{players[1].win_rate}% WR</p>
                </div>
              </div>
            )}

            {/* 1º Lugar - CHALLENGER STYLE (Gold/Blue) */}
            <div 
              onClick={() => window.open(`https://www.leagueofgraphs.com/summoner/br/${players[0].game_name}-${players[0].tag_line}`.replace('#', '-'), '_blank')} 
              className="relative bg-gradient-to-b from-[#2e2610] to-[#0f0e0b] border-2 border-yellow-500/60 rounded-2xl p-8 flex flex-col items-center order-1 md:order-2 scale-110 z-20 cursor-pointer shadow-[0_0_50px_rgba(234,179,8,0.25)] hover:shadow-[0_0_70px_rgba(234,179,8,0.4)] transition-all duration-300"
            >
               {/* Efeito Hextech/Challenger */}
               <div className="absolute inset-0 rounded-2xl bg-[url('https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblems/challenger.png')] bg-center bg-no-repeat opacity-5 pointer-events-none bg-contain"></div>
               
               <div className="absolute -top-8">
                 <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] filter" />
               </div>

              <div className="relative mt-6">
                <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-30 rounded-full animate-pulse"></div>
                <img src={`http://ddragon.leagueoflegends.com/cdn/16.3.1/img/profileicon/${players[0].profile_icon_id}.png`} className="w-28 h-28 rounded-full border-4 border-yellow-400 shadow-2xl relative z-10" />
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded border border-blue-400 shadow-lg">#1</div>
              </div>

              <h3 className="font-bold text-2xl text-yellow-100 mt-4 drop-shadow-md">{players[0].game_name}</h3>
              <p className="text-yellow-600/80 text-sm font-mono mb-1">#{players[0].tag_line}</p>
              
              {/* Elo Real */}
              <span className={`px-4 py-1 rounded-md text-sm font-bold border uppercase tracking-wider shadow-lg ${getRankStyle(players[0].tier)}`}>
                {players[0].tier} {players[0].rank}
              </span>

              <div className="flex gap-6 mt-6 w-full justify-center border-t border-yellow-900/30 pt-4 relative z-10">
                <div className="text-center">
                  <p className="text-yellow-600/70 text-[10px] uppercase tracking-widest">Win Rate</p>
                  <p className="text-green-400 font-bold text-xl drop-shadow-sm">{players[0].win_rate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-yellow-600/70 text-[10px] uppercase tracking-widest">Vitórias</p>
                  <p className="text-blue-400 font-bold text-xl drop-shadow-sm">{players[0].wins}</p>
                </div>
              </div>
            </div>

            {/* 3º Lugar - MASTER STYLE (Purple) */}
            {players[2] && (
              <div 
                onClick={() => window.open(`https://www.leagueofgraphs.com/summoner/br/${players[2].game_name}-${players[2].tag_line}`.replace('#', '-'), '_blank')} 
                className="relative bg-gradient-to-b from-[#22102a] to-[#100a12] border border-purple-900/60 rounded-2xl p-6 flex flex-col items-center order-3 hover:-translate-y-2 transition-transform duration-300 cursor-pointer shadow-[0_0_30px_rgba(147,51,234,0.15)] group"
              >
                {/* Glow Roxo */}
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(147,51,234,0.2)] pointer-events-none"></div>

                <div className="absolute -top-4 bg-purple-900 text-purple-100 px-3 py-1 rounded border border-purple-500 shadow-lg shadow-purple-900/50 font-bold text-xs tracking-wider flex items-center gap-1">
                  <span className="text-purple-300">#3</span>
                </div>

                <div className="relative mt-4">
                  <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full"></div>
                  <img src={`http://ddragon.leagueoflegends.com/cdn/16.3.1/img/profileicon/${players[2].profile_icon_id}.png`} className="w-20 h-20 rounded-full border-[3px] border-purple-500 shadow-2xl relative z-10 group-hover:scale-105 transition-transform" />
                </div>

                <h3 className="font-bold text-lg mt-4 text-purple-100">{players[2].game_name}</h3>
                
                {/* Elo Real */}
                <span className={`px-3 py-0.5 rounded text-[10px] font-bold border mt-2 uppercase tracking-wide ${getRankStyle(players[2].tier)}`}>
                  {players[2].tier} {players[2].rank}
                </span>
                
                <div className="text-center mt-3 w-full border-t border-purple-900/30 pt-3">
                  <p className="text-gray-400 text-xs">PDL</p>
                  <p className="text-purple-400 font-mono font-bold text-lg">{players[2].lp}</p>
                  <p className="text-green-500/80 text-xs font-bold mt-1">{players[2].win_rate}% WR</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TABELA DE RANKING (Resto normal) --- */}
        <div className="bg-[#0e0e10] rounded-2xl border border-gray-800/60 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-gray-800/60 flex items-center gap-3 bg-[#131316]">
            <Activity className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-gray-200 tracking-wide text-sm uppercase">Classificação Geral</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-[#18181b] text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4 pl-6">#</th>
                <th className="p-4">Invocador</th>
                <th className="p-4">Elo</th>
                <th className="p-4">Melhores Champs</th>
                <th className="p-4 text-center">Evolução</th>
                <th className="p-4 text-center">Win Rate</th>
                <th className="p-4 text-right pr-6">Vitórias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {players.map((p, index) => (
                <tr 
                  key={`${p.game_name}-${p.tag_line}`} 
                  onClick={() => window.open(`https://www.leagueofgraphs.com/summoner/br/${p.game_name}-${p.tag_line}`.replace('#', '-'), '_blank')}
                  className="hover:bg-gray-800/40 transition-colors group cursor-pointer"
                >
                  <td className="p-4 pl-6 text-gray-600 font-mono text-sm group-hover:text-gray-400">{index + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={`http://ddragon.leagueoflegends.com/cdn/16.3.1/img/profileicon/${p.profile_icon_id}.png`} className="w-10 h-10 rounded-full border border-gray-700 group-hover:border-orange-500 transition-colors" />
                        {index < 3 && <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border border-black ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-red-500 text-white' : 'bg-purple-500 text-white'}`}>{index + 1}</div>}
                      </div>
                      <div>
                        <p className="font-bold text-gray-200 group-hover:text-orange-400 transition-colors text-sm">{p.game_name}</p>
                        <p className="text-[10px] text-gray-600">#{p.tag_line}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase ${getRankStyle(p.tier)}`}>{p.tier} {p.rank}</span>
                    <p className="text-xs text-gray-500 mt-1 font-mono">{p.lp} LP</p>
                  </td>
                  <td className="p-4">
                    <div className="flex -space-x-2">
                      {p.top_champions && Array.isArray(p.top_champions) && p.top_champions.map((champId) => (
                        <img key={champId} src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champId}.png`} className="w-8 h-8 rounded-full border-2 border-[#0e0e10] bg-gray-800 hover:scale-110 hover:z-10 transition-all shadow-md" title={`Champ ID: ${champId}`} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-center gap-1 group/btn">
                       <span className="text-green-500/80 font-bold text-[10px] font-mono">+ {p.lp} LP</span>
                       <button onClick={(e) => { e.stopPropagation(); setSelectedPlayer(p); }} className="text-gray-600 group-hover/btn:text-orange-400 transition p-1 hover:bg-gray-800/50 rounded-full">
                         <TrendingUp className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-xs font-bold ${p.win_rate >= 50 ? 'text-green-400' : 'text-red-400'}`}>{p.win_rate}%</span>
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${p.win_rate >= 50 ? 'bg-gradient-to-r from-green-600 to-green-400' : 'bg-gradient-to-r from-red-600 to-red-400'}`} style={{ width: `${p.win_rate}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right pr-6 text-xs text-gray-500">
                    <span className="text-blue-400 font-bold">{p.wins}W</span> <span className="mx-1 opacity-30">/</span> <span className="text-red-400 font-bold">{p.losses}L</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL DO GRÁFICO (Mantido igual) */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#121214] border border-gray-800 p-8 rounded-2xl w-full max-w-4xl shadow-2xl relative">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  {selectedPlayer.game_name}
                  <span className="text-gray-600 text-xl font-normal">#{selectedPlayer.tag_line}</span>
                </h2>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`text-xs px-3 py-1 border rounded uppercase tracking-wide font-bold ${getRankStyle(selectedPlayer.tier)}`}>{selectedPlayer.tier} {selectedPlayer.rank}</span>
                  <span className="text-gray-400 text-sm font-mono">• {selectedPlayer.lp} LP</span>
                </div>
              </div>
              <button onClick={() => setSelectedPlayer(null)} className="p-2 hover:bg-gray-800 rounded-full transition-colors group"><X className="w-6 h-6 text-gray-500 group-hover:text-white" /></button>
            </div>
            <h3 className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-6">Evolução Recente (Simulada)</h3>
            <div className="h-96 w-full bg-[#0a0a0c] rounded-xl p-4 border border-gray-800/50 relative shadow-inner">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#71717a' }} dy={15} />
                  <YAxis stroke="#52525b" domain={[0, 100]} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#71717a' }} />
                  <Tooltip content={<CustomTooltip tier={selectedPlayer.tier} />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="lp" stroke="#f97316" strokeWidth={3} dot={{ fill: '#18181b', stroke: '#f97316', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#fff', stroke: '#f97316', strokeWidth: 0 }} animationDuration={1500} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
