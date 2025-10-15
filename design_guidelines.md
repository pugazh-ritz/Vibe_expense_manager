# Design Guidelines: Daily Expense Tracker with Goal-Based Savings

## Design Approach

**Selected Approach:** Modern Fintech-Inspired Design System
Drawing inspiration from successful mobile finance apps like Google Pay, PhonePe, and modern banking apps that balance trust, clarity, and ease of use. This utility-focused approach prioritizes quick interactions, clear financial data display, and mobile-first usability.

**Key Design Principles:**
1. **Immediate Clarity** - Financial status visible at a glance
2. **Touch-First Interaction** - Large, accessible buttons for quick expense entry
3. **Trust Through Consistency** - Predictable patterns that build user confidence
4. **Progressive Disclosure** - Show essential info first, details on demand

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 210 70% 45% (Trustworthy deep blue for primary actions and headers)
- Success/Savings: 145 65% 42% (Green for positive savings and goal progress)
- Danger/Overspend: 0 70% 55% (Red for warnings and overspending alerts)
- Background: 0 0% 98% (Soft off-white for main background)
- Card Background: 0 0% 100% (Pure white for elevated cards)
- Text Primary: 220 15% 20% (Near-black for primary text)
- Text Secondary: 220 10% 50% (Medium gray for secondary information)

**Dark Mode:**
- Primary: 210 60% 55% (Slightly brighter blue for dark backgrounds)
- Success/Savings: 145 55% 50% (Adjusted green for dark mode visibility)
- Danger/Overspend: 0 65% 60% (Softer red for dark mode)
- Background: 220 15% 12% (Deep charcoal background)
- Card Background: 220 15% 16% (Elevated dark cards)
- Text Primary: 0 0% 95% (Near-white for primary text)
- Text Secondary: 220 10% 65% (Light gray for secondary text)

**Accent Colors (Minimal Use):**
- Warning/Alert: 35 90% 55% (Amber for approaching limits)

### B. Typography

**Font Stack (via Google Fonts CDN):**
- Primary: 'Inter' - Clean, highly legible for UI text and numbers
- Numeric Display: 'JetBrains Mono' - Monospaced for financial amounts

**Type Scale:**
- Hero Numbers (Budget Display): text-5xl md:text-6xl font-bold
- Section Headers: text-2xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Small Labels: text-sm font-medium
- Tiny Meta: text-xs

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, and 16 for consistent rhythm
- Micro spacing (gaps, padding): p-2, gap-2
- Component padding: p-4, p-6
- Section spacing: space-y-6, space-y-8
- Major sections: mt-12, py-16

**Grid Structure:**
- Mobile-first: Single column with full-width cards (px-4 container)
- Expense cards: Full width with internal grid for amount/description
- Savings goals: 2-column grid on larger screens (grid-cols-1 sm:grid-cols-2)

### D. Component Library

**Primary Components:**

1. **Budget Display Card** (Hero Section)
   - Large currency symbol (₹) with remaining amount in hero size
   - Progress bar showing spent vs remaining budget
   - Daily limit indicator below
   - Gradient background (subtle) from primary to primary-dark

2. **Quick Expense Entry**
   - Large numeric keypad-style input for amount
   - Floating action button (FAB) for quick add
   - Quick category tags (Food, Transport, Shopping, Other)
   - Description field (optional but available)

3. **Savings Goals Cards**
   - Goal title with icon
   - Target amount display
   - Circular or linear progress indicator
   - Current saved amount
   - "Add to this goal" quick action
   - Visual: Card with border-l-4 in goal-specific color

4. **Transaction History List**
   - Date groupings (Today, Yesterday, Earlier)
   - Transaction cards with: amount, category icon, description, time
   - Swipe actions for delete (mobile gesture)

5. **Bottom Navigation/Tab Bar**
   - Home (Budget view)
   - Goals (Savings goals overview)
   - History (Transaction list)
   - Settings
   - Icons from Heroicons (outline style)

**Form Elements:**
- Input fields: Large touch targets (min-h-12), rounded-lg borders
- Buttons: Rounded-full for primary, rounded-lg for secondary
- Primary buttons: Full width on mobile, min-w-32 on desktop

**Data Visualization:**
- Progress bars: h-3 rounded-full with smooth transitions
- Circular progress: For individual savings goals
- Mini charts: Simple bar visualization for weekly spending patterns

### E. Interaction Patterns

**Animations (Minimal, Purposeful):**
- Currency amount changes: Number count-up animation (subtle)
- Goal progress: Smooth bar fill on savings addition
- Transaction add: Slide-in from bottom
- Delete action: Fade-out with slight scale

**Mobile Gestures:**
- Swipe left on transaction to delete
- Pull-to-refresh on history
- Tap-hold on goal for detailed breakdown

**Visual Feedback:**
- Success state: Green checkmark with brief scale animation
- Overspend warning: Gentle shake on budget card
- Goal achieved: Confetti burst (very brief, dismissible)

## Images

**No hero image required** - The budget display card with large typography serves as the visual anchor. 

**Icon Usage:**
- Use Heroicons (via CDN) for all UI icons
- Categories use filled icons in circular backgrounds
- Navigation uses outline icons (filled when active)
- Savings goals can have custom emoji or icon representation (e.g., 📱 for Phone, 👔 for Dress)

## Mobile-Specific Considerations

- **Safe Areas:** Account for Android navigation bars (pb-safe)
- **Thumb Zones:** Primary actions in lower third of screen
- **Input Handling:** Numeric keyboard for amount entry
- **Offline Support:** Visual indicators for sync status
- **Touch Targets:** Minimum 44x44px for all interactive elements

## Quality Standards

- Smooth 60fps scrolling
- Instant visual feedback (<100ms)
- Loading states for all async operations
- Empty states with helpful illustrations/messages
- Error states with clear recovery actions
- Comprehensive dark mode throughout (including inputs and modals)