import { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatarWhatsappExibicao } from '../../utils/formatters';

export default function AdminSettings() {
  const {
    config,
    salvarConfigLoja,
    exportarDadosLojaJs,
    exportarBackupJson,
    importarBackupJson,
    restaurarProdutosPadrao,
    mostrarNotificacao,
  } = useStore();

  const [whatsapp, setWhatsapp] = useState(config.whatsapp || '5561983069120');
  const [whatsappExibicao, setWhatsappExibicao] = useState(
    config.whatsappExibicao || '(61) 9 8306-9120'
  );
  const [instagram, setInstagram] = useState(config.instagram || 'estrelacriativa__');
  const [descontoPix, setDescontoPix] = useState(config.descontoPix ?? 5);
  const [avisoTopo, setAvisoTopo] = useState(
    config.avisoTopo || '⭐ Estrela Criativa • Prof. Ataíse'
  );
  const [senhaAdmin, setSenhaAdmin] = useState(config.senhaAdmin || 'estrela2026');

  const inputImportRef = useRef(null);

  useEffect(() => {
    setWhatsapp(config.whatsapp || '5561983069120');
    setWhatsappExibicao(config.whatsappExibicao || '(61) 9 8306-9120');
    setInstagram(config.instagram || 'estrelacriativa__');
    setDescontoPix(config.descontoPix ?? 5);
    setAvisoTopo(config.avisoTopo || '⭐ Estrela Criativa • Prof. Ataíse');
    setSenhaAdmin(config.senhaAdmin || 'estrela2026');
  }, [config]);

  const handleWhatsappChange = (valor) => {
    setWhatsapp(valor);
    setWhatsappExibicao(formatarWhatsappExibicao(valor));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    salvarConfigLoja({
      whatsapp,
      whatsappExibicao,
      instagram,
      descontoPix,
      avisoTopo,
      senhaAdmin,
    });
  };

  const handleRestaurarCatalogo = () => {
    if (
      window.confirm(
        'Deseja restaurar os 12 produtos originais de fábrica? Isso substituirá os produtos editados.'
      )
    ) {
      restaurarProdutosPadrao();
    }
  };

  const handleImportarArquivo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        importarBackupJson(json);
      } catch {
        mostrarNotificacao('❌ Erro ao ler o arquivo JSON de backup.');
      }
      if (inputImportRef.current) inputImportRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="admin-panel-card">
      <div className="panel-title">
        <span>⚙️ Configurações da Loja, WhatsApp &amp; Backup</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="cfgWhatsapp">
              WhatsApp para Receber Pedidos (com DDI 55 + DDD):
            </label>
            <input
              type="text"
              id="cfgWhatsapp"
              className="form-control"
              value={whatsapp}
              onChange={(e) => handleWhatsappChange(e.target.value)}
              placeholder="Ex: 5561983069120"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cfgWhatsappExibicao">
              Telefone Exibido no Site:
            </label>
            <input
              type="text"
              id="cfgWhatsappExibicao"
              className="form-control"
              value={whatsappExibicao}
              onChange={(e) => setWhatsappExibicao(e.target.value)}
              placeholder="Ex: (61) 9 8306-9120"
            />
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="cfgInstagram">Instagram da Loja (sem @):</label>
            <input
              type="text"
              id="cfgInstagram"
              className="form-control"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="Ex: estrelacriativa__"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cfgDescontoPix">
              Desconto para Pagamento via PIX (%):
            </label>
            <input
              type="number"
              id="cfgDescontoPix"
              className="form-control"
              value={descontoPix}
              min="0"
              max="50"
              onChange={(e) => setDescontoPix(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="cfgAvisoTopo">Frase de Destaque na Barra do Topo:</label>
            <input
              type="text"
              id="cfgAvisoTopo"
              className="form-control"
              value={avisoTopo}
              onChange={(e) => setAvisoTopo(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cfgSenhaAdmin">Senha de Acesso ao Admin:</label>
            <input
              type="text"
              id="cfgSenhaAdmin"
              className="form-control"
              value={senhaAdmin}
              onChange={(e) => setSenhaAdmin(e.target.value)}
              placeholder="Padrão: estrela2026"
            />
          </div>
        </div>

        <div className="settings-actions-row">
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.88rem' }}
          >
            💾 Salvar Configurações da Loja
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{
              padding: '10px 18px',
              fontSize: '0.85rem',
              background: 'var(--lilac-light)',
              borderColor: 'var(--lilac-primary)',
              color: 'var(--lilac-dark)',
            }}
            onClick={exportarDadosLojaJs}
          >
            🌐 Exportar dados-loja.js para Publicação
          </button>

          <button
            type="button"
            className="btn-outline-muted"
            onClick={exportarBackupJson}
          >
            📥 Baixar Backup (.json)
          </button>

          <label
            htmlFor="importBackupInput"
            className="btn-outline-muted"
            style={{ cursor: 'pointer', display: 'inline-block' }}
          >
            📤 Importar Backup (.json)
          </label>
          <input
            ref={inputImportRef}
            id="importBackupInput"
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleImportarArquivo}
          />

          <button
            type="button"
            className="btn-outline-muted"
            onClick={handleRestaurarCatalogo}
          >
            🔄 Restaurar 12 Produtos Originais
          </button>
        </div>
      </form>
    </div>
  );
}

