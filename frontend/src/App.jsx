import React, { useEffect, useState } from 'react';
import { getRanking, addPlayer } from './services/api';
import { Search, UserPlus, RefreshCw, X, TrendingUp, Activity } from 'lucide-react';
// Removi o ícone 'Trophy' pois não vamos mais usar na navbar
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// --- COMPONENTES AUXILIARES ---

// Tooltip Personalizado (Caixinha roxa)
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
  
  // Estado para o Modal e Gráfico
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

  // --- GERADOR DE HISTÓRICO DINÂMICO ---
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
      CHALLENGER: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      GRANDMASTER: 'bg-red-500/20 text-red-400 border-red-500/50',
      MASTER: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      DIAMOND: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      EMERALD: 'bg-green-500/20 text-green-300 border-green-500/50',
      PLATINUM: 'bg-teal-500/20 text-teal-300 border-teal-500/50',
      GOLD: 'bg-yellow-600/20 text-yellow-500 border-yellow-600/50',
      SILVER: 'bg-gray-400/20 text-gray-300 border-gray-400/50',
      BRONZE: 'bg-orange-700/20 text-orange-400 border-orange-700/50',
      IRON: 'bg-gray-600/20 text-gray-500 border-gray-600/50',
      UNRANKED: 'bg-gray-800 text-gray-500 border-gray-700'
    };
    return styles[tier] || styles.UNRANKED;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-blue-500 selection:text-white pb-20">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-[#111113]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* --- ALTERAÇÃO AQUI: LOGO NA NAVBAR --- */}
          <div className="flex items-center">
            {/* Usando a imagem salva na pasta public */}
            <img src="/logo.png" alt="Team Play Hard Logo" className="h-16 w-auto object-contain drop-shadow-lg" />
          </div>
          {/* -------------------------------------- */}
          
          <form onSubmit={handleAddPlayer} className="flex bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 transition-all w-full md:w-auto">
            <div className="flex items-center px-3 text-gray-500 border-r border-gray-700"><Search className="w-4 h-4" /></div>
            <input type="text" placeholder="Nome (ex: Faker)" className="bg-transparent px-3 py-2 outline-none text-sm w-full md:w-40" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})}/>
            <div className="flex items-center px-2 text-gray-600 bg-gray-800 border-l border-r border-gray-700 text-sm font-mono">#</div>
            <input type="text" placeholder="TAG" className="bg-transparent px-3 py-2 outline-none text-sm w-20" value={newPlayer.tag} onChange={e => setNewPlayer({...newPlayer, tag: e.target.value})}/>
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 font-medium transition-colors">
              {loading ? <RefreshCw className="animate-spin w-4 h-4"/> : <UserPlus className="w-4 h-4"/>}
            </button>
          </form>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        
        {/* --- TOP 3 DESTAQUES --- */}
        {players.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-4 items-end">
             {/* 2º Lugar */}
             {players[1] && (
              <div onClick={() => window.open(`https://www.leagueofgraphs.com/summoner/br/${players[1].game_name}-${players[1].tag_line}`.replace('#', '-'), '_blank')} className="bg-[#16161a] border border-gray-800 rounded-xl p-6 flex flex-col items-center relative order-2 md:order-1 hover:border-gray-600 transition-all duration-300 cursor-pointer group">
                <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-bold mb-4">#2</span>
                <img src={`http://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${players[1].profile_icon_id}.png`} className="w-20 h-20 rounded-full border-4 border-gray-600 shadow-xl mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg">{players[1].game_name}</h3>
                <span className={`px-3 py-0.5 rounded text-xs font-bold border mt-2 ${getRankStyle(players[1].tier)}`}>{players[1].tier} {players[1].rank}</span>
                <p className="text-gray-400 text-sm mt-1">{players[1].lp} LP</p>
              </div>
            )}

            {/* 1º Lugar */}
            <div onClick={() => window.open(`https://www.leagueofgraphs.com/summoner/br/${players[0].game_name}-${players[0].tag_line}`.replace('#', '-'), '_blank')} className="bg-gradient-to-b from-[#1a1a20] to-[#111113] border border-yellow-500/30 rounded-xl p-8 flex flex-col items-center relative order-1 md:order-2 shadow-2xl shadow-yellow-900/10 scale-105 z-10 cursor-pointer hover:border-yellow-500/60 transition-all">
               {/* Mantive o troféu aqui no card do top 1 pois faz sentido */}
               <div className="absolute -top-6"><Activity className="w-12 h-12 text-yellow-500 drop-shadow-lg animate-pulse" /></div>
              <img src={`http://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${players[0].profile_icon_id}.png`} className="w-24 h-24 rounded-full border-4 border-yellow-500 shadow-yellow-500/20 shadow-xl mb-3 mt-4" />
              <h3 className="font-bold text-2xl text-white">{players[0].game_name}</h3>
              <p className="text-gray-500 text-sm mb-3">#{players[0].tag_line}</p>
              <span className={`px-4 py-1 rounded-md text-sm font-bold border ${getRankStyle(players[0].tier)}`}>{players[0].tier} {players[0].rank}</span>
              
              {/* --- VISUAL DAS WIN RATES (Confirmado que está como antes) --- */}
              <div className="flex gap-4 mt-6 w-full justify-center border-t border-gray-800 pt-4">
                <div className="text-center">
                  <p className="text-gray-500 text-xs uppercase">Win Rate</p>
                  <p className="text-green-400 font-bold">{players[0].win_rate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-xs uppercase">Vitórias</p>
                  <p className="text-blue-400 font-bold">{players[0].wins}</p>
                </div>
              </div>
              {/* --------------------------------------------------------- */}
            </div>

            {/* 3º Lugar */}
            {players[2] && (
              <div onClick={() => window.open(`https://www.leagueofgraphs.com/summoner/br/${players[2].game_name}-${players[2].tag_line}`.replace('#', '-'), '_blank')} className="bg-[#16161a] border border-gray-800 rounded-xl p-6 flex flex-col items-center relative order-3 hover:border-gray-600 transition-all duration-300 cursor-pointer group">
                <span className="bg-orange-900/50 text-orange-400 px-3 py-1 rounded-full text-xs font-bold mb-4">#3</span>
                <img src={`http://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${players[2].profile_icon_id}.png`} className="w-20 h-20 rounded-full border-4 border-orange-700/50 shadow-xl mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg">{players[2].game_name}</h3>
                <span className={`px-3 py-0.5 rounded text-xs font-bold border mt-2 ${getRankStyle(players[2].tier)}`}>{players[2].tier} {players[2].rank}</span>
                <p className="text-gray-400 text-sm mt-1">{players[2].lp} LP</p>
              </div>
            )}
          </div>
        )}

        {/* --- TABELA --- */}
        <div className="bg-[#111113] rounded-xl border border-gray-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold">Ranking Completo</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-[#16161a] text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Invocador</th>
                <th className="p-4">Elo</th>
                <th className="p-4">Melhores Champs</th>
                <th className="p-4 text-center">Evolução</th>
                <th className="p-4 text-right">Vitórias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {players.map((p, index) => (
                <tr key={`${p.game_name}-${p.tag_line}`} onClick={() => window.open(`https://www.leagueofgraphs.com/summoner/br/${p.game_name}-${p.tag_line}`.replace('#', '-'), '_blank')} className="hover:bg-gray-800/50 transition-colors group cursor-pointer">
                  <td className="p-4 text-gray-500 font-mono text-sm">{index + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={`http://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${p.profile_icon_id}.png`} className="w-10 h-10 rounded-full border border-gray-700 group-hover:border-blue-500 transition-colors" />
                      <div>
                        <p className="font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{p.game_name}</p>
                        <p className="text-xs text-gray-600">#{p.tag_line}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getRankStyle(p.tier)}`}>{p.tier} {p.rank}</span>
                    <p className="text-xs text-gray-400 mt-1">{p.lp} LP</p>
                  </td>
                  <td className="p-4">
                    <div className="flex -space-x-2">
                      {p.top_champions && p.top_champions.map((champId) => (
                        <img key={champId} src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champId}.png`} className="w-8 h-8 rounded-full border-2 border-[#111113] bg-gray-800 hover:scale-110 transition-transform z-0 hover:z-10" title={`Champ ID: ${champId}`} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-center gap-1">
                       <span className="text-green-400 font-bold text-xs">+ {p.lp} LP</span>
                       <button onClick={(e) => { e.stopPropagation(); setSelectedPlayer(p); }} className="text-gray-500 hover:text-blue-400 transition p-1 hover:bg-gray-700 rounded">
                         <TrendingUp className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                  <td className="p-4 text-right text-sm text-gray-500"><span className="text-blue-400">{p.wins}W</span> / <span className="text-red-400">{p.losses}L</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* --- MODAL DO GRÁFICO --- */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#13111c] border border-gray-700 p-8 rounded-2xl w-full max-w-3xl shadow-2xl relative">
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  {selectedPlayer.game_name}
                  <span className="text-gray-500 text-lg font-normal">#{selectedPlayer.tag_line}</span>
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 border rounded ${getRankStyle(selectedPlayer.tier)}`}>{selectedPlayer.tier} {selectedPlayer.rank}</span>
                  <span className="text-gray-400 text-sm">• {selectedPlayer.lp}LP</span>
                </div>
              </div>
              <button onClick={() => setSelectedPlayer(null)} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
            </div>

            <h3 className="text-gray-300 font-semibold mb-4">Evolução de Elo (Simulada)</h3>
            
            <div className="h-80 w-full bg-[#181621] rounded-xl p-4 border border-gray-800 relative">
              <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
                  <div className="w-full border-t border-dashed border-gray-400 mt-20"></div>
                  <div className="w-full border-t border-dashed border-gray-400 mt-48"></div>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2b3b" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                  <YAxis stroke="#6b7280" domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip tier={selectedPlayer.tier} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="lp" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#34d399', r: 5, strokeWidth: 0 }} activeDot={{ r: 8, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }} animationDuration={1000} />
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