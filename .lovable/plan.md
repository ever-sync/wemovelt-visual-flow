
# Plano: Academias do Admin para Usuários + Remover Fundo Laranja

## Resumo

Duas alterações:
1. Remover o fundo laranja/vermelho da tela do Super Admin e deixar o fundo escuro padrão
2. Garantir que as academias cadastradas pelo admin apareçam para os usuários na seção de localizações

---

## Mudança 1: Remover Fundo Laranja do Admin

**Arquivo:** `src/pages/Admin.tsx`

Alterar a linha 12:
- De: `wemovelt-gradient` (gradiente laranja/vermelho)
- Para: `bg-background` (fundo escuro padrão do app)

```typescript
// Antes
<div className="min-h-screen wemovelt-gradient">

// Depois  
<div className="min-h-screen bg-background">
```

---

## Mudança 2: Mostrar Academias do Banco para Usuários

**Arquivo:** `src/components/GymLocationsSection.tsx`

O componente atual usa dados estáticos (hardcoded). Vamos atualizar para:
- Importar o hook `useGyms` que busca academias do banco
- Renderizar as academias cadastradas pelo admin
- Exibir informações como nome, endereço e ícone GPS

Estrutura atualizada:

```typescript
import { useGyms } from "@/hooks/useGyms";

const GymLocationsSection = () => {
  const { gyms, isLoading } = useGyms();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Renderiza as academias do banco
  {gyms.map((gym) => (
    <button key={gym.id} onClick={() => setSelectedLocation(gym.id)}>
      <MapPin />
      <h4>{gym.name}</h4>
      <p>{gym.address}</p>
    </button>
  ))}
};
```

---

## Resultado Visual Esperado

| Antes | Depois |
|-------|--------|
| Admin com fundo laranja | Admin com fundo escuro |
| Academias fixas (Zona Sul, Zona Leste) | Academias do banco de dados (WEMOVELT Centro, Zona Leste, etc) |

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Admin.tsx` | Trocar `wemovelt-gradient` por `bg-background` |
| `src/components/GymLocationsSection.tsx` | Usar hook `useGyms` em vez de dados estáticos |
