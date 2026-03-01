

# Criar Pagina Publica de Politica de Privacidade

## Objetivo
Criar uma rota publica `/privacidade` acessivel sem login, para ser usada como URL da politica de privacidade na Google Play Store e outros servicos externos.

## O que sera feito

### 1. Criar pagina `src/pages/Privacidade.tsx`
- Pagina publica (sem ProtectedRoute) com o mesmo conteudo do `PrivacyModal.tsx` existente
- Layout responsivo, fundo escuro consistente com o tema do app
- Logo WEMOVELT no topo
- Botao para voltar ao app

### 2. Criar pagina `src/pages/Termos.tsx`
- Mesma abordagem para os Termos de Uso (aproveitando o conteudo do `TermsModal.tsx`)
- Util tambem para a Play Store

### 3. Adicionar rotas no `App.tsx`
- `/privacidade` - rota publica (sem ProtectedRoute)
- `/termos` - rota publica (sem ProtectedRoute)

## URL final
Apos publicacao, a politica de privacidade estara acessivel em:
- `https://wemovelt-visual-flow.lovable.app/privacidade`
- `https://wemovelt-visual-flow.lovable.app/termos`

Essas URLs podem ser usadas diretamente na Google Play Store.

## Detalhes tecnicos
- Reutiliza o conteudo ja escrito nos modais existentes
- Nao requer autenticacao
- Nao requer alteracoes no banco de dados
- Paginas estaticas, sem dependencias externas

