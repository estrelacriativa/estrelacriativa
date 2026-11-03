import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../context/StoreContext';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const ADMIN_EMAIL_OFICIAL = 'ataiseevangelista@gmail.com';

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const { mostrarNotificacao } = useStore();
  const [email, setEmail] = useState<string>(ADMIN_EMAIL_OFICIAL);
  const [senha, setSenha] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);
  const [mensagemErro, setMensagemErro] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensagemErro('');

    if (email.trim().toLowerCase() !== ADMIN_EMAIL_OFICIAL) {
      setMensagemErro('Acesso restrito: este e-mail não possui privilégios de administradora.');
      return;
    }

    setCarregando(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        if (
          error.message.includes('Invalid login credentials') ||
          error.message.includes('invalid_grant')
        ) {
          setMensagemErro('E-mail ou senha incorretos. Verifique seus dados.');
        } else {
          setMensagemErro(error.message);
        }
        return;
      }

      if (data.session) {
        mostrarNotificacao('🔓 Bem-vinda ao Painel da Estrela Criativa!');
        onLoginSuccess();
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setMensagemErro(
        errObj.message || 'Ocorreu um erro ao conectar com o servidor.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <section className="login-screen">
      <div className="login-card" style={{ maxWidth: '440px' }}>
        <img src="/logo-header.png" alt="Logo Estrela Criativa" />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
          Painel da Prof. Ataíse
        </h2>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            marginBottom: '18px',
          }}
        >
          Gerencie produtos, pedidos, fotos e configurações da{' '}
          <strong>Estrela Criativa</strong>.
        </p>

        {mensagemErro && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              textAlign: 'left',
              lineHeight: '1.4',
            }}
          >
            ⚠️ {mensagemErro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '14px' }}>
            <label htmlFor="emailInput" style={{ fontWeight: 600 }}>
              E-mail do Administrador:
            </label>
            <input
              type="email"
              id="emailInput"
              className="form-control"
              placeholder="seu-email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              disabled={carregando}
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left', marginBottom: '18px' }}>
            <label htmlFor="senhaInput" style={{ fontWeight: 600 }}>
              Senha de Acesso:
            </label>
            <input
              type="password"
              id="senhaInput"
              className="form-control"
              placeholder="Sua senha secreta..."
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              disabled={carregando}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: '4px',
              opacity: carregando ? 0.7 : 1,
              cursor: carregando ? 'wait' : 'pointer',
            }}
            disabled={carregando}
          >
            {carregando
              ? '⏳ Autenticando com segurança...'
              : '🔓 Entrar no Painel Administrativo'}
          </button>
        </form>

        <div
          style={{
            marginTop: '22px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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

          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            🛡️ 256-bit SSL
          </span>
        </div>
      </div>
    </section>
  );
}
