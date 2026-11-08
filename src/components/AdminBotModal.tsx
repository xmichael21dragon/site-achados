import React, { useState } from 'react';
import { 
  X, 
  Bot, 
  Cloud, 
  Database, 
  Tag, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  Server, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Key
} from 'lucide-react';
import { AffiliateSettings, SupabaseConfig, Deal } from '../types';
import { 
  getStoredAffiliateSettings, 
  saveAffiliateSettings 
} from '../lib/affiliate';
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection 
} from '../lib/supabase';
import { addDeal } from '../services/dealService';

interface AdminBotModalProps {
  onClose: () => void;
  onDealAdded: (deal: Deal) => void;
}

export const AdminBotModal: React.FC<AdminBotModalProps> = ({
  onClose,
  onDealAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'oracle' | 'affiliate' | 'supabase' | 'api'>('oracle');

  // Affiliate settings
  const [affiliateSettings, setAffiliateSettings] = useState<AffiliateSettings>(getStoredAffiliateSettings());
  const [affiliateSaved, setAffiliateSaved] = useState(false);

  // Supabase settings
  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [supabaseStatus, setSupabaseStatus] = useState<{ testing: boolean; message: string; success?: boolean }>({
    testing: false,
    message: '',
  });

  // Copied flags
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedService, setCopiedService] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSimulatingBot, setIsSimulatingBot] = useState(false);
  const [botMessage, setBotMessage] = useState('');

  const handleSaveAffiliate = (e: React.FormEvent) => {
    e.preventDefault();
    saveAffiliateSettings(affiliateSettings);
    setAffiliateSaved(true);
    setTimeout(() => setAffiliateSaved(false), 2500);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig({
      url: supabaseConfig.url,
      anonKey: supabaseConfig.anonKey,
    });
    setSupabaseStatus({
      testing: false,
      message: 'Configurações do Supabase salvas com sucesso!',
      success: true,
    });
  };

  const handleTestSupabase = async () => {
    setSupabaseStatus({ testing: true, message: 'Testando conexão com o Supabase...' });
    const result = await testSupabaseConnection(supabaseConfig.url, supabaseConfig.anonKey);
    setSupabaseStatus({
      testing: false,
      message: result.message,
      success: result.success,
    });
  };

  const handleSimulateBotCycle = async () => {
    setIsSimulatingBot(true);
    setBotMessage('Robô buscando ofertas na Amazon e Mercado Livre...');

    setTimeout(async () => {
      const randomDeals = [
        {
          title: 'Echo Dot 5ª Geração com Alexa e Relógio Digital – Som Imersivo e Graves Potentes',
          orig: 429.00,
          promo: 269.00,
          store: 'Amazon' as const,
          url: 'https://www.amazon.com.br/dp/B09B8W5FW7',
          img: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop&q=80',
          cat: 'Informática',
          coupon: 'ALEXA20'
        },
        {
          title: 'Robô Aspirador de Pó Xiaomi Robot Vacuum E10 Bivolt com Mop Inteligente',
          orig: 1699.00,
          promo: 989.90,
          store: 'Mercado Livre' as const,
          url: 'https://www.mercadolivre.com.br/p/MLB294829',
          img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
          cat: 'Casa e Cozinha',
          coupon: 'XIAOMI50'
        }
      ];

      const chosen = randomDeals[Math.floor(Math.random() * randomDeals.length)];
      const discount = Math.round(((chosen.orig - chosen.promo) / chosen.orig) * 100);

      const newDeal = await addDeal({
        title: chosen.title,
        description: 'Achadinho minerado automaticamente pelo robô da Oracle Cloud.',
        imageUrl: chosen.img,
        store: chosen.store,
        originalPrice: chosen.orig,
        promoPrice: chosen.promo,
        discountPercentage: discount,
        paymentConditions: 'em até 6x sem juros ou desconto no Pix',
        couponCode: chosen.coupon,
        affiliateUrl: chosen.url,
        rawUrl: chosen.url,
        category: chosen.cat,
        isExpired: false,
        isHot: true,
        freeShipping: true,
        source: 'oracle-cloud',
      });

      setIsSimulatingBot(false);
      setBotMessage(`✅ Sucesso! O robô minerou e postou: "${newDeal.title.substring(0, 40)}..."`);
      onDealAdded(newDeal);
    }, 1200);
  };

  const copyText = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                Central do Robô Oracle Cloud & Supabase
              </h2>
              <p className="text-xs text-slate-300">
                Gerencie a automação 24/7, suas tags de afiliado e o banco de dados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="p-2 bg-slate-100 border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('oracle')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'oracle' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-4 h-4 text-purple-600" />
            Robô Oracle Cloud (Instalação 24/7)
          </button>

          <button
            onClick={() => setActiveTab('affiliate')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'affiliate' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-4 h-4 text-emerald-600" />
            Tags de Afiliados (Amazon, Shopee, etc.)
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'supabase' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-blue-600" />
            Banco Supabase (SQL & Conexão)
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'api' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            Simulador & Webhook API
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 max-h-[72vh] overflow-y-auto text-xs">
          {/* TAB 1: ORACLE CLOUD INSTRUCTIONS & CODE */}
          {activeTab === 'oracle' && (
            <div className="space-y-5">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <h3 className="font-bold text-sm text-purple-900 mb-1 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-700" />
                  Como Rodar o Robô 24/7 na Oracle Cloud (Grátis para sempre)
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  A Oracle Cloud oferece instâncias Always Free (Ubuntu Linux). Você pode deixar o script Python rodando
                  em segundo plano com o serviço <code>systemd</code>. Ele minera ofertas continuamente e publica no seu Supabase.
                </p>
              </div>

              {/* Commands step by step */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Passo 1: No Terminal da sua VM Ubuntu na Oracle Cloud:
                </h4>
                <div className="bg-slate-900 text-slate-200 p-3.5 rounded-lg font-mono text-[11px] leading-relaxed relative group">
                  <p className="text-purple-300"># 1. Instalar Python e pacotes</p>
                  <p>sudo apt update && sudo apt install -y python3 python3-pip</p>
                  <p>mkdir -p ~/achadinhos_bot && cd ~/achadinhos_bot</p>
                  <p>pip3 install requests python-dotenv schedule</p>
                </div>

                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pt-2">
                  Passo 2: Baixar ou Copiar o Script do Robô (oracle_cloud_bot.py):
                </h4>
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <span className="font-bold text-slate-900 block">oracle_cloud_bot.py</span>
                    <span className="text-slate-500 text-[11px]">Script autônomo com injeção de tags de afiliado e envio Supabase</span>
                  </div>
                  <button
                    onClick={() => {
                      fetch('/bot/oracle_cloud_bot.py')
                        .then(r => r.text())
                        .then(code => copyText(code, setCopiedScript))
                        .catch(() => copyText('# Veja o arquivo /bot/oracle_cloud_bot.py no projeto', setCopiedScript));
                    }}
                    className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedScript ? 'Copiado!' : 'Copiar Código Python'}
                  </button>
                </div>

                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pt-2">
                  Passo 3: Ativar o Serviço para Rodar Infinitamente (Systemd):
                </h4>
                <div className="bg-slate-900 text-slate-200 p-3.5 rounded-lg font-mono text-[11px] leading-relaxed">
                  <p className="text-purple-300"># Ativar inicialização automática mesmo após reiniciar</p>
                  <p>sudo cp achadinhos_bot.service /etc/systemd/system/</p>
                  <p>sudo systemctl daemon-reload</p>
                  <p>sudo systemctl enable achadinhos_bot</p>
                  <p>sudo systemctl start achadinhos_bot</p>
                  <p className="text-emerald-400 mt-1"># Ver logs em tempo real: journalctl -u achadinhos_bot -f</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AFFILIATE SETTINGS */}
          {activeTab === 'affiliate' && (
            <form onSubmit={handleSaveAffiliate} className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                Configure suas credenciais de afiliado. Todas as ofertas postadas no site ou pelo robô terão os links
                convertidos automaticamente com as suas tags.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Tag Amazon Associates:
                  </label>
                  <input
                    type="text"
                    value={affiliateSettings.amazonTag}
                    onChange={(e) => setAffiliateSettings({ ...affiliateSettings, amazonTag: e.target.value })}
                    placeholder="Ex: seutag-20"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Parâmetro: ?tag=seutag-20</span>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    ID Afiliado Shopee:
                  </label>
                  <input
                    type="text"
                    value={affiliateSettings.shopeeAffiliateId}
                    onChange={(e) => setAffiliateSettings({ ...affiliateSettings, shopeeAffiliateId: e.target.value })}
                    placeholder="Ex: achadinhos_shopee"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Parâmetro: ?aff_source=...</span>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Tracker Mercado Livre:
                  </label>
                  <input
                    type="text"
                    value={affiliateSettings.mercadoLivreTracker}
                    onChange={(e) => setAffiliateSettings({ ...affiliateSettings, mercadoLivreTracker: e.target.value })}
                    placeholder="Ex: achadinhos_ml"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Parâmetro: ?matt_tool=...</span>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Parceiro Magalu (Magazine Você):
                  </label>
                  <input
                    type="text"
                    value={affiliateSettings.magaluParceiro}
                    onChange={(e) => setAffiliateSettings({ ...affiliateSettings, magaluParceiro: e.target.value })}
                    placeholder="Ex: achadinhosdaterra"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Parâmetro: ?parceiro=...</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Origem UTM Padrão (UTM Source):
                </label>
                <input
                  type="text"
                  value={affiliateSettings.customUtmSource}
                  onChange={(e) => setAffiliateSettings({ ...affiliateSettings, customUtmSource: e.target.value })}
                  placeholder="achadinhos_da_terra"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Salvar Tags de Afiliado
                </button>

                {affiliateSaved && (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    Tags salvas com sucesso!
                  </span>
                )}
              </div>
            </form>
          )}

          {/* TAB 3: SUPABASE DATABASE */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed">
                O banco de dados <strong>Supabase (PostgreSQL)</strong> permite que o site hospedado na <strong>Vercel</strong>
                receba as ofertas postadas pelo seu <strong>robô na Oracle Cloud</strong> em tempo real, sem limites!
              </div>

              <form onSubmit={handleSaveSupabase} className="space-y-3.5">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Supabase Project URL:
                  </label>
                  <input
                    type="url"
                    value={supabaseConfig.url}
                    onChange={(e) => setSupabaseConfigState({ ...supabaseConfig, url: e.target.value })}
                    placeholder="https://xyzabcdefg.supabase.co"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 focus:bg-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Supabase Anon Public Key:
                  </label>
                  <input
                    type="text"
                    value={supabaseConfig.anonKey}
                    onChange={(e) => setSupabaseConfigState({ ...supabaseConfig, anonKey: e.target.value })}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 focus:bg-white font-mono text-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Salvar Credenciais
                  </button>

                  <button
                    type="button"
                    onClick={handleTestSupabase}
                    disabled={supabaseStatus.testing || !supabaseConfig.url}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Testar Conexão com Supabase
                  </button>
                </div>

                {supabaseStatus.message && (
                  <div className={`p-3 rounded-lg text-xs font-semibold ${
                    supabaseStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {supabaseStatus.message}
                  </div>
                )}
              </form>

              {/* SQL Script Button */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Script SQL do Banco de Dados</span>
                  <span className="text-slate-500 text-[11px]">Cria as tabelas `deals`, `coupons`, `comments`, `bot_logs` e permissões</span>
                </div>
                <button
                  onClick={() => {
                    fetch('/supabase_schema.sql')
                      .then(r => r.text())
                      .then(sql => copyText(sql, setCopiedSql))
                      .catch(() => copyText('-- Ver arquivo /supabase_schema.sql no workspace', setCopiedSql));
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'SQL Copiado!' : 'Copiar Script SQL'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: API & SIMULATOR */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 block text-xs">
                  Simulação Imediata do Robô da Nuvem:
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Teste o ciclo do robô agora mesmo sem precisar ligar o servidor. O robô vai minerar uma oferta, injetar suas tags e postar no feed.
                </p>

                <button
                  onClick={handleSimulateBotCycle}
                  disabled={isSimulatingBot}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Play className={`w-3.5 h-3.5 ${isSimulatingBot ? 'animate-spin' : ''}`} />
                  {isSimulatingBot ? 'Minerando Oferta...' : 'Executar 1 Ciclo do Robô Agora'}
                </button>

                {botMessage && (
                  <p className="text-xs font-semibold text-purple-900 mt-1">
                    {botMessage}
                  </p>
                )}
              </div>

              <div className="pt-2 space-y-2">
                <span className="font-bold text-slate-800 block uppercase tracking-wider text-[11px]">
                  API Webhook Endpoint para o Robô da Nuvem:
                </span>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] select-all">
                  <p className="text-purple-400">POST https://seu-app.vercel.app/api/deals</p>
                  <p className="text-slate-400">Headers: &#123; "x-api-key": "achadinhos-secret-key-2026" &#125;</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
