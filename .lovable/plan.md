
# Fase 7: Habitos e Metas

## Resumo

Esta fase transforma o sistema de habitos e metas de dados estaticos para uma solucao completa baseada em banco de dados, incluindo:
- Rastreamento diario de habitos com check/uncheck
- Sistema de metas semanais persistentes
- Graficos de progresso usando Recharts
- Calendario de atividades
- Estatisticas e historico

---

## Estado Atual

| Componente | Status | Problema |
|------------|--------|----------|
| Habitos.tsx | Estatico | Categorias hardcoded, sem rastreamento |
| HabitModal.tsx | UI apenas | Exibe dicas, nao permite marcar como feito |
| GoalModal.tsx | UI apenas | Nao salva meta no banco |
| Frequencia.tsx | Parcial | Metas hardcoded, estatisticas falsas |
| Graficos | Nao existe | Nenhum grafico de progresso implementado |

---

## 1. Novas Tabelas no Banco de Dados

### 1.1 Tabela: user_goals (Metas do Usuario)

```sql
CREATE TABLE public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'workout', 'hydration', 'sleep', 'nutrition', 'wellness'
  target INTEGER NOT NULL, -- valor alvo (ex: 4 treinos, 2000ml agua)
  unit TEXT NOT NULL, -- 'times_per_week', 'ml_per_day', 'hours_per_day'
  title TEXT NOT NULL, -- 'Treinar 4x/semana'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
ON public.user_goals FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
ON public.user_goals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
ON public.user_goals FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
ON public.user_goals FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### 1.2 Tabela: habit_logs (Registro Diario de Habitos)

```sql
CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_type TEXT NOT NULL, -- 'hydration', 'sleep', 'nutrition', 'wellness'
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  value INTEGER, -- valor numerico (ml de agua, horas de sono, etc)
  completed BOOLEAN DEFAULT false, -- marcado como concluido
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, habit_type, date) -- Um registro por habito por dia
);

-- RLS policies
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habit logs"
ON public.habit_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit logs"
ON public.habit_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habit logs"
ON public.habit_logs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit logs"
ON public.habit_logs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

---

## 2. Novos Hooks

### 2.1 Hook: useGoals

Arquivo: `src/hooks/useGoals.ts`

Funcionalidades:
- Carregar metas ativas do usuario
- Criar nova meta
- Atualizar meta
- Deletar/desativar meta
- Calcular progresso da meta (baseado em check_ins para treino)

```text
useGoals()
  |
  +-> goals: Goal[] (metas ativas)
  +-> isLoading, error
  +-> createGoal(type, target, unit, title)
  +-> updateGoal(id, updates)
  +-> deleteGoal(id)
  +-> getGoalProgress(goalId): { current, target, percentage }
```

### 2.2 Hook: useHabits

Arquivo: `src/hooks/useHabits.ts`

Funcionalidades:
- Carregar registros de habitos do periodo
- Marcar/desmarcar habito do dia
- Calcular streak por habito
- Estatisticas semanais/mensais

```text
useHabits()
  |
  +-> todayLogs: HabitLog[] (habitos de hoje)
  +-> weeklyStats: { type, completedDays, streak }[]
  +-> toggleHabit(habitType, date?)
  +-> updateHabitValue(habitType, value, date?)
  +-> getHabitHistory(habitType, startDate, endDate)
```

---

## 3. Componentes a Criar

### 3.1 HabitTracker.tsx

Componente para rastrear habitos diarios com checkboxes:

```text
+------------------------+
| HABITOS DE HOJE        |
+------------------------+
| [x] Hidratacao   2L    |
| [ ] Sono         -     |
| [x] Alimentacao  OK    |
| [ ] Bem-estar    -     |
+------------------------+
```

### 3.2 ProgressChart.tsx

Componente de grafico usando Recharts:

```text
+------------------------+
|  Progresso Semanal     |
|                        |
|  ██       ██   ██      |
|  ██  ██   ██   ██  ██  |
|  Seg Ter  Qua  Qui Sex |
+------------------------+
```

### 3.3 HabitDetailModal.tsx

Modal detalhado para um habito especifico:

