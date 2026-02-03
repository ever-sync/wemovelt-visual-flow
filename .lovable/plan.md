
# Fase 4: Check-in Real - Completar Migracao para Banco de Dados

## Resumo

A Fase 4 esta parcialmente implementada. O frontend de QR Scanner e Geolocalizacao ja funciona, mas os check-ins estao sendo salvos em **localStorage** em vez do banco de dados. Esta fase completa a migracao para persistencia real.

---

## Estado Atual

| Componente | Status | Problema |
|------------|--------|----------|
| QR Scanner UI | OK | Funcionando |
| Geolocalizacao UI | OK | Funcionando |
| Tabela `check_ins` no banco | OK | Criada com RLS |
| Tabela `gyms` no banco | OK | Populada com 5 academias |
| Hook `useCheckIn` | Parcial | Usa localStorage, nao banco |
| Validacao de academia | Problema | Usa arquivo estatico `src/data/gyms.ts` |
| Validacao de QR | Problema | Usa IDs do arquivo estatico |

---

## O Que Precisa Ser Feito

### 1. Criar Hook para Academias do Banco

Arquivo: `src/hooks/useGyms.ts`

Funcionalidades:
- Carregar academias do banco de dados (tabela `gyms`)
- Buscar academia por ID
- Encontrar academia mais proxima por coordenadas

```text
useGyms()
  |
  +-> gyms: Gym[] (do banco)
  +-> getGymById(id: string): Gym | undefined
  +-> getNearestGym(lat, lng): { gym, distance }
  +-> isLoading: boolean
```

### 2. Atualizar geoValidation.ts

Remover dependencia do arquivo estatico e aceitar lista de academias como parametro:

```text
ANTES:
import { GYMS } from "@/data/gyms"
validateGeoLocation(position) // usa GYMS estatico

DEPOIS:
validateGeoLocation(position, gyms) // recebe academias do banco
```

### 3. Atualizar qrValidation.ts

Criar funcao assincrona que valida QR Code contra o banco:

```text
ANTES:
validateQRCode(data) // síncrono, usa arquivo estatico

DEPOIS:
validateQRCodeAsync(data, gyms, equipment) // recebe dados do banco
```

Formato do QR Code atualizado para usar UUIDs:
```
wemovelt://gym/{uuid}/equipment/{uuid}
```

### 4. Refatorar Hook useCheckIn

Migrar de localStorage para Supabase:

```text
useCheckIn()
  |
  +-> checkIns: CheckIn[] (do banco)
  +-> registerCheckIn(method, gymId, equipmentId, lat?, lng?)
  |     |
  |     +-> INSERT no banco de dados
  |     +-> Vincula ao user_id autenticado
  |
  +-> streak, weeklyPercentage (calculados do banco)
  +-> isLoading, error
```

### 5. Atualizar useGeolocation

Modificar para usar academias do banco em vez de arquivo estatico:

```text
ANTES:
const result = validateGeoLocation(geoPos); // usa GYMS estatico

DEPOIS:
const { gyms } = useGyms();
const result = validateGeoLocation(geoPos, gyms); // usa banco
```

### 6. Atualizar CheckInModal

Integrar com os hooks refatorados:
- Usar `useGyms` para validacao
- Passar dados corretos para `registerCheckIn`
- Salvar coordenadas (lat/lng) quando usar geolocalizacao

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/useGyms.ts` | Hook para carregar academias do banco |

---

## Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/hooks/useCheckIn.ts` | Migrar de localStorage para Supabase |
| `src/hooks/useGeolocation.ts` | Usar academias do banco |
| `src/utils/geoValidation.ts` | Aceitar lista de academias como parametro |
| `src/utils/qrValidation.ts` | Aceitar dados do banco como parametro |
| `src/components/modals/CheckInModal.tsx` | Integrar com novos hooks |

---

## Detalhes Tecnicos

### Novo Hook useGyms

```typescript
// Carregar academias do banco com coordenadas
const useGyms = () => {
  return useQuery({
    queryKey: ['gyms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select('id, name, address, lat, lng, radius, image_url');
      if (error) throw error;
      return data;
    }
  });
};
```

### Novo registerCheckIn com Supabase

```typescript
const registerCheckIn = async (
  method: "qr" | "geo",
  gymId: string,
  equipmentId?: string,
  lat?: number,
  lng?: number
) => {
  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      user_id: user.id, // do contexto de auth
      gym_id: gymId,
      equipment_id: equipmentId,
      method,
      lat,
      lng
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### Calculo de Streak do Banco

```sql
-- Exemplo de query para calcular streak
SELECT DISTINCT DATE(created_at) as check_date
FROM check_ins
WHERE user_id = $1
ORDER BY check_date DESC
```

---

## Fluxo Atualizado

```text
Usuario abre CheckInModal
         |
    [Escolhe metodo]
         |
   +-----+-----+
   |           |
   v           v
QR Scan    Geolocalizacao
   |           |
   v           v
Valida QR   Busca academias
(banco)     (banco)
   |           |
   v           v
Encontra    Calcula distancia
gym + equip   da mais proxima
   |           |
   +-----+-----+
         |
         v
   INSERT check_ins
   (com user_id)
         |
         v
   Atualiza streak
   (query do banco)
         |
         v
   Exibe sucesso
```

---

## Consideracoes de Seguranca

1. **RLS ja configurado**: A tabela `check_ins` ja tem politicas que garantem que usuarios so veem/inserem seus proprios check-ins

2. **Autenticacao obrigatoria**: O hook `useCheckIn` deve verificar se ha usuario logado antes de registrar

3. **Validacao server-side**: O QR Code e validado localmente, mas a insercao no banco garante integridade referencial

---

## Resultado Esperado

Apos implementacao:

1. Check-ins persistem no banco de dados (nao mais localStorage)
2. Dados sincronizam entre dispositivos do mesmo usuario
3. Streak e percentual semanal calculados do banco
4. Validacao de QR/Geo usa academias reais do banco
5. Historico completo de check-ins disponivel para estatisticas futuras

