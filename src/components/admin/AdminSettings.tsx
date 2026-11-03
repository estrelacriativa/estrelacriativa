import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type ChangeEvent,
} from 'react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../context/StoreContext';
import { formatarWhatsappExibicao } from '../../utils/formatters';
import type { StoreBackupData } from '../../types/store';

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

  const [whatsapp, setWhatsapp] = useState<string>(
    config.whatsapp || '5561983069120'
  );
  const [whatsappExibicao, setWhatsappExibicao] = useState<string>(
    config.whatsappExibicao || '(61) 9 8306-9120'
  );
  const [instagram, setInstagram] = useState<string>(
    config.instagram || 'estrelacriativa__'
  );
  const [descontoPix, setDescontoPix] = useState<number>(
    config.descontoPix ?? 5
  );
  const [avisoTopo, setAvisoTopo] = useState<string>(
    config.avisoTopo || '⭐ Estrela Criativa • Prof. Ataíse'
  );

  // Estados para alteração segura de senha via Supabase Auth
  const [novaSenha, setNovaSenha] = useState<string>('');
  const [confirmarSenha, setConfirmarSenha] = useState<string>('');
  const [alterandoSenha, setAlterandoSenha] = useState<boolean>(false);

  const inputImportRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWhatsapp(config.whatsapp || '5561983069120');
    setWhatsappExibicao(config.whatsappExibicao || '(61) 9 8306-9120');
    setInstagram(config.instagram || 'estrelacriativa__');
    setDescontoPix(config.descontoPix ?? 5);
    setAvisoTopo(config.avisoTopo || '⭐ Estrela Criativa • Prof. Ataíse');
  }, [config]);

  const handleWhatsappChange = (valor: string) => {
    setWhatsapp(valor);
    setWhatsappExibicao(formatarWhatsappExibicao(valor));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    salvarConfigLoja({
      whatsapp,
      whatsappExibicao,
      instagram,
      descontoPix: Number(descontoPix),
      avisoTopo,
    });
  };

  const handleAlterarSenhaAdmin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!novaSenha) {
      mostrarNotificacao('⚠️ Digite a nova senha desejada.');
      return;
    }
    if (novaSenha.length < 6) {
      mostrarNotificacao('⚠️ A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      mostrarNotificacao('❌ As senhas digitadas não coincidem.');
      return;
    }

    setAlterandoSenha(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (error) {
        mostrarNotificacao(`❌ Erro ao atualizar senha: ${error.message}`);
      } else {
        mostrarNotificacao('🔐 Senha de administrador atualizada com sucesso no Supabase!');
        setNovaSenha('');
        setConfirmarSenha('');
      }
    } catch {
      mostrarNotificacao('❌ Falha ao comunicar com o Supabase Auth.');
    } finally {
      setAlterandoSenha(false);
    }
  };

  const handleRestaurarCatalogo = () => {
    if (
      window.confirm(
        'Deseja restaurar os 8 produtos oficiais da Estrela Criativa? Isso substituirá alterações nos produtos atuais.'
      )
    ) {
      restaurarProdutosPadrao();
    }
  };

  const handleImportarArquivo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const result = ev.target?.result;
        if (typeof result === 'string') {
          const json = JSON.parse(result) as StoreBackupData;
          importarBackupJson(json);
        }
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
              min={0}
              max={50}
              onChange={(e) => setDescontoPix(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="cfgAvisoTopo">
            Frase de Destaque na Barra do Topo:
          </label>
          <input
            type="text"
            id="cfgAvisoTopo"
            className="form-control"
            value={avisoTopo}
            onChange={(e) => setAvisoTopo(e.target.value)}
          />
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
            🔄 Restaurar Catálogo Oficial (8 Produtos)
          </button>
        </div>
      </form>

      {/* SEÇÃO BLINDADA: ALTERAÇÃO DE SENHA SUPABASE AUTH */}
      <div
        style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '2px dashed var(--border-color)',
        }}
      >
        <div className="panel-title" style={{ marginBottom: '12px' }}>
          <span>🔐 Segurança &amp; Senha de Administrador (Supabase Auth)</span>
        </div>
        <p
          style={{
            fontSize: '0.86rem',
            color: 'var(--text-muted)',
            marginBottom: '16px',
            lineHeight: '1.45',
          }}
        >
          Sua senha de acesso é gerenciada pelo <strong>Supabase Auth</strong> com
          criptografia de ponta a ponta (bcrypt). Ela nunca fica exposta em texto plano
          e é totalmente protegida contra invasões.
        </p>

        <form onSubmit={handleAlterarSenhaAdmin}>
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="cfgNovaSenha">Nova Senha de Administrador:</label>
              <input
                type="password"
                id="cfgNovaSenha"
                className="form-control"
                placeholder="Mínimo de 6 caracteres..."
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cfgConfirmarSenha">Confirmar Nova Senha:</label>
              <input
                type="password"
                id="cfgConfirmarSenha"
                className="form-control"
                placeholder="Repita a nova senha..."
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: '10px' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: '9px 20px',
                fontSize: '0.86rem',
                opacity: alterandoSenha ? 0.7 : 1,
              }}
              disabled={alterandoSenha}
            >
              {alterandoSenha
                ? '⏳ Atualizando no Supabase...'
                : '🔑 Atualizar Senha Criptografada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
