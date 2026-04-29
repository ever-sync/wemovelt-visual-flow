# CLAUDE.md — wemovelt

> Este arquivo é lido automaticamente pelo Claude, Cursor e outros assistentes de IA ao abrir este projeto.
> Mantenha-o atualizado — ele é o "briefing" que a IA recebe antes de qualquer conversa.

---

## 🎯 O que é este projeto

> **Tipo:** frontend
> **Versão:** 1.0.0
> **Descrição:** Preencha com uma descrição clara do que o projeto faz e para quem

---

## ⚡ Stack

```
TypeScript + React + Vite
```

- **Frontend:** React
- **Bundler:** Vite
- **Language:** TypeScript
- **Testing:** Vitest

---

## 📁 Estrutura principal

```
wemovelt/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── services/



├── .env
└── package.json
```

---

## 📐 Convenções do projeto

- TypeScript strict — nunca usar `any` sem justificativa
- Variáveis sensíveis sempre no `.env` — nunca hardcoded

---

## 🔌 Integrações externas

- Nenhuma detectada automaticamente

---

## 🔐 Variáveis de ambiente necessárias

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_VAPID_PUBLIC_KEY`
- `VITE_N8N_CHAT_WEBHOOK_URL`

---

## ✅ Status atual das features

> Atualize conforme o progresso

| Feature | Status | Observação |
|---------|--------|------------|
| Setup inicial | ✅ Pronto | |
| Autenticação | ❓ | |
| CRUD principal | ❓ | |
| Deploy | ❓ | |

---

## ⚠️ O que NÃO fazer neste projeto

- Não commitar arquivos `.env`
- Não criar lógica de negócio dentro das rotas (usar controllers/services)
- Não usar `any` sem comentário explicando o motivo


---

## 🧠 Contexto para a IA

Quando for ajudar neste projeto:
1. Siga as convenções de estrutura de pastas acima
2. Use TypeScript em todo código novo
3. Mantenha consistência com os padrões já existentes
4. Pergunte antes de refatorar arquivos existentes
5. Prefira soluções simples a abstrações desnecessárias

---

## 🔗 Projetos relacionados

- [[EverSync]] — agência responsável pelo projeto
- Adicione links para projetos relacionados aqui

---

*Gerado automaticamente em 2026-04-16 — edite conforme necessário*
