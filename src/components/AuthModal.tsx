import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const {
    loginWithEmail,
    registerWithEmail,
    signInWithGoogle,
    resetPassword,
    continueAsGuest,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          setErrorMessage('Por favor, preencha seu e-mail e senha.');
          setIsLoading(false);
          return;
        }
        await loginWithEmail(email, password);
        onClose();
      } else if (mode === 'register') {
        if (!email || !password || !name) {
          setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
          setIsLoading(false);
          return;
        }
        await registerWithEmail(email, password, name, phone);
        onClose();
      } else if (mode === 'forgot') {
        if (!email) {
          setErrorMessage('Por favor, informe seu e-mail.');
          setIsLoading(false);
          return;
        }
        await resetPassword(email);
        setSuccessMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      }
    } catch (err: unknown) {
      console.error('Auth error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setErrorMessage('E-mail ou senha incorretos.');
      } else if (msg.includes('email-already-in-use')) {
        setErrorMessage('Este e-mail já está cadastrado. Faça login ou recupere sua senha.');
      } else if (msg.includes('weak-password')) {
        setErrorMessage('A senha é muito fraca. Utilize pelo menos 6 caracteres.');
      } else if (msg.includes('invalid-email')) {
        setErrorMessage('Formato de e-mail inválido.');
      } else {
        setErrorMessage('Ocorreu um erro ao processar. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: unknown) {
      console.error('Google Sign In error:', err);
      setErrorMessage('Não foi possível entrar com Google. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-[#181818] dark:bg-[#181818] light:bg-white rounded-3xl shadow-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white dark:hover:text-white light:hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 mb-3 text-2xl">
            🍔
          </div>
          <h2 className="text-2xl font-black text-white dark:text-white light:text-zinc-900 tracking-tight">
            Burguer <span className="text-red-500">Power</span>
          </h2>
          <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs mt-1">
            {mode === 'login' && 'Bem-vindo de volta! Entre para fazer seu pedido.'}
            {mode === 'register' && 'Crie sua conta para acompanhar pedidos em tempo real.'}
            {mode === 'forgot' && 'Recuperar acesso da sua conta Burguer Power.'}
          </p>
        </div>

        {/* Mode Tabs */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-2 bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 p-1 rounded-2xl mb-6 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Cadastrar
            </button>
          </div>
        )}

        {/* Google One-Click Login */}
        {mode !== 'forgot' && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:text-white light:text-zinc-900 light:bg-zinc-100 light:hover:bg-zinc-200 py-3 px-4 rounded-2xl border border-zinc-700/80 dark:border-zinc-700/80 light:border-zinc-300 text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continuar com o Google</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-zinc-500">
                <span className="bg-[#181818] dark:bg-[#181818] light:bg-white px-2">Ou com e-mail</span>
              </div>
            </div>
          </div>
        )}

        {/* Error / Success messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-600/15 border border-red-500/40 text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-xs sm:text-sm pl-9 pr-4 py-3 rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 focus:outline-none focus:border-red-500"
                />
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-1">
              E-mail *
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-xs sm:text-sm pl-9 pr-4 py-3 rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 focus:outline-none focus:border-red-500"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
                  Senha *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage('');
                    }}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-xs sm:text-sm pl-9 pr-10 py-3 rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 focus:outline-none focus:border-red-500"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-1">
                WhatsApp com DDD (Opcional)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 11987654321"
                  className="w-full bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-xs sm:text-sm pl-9 pr-4 py-3 rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 focus:outline-none focus:border-red-500"
                />
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3.5 px-4 rounded-2xl shadow-xl shadow-red-600/30 transition-all active:scale-98 disabled:opacity-50 text-xs sm:text-sm mt-2 cursor-pointer"
          >
            {isLoading
              ? 'Processando...'
              : mode === 'login'
              ? 'Entrar na Conta'
              : mode === 'register'
              ? 'Criar Conta Burguer Power'
              : 'Enviar Instruções de Recuperação'}
          </button>
        </form>

        {/* Back to login if in forgot mode */}
        {mode === 'forgot' && (
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className="w-full text-center text-xs text-zinc-400 hover:text-white mt-4"
          >
            Voltar para o Login
          </button>
        )}

        {/* Guest access option */}
        <div className="mt-5 pt-4 border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200 text-center">
          <button
            type="button"
            onClick={handleGuest}
            className="text-xs text-zinc-400 hover:text-white dark:hover:text-white light:hover:text-zinc-900 transition-colors"
          >
            Continuar apenas navegando pelo cardápio &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
