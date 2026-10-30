import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

export default function AdminLogin({ onLoginSuccess }) {
  const { config, mostrarNotificacao } = useStore();
  const [senha, setSenha] = useState('');

  const senhaCorreta = config.senhaAdmin || 'estrela2026';
  const usandoSenhaPadrao = senhaCorreta === 'estrela2026';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (senha.trim() === senhaCorreta) {
      sessionStorage.setItem('estrelaAdminLogado', 'sim');
      onLoginSuccess();
      mostrarNotificacao('🔓 Bem-vinda ao Painel Administrativo!');
    } else {
      mostrarNotificacao(
        usandoSenhaPadrao
          ? '❌ Senha incorreta! Use a senha padrão: estrela2026'
          : '❌ Senha incorreta! Tente novamente.'
      );
    }
  };

  return (
    <section className="login-screen">
      <div className="login-card">
        <img src="/logo-header.png" alt="Logo Estrela Criativa" />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
          Painel da Prof. Ataíse
        </h2>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            marginBottom: '20px',
          }}
        >
          Gerencie produtos, categorias, fotos e preços da{' '}
          <strong>Estrela Criativa</strong>.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label htmlFor="senhaInput">Digite a Senha de Acesso:</label>
            <input
              type="password"
              id="senhaInput"
              className="form-control"
              placeholder="Digite sua senha..."
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoFocus
            />
            {usandoSenhaPadrao && (
              <small
                style={{
                  display: 'block',
                  marginTop: '6px',
                  color: 'var(--lilac-dark)',
                  fontWeight: 700,
                }}
              >
                💡 Senha padrão inicial: <code>estrela2026</code>
              </small>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
          >
            🔓 Entrar no Painel Administrativo
          </button>
        </form>

        <div
          style={{
            marginTop: '18px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <Link
            to="/"
            style={{
              fontSize: '0.88rem',
              fontWeight: 800,
              color: 'var(--rose-primary)',
            }}
          >
            ← Voltar para a Loja Online
          </Link>
        </div>
      </div>
    </section>
  );
}

