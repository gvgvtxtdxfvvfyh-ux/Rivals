# Design Guidelines: Rivals - Two-Person Battle Tracker

## Design Approach: Hybrid System (Material Dark + Competitive Gaming Aesthetics)

**Core Philosophy:** "Precision Combat Interface" - A dark, focused battlefield where every interaction feels consequential. Blend Material Design's clarity with gaming UI's intensity. Think League of Legends client meets Linear's refinement.

**Visual Tone:** Dark, competitive, minimal, with sharp edges and purposeful highlights. Every element should feel like it's carved into a war room display.

## Typography

**Primary Font:** Inter (Google Fonts)
- Headings: 600-700 weight, tight letter-spacing (-0.02em)
- Body: 400 weight for readability
- Stats/Numbers: 700 weight, tabular-nums for alignment

**Hierarchy:**
- Page Titles: text-3xl to text-4xl font-bold
- Section Headers: text-xl to text-2xl font-semibold
- Stat Numbers: text-4xl to text-6xl font-bold (large impact)
- Body/Labels: text-sm to text-base
- Chat Messages: text-sm
- Small Meta: text-xs (timestamps, hints)

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20 (p-4, m-8, gap-6, etc.)

**Container Strategy:**
- Page wrapper: max-w-7xl mx-auto px-4 to px-8
- Dashboard cards: Consistent p-6 to p-8
- Form sections: p-6
- Chat container: Fixed height with overflow-scroll

**Grid Patterns:**
- Dashboard: 2-column split for rival comparison (grid-cols-1 lg:grid-cols-2)
- Progress stats: 3-column grid for PCM subjects (grid-cols-1 md:grid-cols-3)
- PW Battle: Single column with expandable subject sections

## Component Library

### Navigation
- Top header bar: Fixed, minimal height (h-16), logo left, user avatar/streak indicator right
- No sidebar - keep it streamlined
- Page navigation: Horizontal tabs or minimal side rail if needed

### Dashboard Cards
- Dual streak display: Side-by-side cards with massive numbers (text-6xl) and flame/trophy icons
- Bar graph card: Full-width card below streaks showing PCM comparison
- Visual: Horizontal bars with user icons (🦊 vs ⚡) at bar ends
- Progress percentages beneath each bar

### Forms (Sign Up/In, Manual Entry)
- Input fields: Full-width, rounded borders, focus states with subtle glow
- Labels: Above inputs, text-sm font-medium
- Rival Code input: Special treatment - larger, centered, with mystery/lock aesthetic
- Submit buttons: Full-width, bold, with loading states

### PW Battle Page Components
- Subject sections: Collapsible accordions with PCM headers
- Add lecture/DPP: Inline form that appears on "+ Add" click
- Checkbox rows: 3-column layout (checkbox | Lecture name | Status icons)
- Status display: Compact icons showing You ✅ | Rival ❌ or merged ✅✅ when both complete
- User legend always visible: "You 🦊 | Rival ⚡" in page header

### Progress Page
- Circular progress rings: 3 large circles for PCM (use chart library or CSS conic-gradient)
- Center of circle: Percentage text-3xl font-bold
- Below circles: Detailed stats in clean list format
- Overall progress: Large banner at top with combined percentage

### School Syllabus & Chat
- Month range selector: Dropdown or date picker, clear start/end display
- Syllabus list: Table or card layout with dual checkbox columns (You | Rival)
- Chat section: Fixed bottom panel or side panel (h-96 to h-[500px])
- Messages: Avatar icon, timestamp, simple bubbles
- Input: Sticky bottom with send button

### Buttons
- Primary action: Bold, high contrast, px-6 py-3
- Secondary: Outlined variant
- Icon buttons: Square, p-2, for actions like "Add" or "Delete"
- All buttons: Smooth hover transitions (transition-all duration-200)

## Visual Treatment

**Dark Theme Foundation:**
- Base background: Near black (zinc-950 or neutral-950)
- Card backgrounds: Slightly lighter (zinc-900)
- Borders: Subtle (zinc-800)
- Text: High contrast white/zinc-100 for primary, zinc-400 for secondary

**Competitive Accents:**
- Victory highlights: Emerald-500 for completed items
- Rivalry tension: Red-500/orange-500 for "behind" status indicators
- Neutral: Blue-500 for informational elements
- Streak fire: Gradient from orange-500 to red-600

**Depth & Elevation:**
- Cards: Subtle shadow (shadow-lg) against dark background
- Hover states: Slight lift (transform scale-105 or shadow-xl)
- Active items: Inner glow effect

## Iconography

**Icons Library:** Heroicons (outline for regular, solid for active states)
- Use consistently across all UI elements
- Size: w-5 h-5 for inline, w-6 h-6 for standalone
- Emoji for user identities: 🦊 (User 1), ⚡ (User 2) - rendered at text-xl size

## Animations

**Minimal, Purposeful:**
- Checkbox completion: Quick check animation (scale + opacity)
- Streak increment: Number count-up animation (smooth)
- Bar graph: Horizontal fill animation on load (duration-700)
- Page transitions: Subtle fade (duration-200)
- Chart renders: Ease-in growth effect (duration-500)

**No Distractions:** Avoid auto-playing animations, carousels, or excessive motion

## Data Visualization

**Bar Graphs (Dashboard):**
- Horizontal bars preferred for comparison clarity
- Two bars per subject (Physics, Chemistry, Math)
- User icons at bar ends
- Percentage labels inside or beside bars
- Gridlines: Minimal, subtle (zinc-800)

**Progress Circles:**
- Clean, bold strokes (stroke-width: 8-12)
- Completed portion in victory accent
- Remaining in muted gray
- Animated fill on page load

## Images

**Favicon:** Goku Black symbol (悟) provided by user - implement as app icon

**No Hero Images:** This is a utility app, not a marketing site. Focus on functional UI, not decorative imagery.

**Avatar Placeholders:** Use simple initial circles or solid emoji icons for user representation.

## Accessibility

- All checkboxes: Proper labels and keyboard navigation
- Focus indicators: Visible ring (ring-2 ring-offset-2)
- Forms: Error states in red-500 with clear messaging
- Contrast ratios: Maintain WCAG AA standards despite dark theme
- Chat: Scrollable with keyboard support

## Responsive Strategy

**Mobile (base - md):**
- Stack all dual-column layouts to single column
- Reduce stat number sizes (text-4xl → text-3xl)
- Collapse navigation to hamburger if needed
- Chat: Full-screen overlay or bottom sheet

**Desktop (lg+):**
- Side-by-side rival comparisons
- Multi-column grids for stats
- Expanded chart sizes

## Special UX Considerations

**Real-time Updates:** Visual indicator when rival completes something (subtle pulse on their icon)

**Streak Logic Display:** Clear tooltip explaining "1 completion needed in last 24h"

**2-User Enforcement:** Sign-up page shows "1/2 slots filled" or "Full - No new signups" messaging

**Battle Mindset:** Every completion should feel earned - consider subtle success micro-interactions (confetti particles on streak milestone, etc.)

---

**Execution Note:** Build with surgical precision. Every pixel serves the rivalry. Dark, focused, fast, deadly accurate.