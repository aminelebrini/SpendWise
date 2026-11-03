# SpendWise — مصاريفك تحت السيطرة / Salaire & dépenses

**SpendWise** is a local-first mobile app for **salary tracking, expense management,
and financial-cycle history** — built for **Moroccan personal users**: dirham (DH/MAD)
formatting, bilingual **Français ⇄ العربية** interface (full RTL), and a fresh
zero-state first launch (your salary, your numbers, nothing prefilled).

> *Salaries in, expenses out, cycles closed — everything stays on your phone.*

Built with **Expo SDK 58** · **Expo Router** · **React Native 0.88** · **TypeScript** (strict).

---

## Core workflows

### Accueil (Dashboard)
- Active salary hero card — company, "depuis le …", live pill
- **Salary consumption bar** animated green → amber → red (< 60 % / < 85 % / ≥ 85 %)
- Cycle progress ("Jour 3 sur 31") + KPIs (expense count, avg/day, biggest expense)
- **"Ajouter une dépense"** quick action + **"Changer de salaire / d'emploi"** button
- Latest 3 expenses with link to the full list

### Dépenses (current cycle)
- Entries grouped **by day** (Aujourd'hui / Hier / date), search, category chips,
  delete with confirmation, cycle total pinned in a footer bar

### Historique (past cycles)
- Cumulative savings hero card + every closed cycle (salary / spent / saved)
- Tap any cycle → **full retrospective**: salary, total spent, savings for the
  cycle, and the exact expenses list from that period

### Closing a cycle (Update Salary / Change Job)
Entering a new salary (raise or job change) **closes the current cycle**:
1. Confirmation dialog lists exactly what will happen
2. Current salary + all current expenses are **archived** into `financialHistory`
   (`totalExpenses`, `savedAmount` computed automatically)
3. `currentSalary` becomes the new salary/company/date
4. `currentExpenses` resets to `[]` — the new cycle starts at zero
5. Everything is written atomically to AsyncStorage

## Data model (persisted in AsyncStorage, key `spendwise/finance/v1`)

```ts
currentSalary:    { id, amount, company, startDate, isActive } | null
currentExpenses:  [{ id, title, amount, category, date }]
financialHistory: [{ cycleId, company, salary, startDate, endDate,
                     totalExpenses, savedAmount, expensesList }]
```

## Run it

```bash
npm install     # once
npx expo start  # then press a (Android), i (iOS), w (web) — or scan the QR with Expo Go
```

```bash
npx tsc --noEmit     # strict typecheck
npx expo-doctor      # dependency health check (20/20)
npx expo export      # production bundle
```

## Project structure

```
src/
  app/
    _layout.tsx            # Stack + LanguageProvider + FinanceProvider
    (tabs)/                # Accueil / Dépenses / Historique (floating glass tab bar)
    add-expense.tsx        # Modal — title, amount (DH), category, date (+ aujourd'hui/hier)
    update-salary.tsx      # Modal — cycle closing flow with confirmation
    history/[cycleId].tsx  # Retrospective detail of an archived cycle
  components/              # GlassCard, ExpenseRow, BudgetProgress (green→red), Fab…
  constants/               # theme.ts (emerald/gold glass), categories.ts (10 expense categories)
  context/                 # FinanceContext — state + cycle closing + write-through persistence
  hooks/                   # useFinanceStats — derived totals (consumed %, avg/day, by-category)
  i18n/                    # Typed FR/AR dictionary (compiler-enforced parity) + RTL provider
  storage/                 # financeStorage.ts — validated, atomic blob, fresh-zero first launch
  types/  utils/           # Domain types · MAD formatting & cycle math (day grouping…)
```

## Notes

- Bilingual UI, Arabic layout mirrors via `I18nManager.forceRTL` + `expo-updates` reload;
  locale-aware `Intl` formatters (`fr-MA` / `ar-MA`).
- All data is local — no account, no backend. Corrupt payloads are detected and ignored
  (app starts with a clean warning instead of crashing).
- **Fresh installs start at zero**: no demo salary, no expenses, empty history — set your
  salary via « Changer de salaire / d'emploi ». Storage is versioned (`spendwise/finance/v2`).
- Salary cycles with nothing recorded are never archived into history (no 0 DH phantom
  cycles) — your first salary setup is treated as onboarding, not a closing.
# SpendWise
