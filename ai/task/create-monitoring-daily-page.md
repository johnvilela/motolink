
# Task: Create page for daily monitoring

You will implement a new page at:

/operacional/monitoramento/diario

This page allows users to monitor **work-shifts and plannings for one day**, filtered by **client or client group**.

The page is **partially rendered on the server**, but the **main content must be rendered on the client**.

Before implementing anything:

- Carefully read this entire specification.
- If any dependency, endpoint, service, or logic required by this task does not exist, **STOP and inform me before proceeding**.
- If something is ambiguous, **ask questions first**.

After finishing implementation run:

```
tsc --noEmit
pnpm run lint

```

Fix any errors before concluding the task.

---

## 1. Page Structure

Follow the **same layout pattern** used in:

@/src/app/(private)/operacional/planejamento

The page must contain:

1. Breadcrumb
2. Filters row
3. Selected day header
4. Content area (client component)

---

## 2. Filters

Reuse the **same filters used in the planejamento page**.

All filters **must be synchronized with the URL**.

Add a **date selector on the right side of the filters row**.

### Date selector behavior

Use:

@/src/components/ui/popover.tsx  
@/src/components/ui/calendar.tsx

Requirements:

- The calendar opens inside a **Popover**
- The calendar must **fill the popover width**
- It must **focus on the currently selected date**
- If **today is not selected**, show a **small border around today's date**
- Selected date must be clearly highlighted

---

## 3. Selected Day Header

Below the filters row create a **visual header emphasizing the selected day**.

Purpose:

- Make it easy for users to confirm which day they are viewing.

---

## 4. Content Component

The content must be implemented as a **client component**.

It will render a **list of cards**, one card per client.

Data must be fetched using the **existing endpoints**.

### Data sources

Fetch:

1. Clients
2. Plannings
3. WorkShiftSlots

Filtering must use the **filters stored in the URL**.

Clients endpoint:

- fetched **once**

Plannings + WorkShiftSlots endpoints:

- must be **pooled every 30 seconds**
- use **random jitter between 1s and 4s**
- both requests **must share the same jitter value**

---

## 5. Client Card

Each card represents **one client**.

Behavior:

If filtering by:

**Group**
→ show all clients belonging to that group

**Client**
→ show only that client

The card must **always render**, even if:

- there are no plannings
- there are no work shifts

---

## 6. Client Card Header

The card header must show:

- Client address
- Commercial conditions

Rules:

- Show **only values that exist**
- Use **icons and colors** to improve UX
- Use:

@/src/components/ui/tooltip.tsx

to explain values when necessary.

---

## 7. Card Content

Inside the card render a **table-like list of rows** representing:

- planned slots
- work shift slots

The **client component must combine planning and workShiftSlots data**.

Example:

Planning:

- daytime
- daytime
- nighttime

WorkShiftSlots:

- daytime
- daytime

Render:

Row 1 → work shift  
Row 2 → work shift  
Row 3 → planning (empty)

---

## 8. Planning Row (Empty Slot)

Planning rows represent **vacant slots**.

Display:

Text:
"vago"

Below it:
planned period

Visual indicator:

- **yellow border on the left**

Right side button:

"Adicionar entregador"

This button opens:

@/src/components/ui/dialog.tsx

Dialog content can be **placeholder for now**.

---

## 9. Work Shift Row

Display the following information:

Deliveryman name

Below the name (small text):

- period
- payment value

Show:

Badge → contract type

Display:

- planned hours
- actual check-in / check-out times (if available)

Planned time may differ from actual time.

Also show:

Badge → current shift status

Beside the status add:

Button → advance to next state.

---

## 10. Work Shift Row Actions

Include the following actions:

Icon button:

- View details (placeholder for now)

Button:

- Send invite

Dropdown menu:

- Adicionar anotação
- Editar turno
- Editar horários
- Excluir turno
- Banir entregador

All actions open:

@/src/components/ui/dialog.tsx

Dialog contents may be **placeholder components**.

---

## 11. Add Deliveryman Button (Card Level)

Each client card must include a button:

"Adicionar entregador"

This action creates a **WorkShiftSlot without requiring a Planning first**.

For now the button can open a **dialog placeholder**.

---

## 12. Responsiveness

Even though the page is **primarily used on desktop**, it **must remain usable on mobile**.

Ensure:

- cards adapt properly
- rows remain readable
- actions remain accessible

---

## 13. Client-Side Data Logic

The client component must:

1. Fetch clients
2. Fetch plannings
3. Fetch workShiftSlots
4. Link them together

The linking logic must:

- associate plannings with clients
- associate workShiftSlots with clients
- combine them into rows

Rendering must respect:

- number of planned slots
- number of assigned work shifts

---

## 14. Important Constraints

Do NOT:

- implement dialog business logic yet
- change existing endpoints
- move logic to server

Do:

- reuse existing components
- keep code modular
- ensure filters stay in URL

---

## 15. Execution Rule

Before coding:

If **any of the following are missing**, STOP and report:

- endpoints
- service functions
- types
- required UI components
- dependencies

Only proceed if everything exists.
