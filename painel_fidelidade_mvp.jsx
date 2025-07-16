// pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

// pages/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      router.push('/painel');
    } else {
      alert('Login inválido');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-xl mb-4">Login Restaurante</h1>
      <input placeholder="Email" className="mb-2 border p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Senha" type="password" className="mb-2 border p-2" value={senha} onChange={(e) => setSenha(e.target.value)} />
      <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">Entrar</button>
    </div>
  );
}

// pages/painel.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Painel() {
  const router = useRouter();
  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    fetch('/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setDados(data))
      .catch(() => router.push('/login'));
  }, []);

  if (!dados) return <p>Carregando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Painel do Restaurante</h1>
      <p>Carimbos no mês: {dados.carimbos}</p>
      <p>Prêmios resgatados: {dados.resgates}</p>
      <p>Clientes únicos: {dados.clientes}</p>
      <div className="mt-4">
        <h2 className="text-lg">QR Code do restaurante:</h2>
        <img src={dados.qrcode_url} alt="QR Code" className="w-40 h-40 mt-2" />
      </div>
    </div>
  );
}

// pages/api/login.ts
export default async function handler(req, res) {
  const { email, senha } = req.body;
  const validUser = email === 'restaurante@teste.com' && senha === '1234';
  if (validUser) {
    res.json({ token: 'fake-jwt-token' });
  } else {
    res.status(401).json({ erro: 'Credenciais inválidas' });
  }
}

// pages/api/dashboard.ts
export default function handler(req, res) {
  const auth = req.headers.authorization;
  if (auth !== 'Bearer fake-jwt-token') {
    return res.status(401).json({ erro: 'Não autorizado' });
  }
  res.json({
    carimbos: 42,
    resgates: 8,
    clientes: 27,
    qrcode_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://app.com/carimbar?id=rest123'
  });
}

// tailwind.config.js
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