```text
+------------------------+
|     Hidratacao         |
+------------------------+
|  Meta: 2000ml/dia      |
|  Hoje: 1500ml  [+250ml]|
+------------------------+
|  HISTORICO (7 dias)    |
|  ████████████░░░ 75%   |
+------------------------+
|  [Grafico semanal]     |
+------------------------+
```

### 3.4 GoalProgressCard.tsx

Card que mostra progresso de uma meta:

```text
+------------------------+
| Treinar 4x/semana      |
| ████████░░░░ 3/4 (75%) |
| Faltam 1 dia           |
+------------------------+
```

### 3.5 WeeklyOverviewChart.tsx

Grafico geral da semana com todos os habitos:

```text
+------------------------+
|  Visao Semanal         |
|                        |
|  [Area Chart empilhado]|
|  - Treinos (laranja)   |
|  - Hidratacao (azul)   |
|  - Sono (roxo)         |
+------------------------+
```

---

## 4. Refatorar Componentes Existentes

### 4.1 Habitos.tsx

Mudancas:
- Adicionar HabitTracker para marcar habitos do dia
- Exibir streak e progresso por categoria
- Adicionar grafico semanal de progresso
- Integrar com hooks useHabits

Nova estrutura:
```text
+------------------------+
|  HABITOS SAUDAVEIS     |
+------------------------+
|  HOJE                  |
|  [HabitTracker]        |
+------------------------+
|  CATEGORIAS            |
|  [Cards clicaveis]     |
+------------------------+
|  PROGRESSO SEMANAL     |
|  [ProgressChart]       |
+------------------------+
```

### 4.2 HabitModal.tsx

Mudancas:
- Adicionar botao para marcar habito como concluido
- Exibir historico dos ultimos 7 dias
- Mostrar streak atual do habito
- Permitir adicionar valor (ml, horas)

### 4.3 GoalModal.tsx

Mudancas:
- Salvar meta no banco de dados
- Adicionar mais tipos de meta (agua, sono, etc)
- Permitir definir valor customizado
- Exibir metas existentes

### 4.4 Frequencia.tsx

Mudancas:
- Carregar metas reais do banco
- Calcular progresso baseado em dados reais
- Adicionar graficos de progresso
- Exibir historico mensal

---

## 5. Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/useGoals.ts` | CRUD de metas do usuario |
| `src/hooks/useHabits.ts` | Rastreamento de habitos diarios |
| `src/components/HabitTracker.tsx` | Checkboxes de habitos do dia |
| `src/components/ProgressChart.tsx` | Grafico de barras/area |
| `src/components/GoalProgressCard.tsx` | Card de progresso de meta |
| `src/components/modals/HabitDetailModal.tsx` | Detalhes e historico do habito |

---

## 6. Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/pages/Habitos.tsx` | Integrar HabitTracker, graficos |
| `src/pages/Frequencia.tsx` | Metas reais, graficos, historico |
| `src/pages/Home.tsx` | Resumo de habitos do dia |
| `src/components/modals/HabitModal.tsx` | Adicionar acao de completar |
| `src/components/modals/GoalModal.tsx` | Salvar no banco |

---

## 7. Detalhes Tecnicos

### Query para progresso de meta de treino

```typescript
// Conta check-ins da semana atual para meta de treino
const getWeeklyWorkoutProgress = async (userId: string) => {
  const startOfWeek = getStartOfWeek(new Date());
  
  const { count } = await supabase
    .from('check_ins')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfWeek.toISOString());
  
  return count || 0;
};
```

### Estrutura do Grafico com Recharts

```typescript
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const ProgressChart = ({ data }: { data: ChartData[] }) => (
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={data}>
      <XAxis dataKey="day" tick={{ fill: '#888' }} />
      <YAxis hide />
      <Bar 
        dataKey="value" 
        fill="url(#gradient)" 
        radius={[4, 4, 0, 0]} 
      />
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E97A3A" />
          <stop offset="100%" stopColor="#D45D24" />
        </linearGradient>
      </defs>
    </BarChart>
  </ResponsiveContainer>
);
```

### Toggle de habito com upsert

```typescript
const toggleHabit = async (habitType: string) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Verificar se ja existe registro hoje
  const { data: existing } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('habit_type', habitType)
    .eq('date', today)
    .single();

  if (existing) {
    // Toggle o estado
    await supabase
      .from('habit_logs')
      .update({ completed: !existing.completed })
      .eq('id', existing.id);
  } else {
    // Criar novo registro marcado como completo
    await supabase
      .from('habit_logs')
      .insert({
        user_id: user.id,
        habit_type: habitType,
        date: today,
        completed: true
      });
  }
};
```

### Calculo de streak

```typescript
const calculateStreak = (logs: HabitLog[]): number => {
  if (logs.length === 0) return 0;
  
  const sortedDates = [...new Set(
    logs
      .filter(l => l.completed)
      .map(l => l.date)
  )].sort().reverse();
  
  if (sortedDates.length === 0) return 0;
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
  
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }
  
  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = differenceInDays(
      parseISO(sortedDates[i-1]), 
      parseISO(sortedDates[i])
    );
    if (diff === 1) streak++;
    else break;
  }
  
  return streak;
};
```

---

## 8. Fluxo de Rastreamento de Habito

```text
Usuario abre Habitos.tsx
         |
         v
+------------------+
| Carregar logs    | --> SELECT habit_logs WHERE date = today
| do dia           |
+------------------+
         |
         v
+------------------+
| Exibir           | --> HabitTracker com checkboxes
| HabitTracker     |
+------------------+
         |
    [Usuario clica checkbox]
         |
         v
+------------------+
| toggleHabit()    | --> UPSERT habit_logs
+------------------+
         |
         v
+------------------+
| Atualizar UI     | --> Recalcular streak, progresso
| Feedback visual  |
+------------------+
```

---

## 9. Fluxo de Criacao de Meta

```text
Usuario abre GoalModal
         |
         v
+------------------+
| Seleciona tipo   | --> 'workout', 'hydration', etc
+------------------+
         |
         v
+------------------+
| Define target    | --> 4x/semana, 2000ml/dia
+------------------+
         |
         v
+------------------+
| INSERT goal      | --> user_goals table
+------------------+
         |
         v
+------------------+
| Atualizar        | --> Frequencia.tsx mostra nova meta
| interface        |
+------------------+
```

---

## 10. Dados para Graficos

### Estrutura de dados para grafico semanal

```typescript
interface WeeklyChartData {
  day: string;       // 'Seg', 'Ter', etc
  workout: number;   // 0 ou 1 (fez treino)
  hydration: number; // 0-100 (percentual da meta)
  sleep: number;     // 0-100
  nutrition: number; // 0 ou 1
}
```

### Query para dados da semana

```typescript
const getWeeklyData = async () => {
  const startOfWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const endOfWeek = endOfWeek(new Date(), { weekStartsOn: 1 });
  
  const { data: habitLogs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', format(startOfWeek, 'yyyy-MM-dd'))
    .lte('date', format(endOfWeek, 'yyyy-MM-dd'));
  
  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('created_at')
    .eq('user_id', user.id)
    .gte('created_at', startOfWeek.toISOString())
    .lte('created_at', endOfWeek.toISOString());
  
  // Processar e retornar dados formatados
  return formatWeeklyData(habitLogs, checkIns);
};
```

---

## 11. Ordem de Implementacao

1. **Migracao SQL**: Criar tabelas user_goals e habit_logs
2. **Hook useGoals**: CRUD de metas
3. **Hook useHabits**: Rastreamento de habitos
4. **GoalModal**: Refatorar para salvar no banco
5. **HabitTracker**: Componente de checkboxes
6. **Habitos.tsx**: Integrar rastreamento
7. **ProgressChart**: Grafico de barras
8. **Frequencia.tsx**: Metas reais, graficos
9. **GoalProgressCard**: Cards de progresso
10. **HabitDetailModal**: Historico e detalhes
11. **Home.tsx**: Resumo de habitos do dia

---

## Resultado Esperado

Apos implementacao:

1. Usuarios podem criar e acompanhar metas personalizadas
2. Habitos diarios podem ser marcados com um toque
3. Graficos mostram progresso semanal de forma visual
4. Streak de cada habito e calculado automaticamente
5. Historico completo de habitos disponivel
6. Metas de treino calculadas automaticamente via check-ins
7. Interface intuitiva com feedback visual imediato

