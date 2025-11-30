# Advanced Rivals MHT-CET Battle Tracker - Design Guidelines

## Design Approach

**Hybrid System: Productivity Tool + Competitive Gaming**

This is a utility-focused competitive learning platform combining:
- Linear/Notion's clean productivity aesthetics for content organization
- Duolingo's gamification elements for engagement
- Real-time competitive elements inspired by live sports dashboards

The design must balance serious study tracking with motivational gaming elements, creating a premium yet energetic experience for exactly two competing users.

**Core Principle**: Clear hierarchy, instant comprehension, competitive energy without distraction.

## Typography System (Inter Font Family)

**Font Hierarchy:**
- **Hero/Page Titles**: text-4xl lg:text-5xl, font-bold (48-60px)
- **Section Headers**: text-2xl lg:text-3xl, font-semibold (30-36px)
- **Card Titles/Chapter Names**: text-lg font-semibold (18px)
- **Body Text**: text-base font-normal (16px)
- **Labels/Metadata**: text-sm font-medium (14px)
- **Captions/Timestamps**: text-xs text-gray-500 (12px)

**Competitive Stats (Numbers)**: text-3xl lg:text-5xl font-bold - use tabular numbers for alignment

## Layout & Spacing System

**Tailwind Spacing Primitives**: Use 4, 6, 8, 12, 16, 20 units consistently
- Component padding: p-4 to p-6
- Section spacing: py-12 lg:py-16
- Card gaps: gap-4 to gap-6
- Container max-width: max-w-7xl for main content
- Narrow content: max-w-4xl for reading text

**Grid Systems:**
- Battle Arena chapters: grid-cols-1 lg:grid-cols-2 gap-6
- Progress comparison: grid-cols-1 md:grid-cols-2 gap-8
- Achievement badges: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4
- Subject stats: grid-cols-3 gap-4

## Core Component Library

### Navigation & Layout
**Top Navigation Bar:**
- Fixed header with blurred backdrop (backdrop-blur-sm bg-white/80)
- Logo/app name on left
- Nav items centered or right-aligned
- Profile icon with uploaded image (w-10 h-10 rounded-full)
- Theme toggle icon button
- Border bottom with subtle shadow

**Sidebar Navigation** (for desktop):
- Fixed left sidebar (w-64) with main sections
- Active state: Background fill with primary accent
- Icon + label combination
- Collapsible on mobile (hamburger menu)

### Battle Arena Components

**Chapter Accordion Cards:**
- Large clickable header with chapter name (text-lg font-semibold)
- Subject badge pill (Physics/Chemistry/Math with distinct badges)
- Completion summary: "You: 8/12 | Rival: 5/12" in small caps
- Expanded state shows lecture/DPP lists with checkboxes
- Hover state: Subtle background lift (bg-gray-50)

**Lecture/DPP Line Items:**
- Checkbox on left (large, 20px minimum)
- Lecture name/number in body text
- Status indicators on right: "You ✓" (primary), "Rival ✓" (secondary), "Both ✓✓", "None" (gray)
- Toggle animation: Smooth checkbox transition with success toast
- Dividers between items (border-gray-200)

**Quick Jump Navigation:**
- Sticky pill buttons floating above content
- "Physics | Chemistry | Math" horizontal scroll on mobile
- Active section highlighted with primary background

### Progress Dashboard Components

**Comparative Progress Cards:**
- Large cards with user profile images side-by-side
- Progress bars stacked vertically showing head-to-head comparison
- Primary color for current user, secondary for rival
- Numbers displayed prominently above bars (text-3xl font-bold)
- Subject breakdown in smaller cards below

**Circular Progress Charts:**
- SVG-based radial progress (120-150px diameter)
- Percentage in center (text-2xl font-bold)
- Color-coded by subject or user
- Label below chart (text-sm)

**Streak Counter Display:**
- Large flame icon (🔥) or custom SVG
- Current streak number (text-5xl font-bold)
- "day streak" label below
- Side-by-side comparison in grid
- Visual indicator if streak is at risk

### Achievement System Components

**Achievement Badge Grid:**
- Card-based grid layout
- Unlocked: Full color with unlock date
- Locked: Grayscale with lock icon overlay
- Badge icon (emoji or custom SVG, 48px)
- Achievement name (text-base font-semibold)
- Description (text-sm text-gray-600)
- Unlock timestamp (text-xs)
- Hover: Gentle scale transform (scale-105)

**Achievement Toast Notifications:**
- Slide in from top-right
- Large badge icon on left
- "Achievement Unlocked!" header
- Achievement name in bold
- Auto-dismiss after 5 seconds

### School Lesson Components

**Lesson Creation Form:**
- Clean form layout with labels above inputs
- Subject dropdown (large touch targets)
- Month range selector (dropdown with visual calendar)
- Lesson name text input (full width)
- File upload zone for mindmap PDFs (drag-and-drop area)

**Lesson Card:**
- Similar to lecture items but with mindmap preview
- PDF icon with "View Mindmap" link
- Upload button if no mindmap exists
- Month range badge (subtle background)
- Completion checkbox with both users' status

### Chat Components

**Chat Message List:**
- Scrollable container (max-h-96 lg:max-h-screen)
- Messages aligned left (rival) and right (current user)
- Profile image next to each message (w-8 h-8 rounded-full)
- Speech bubble design with tails
- Timestamp below message (text-xs text-gray-500)
- Auto-scroll to bottom on new message
- Empty state: "Start the conversation" with icon

**Message Input:**
- Fixed bottom bar (sticky)
- Text input with rounded corners (full width)
- Send button (icon or "Send" text) on right
- Enter to send, Shift+Enter for new line
- Character limit indicator if needed

### Settings & Profile Components

**Profile Section:**
- Large profile image upload zone (center aligned)
- Circular preview (w-32 h-32)
- "Upload Photo" button below (or camera icon overlay on hover)
- Name and email display (text-lg)
- PW Batch ID badge
- Rival code display (monospace font)

**Theme Toggle:**
- Switch component (toggle slider)
- Sun/Moon icons
- Label "Light / Dark Mode"
- Smooth transition on theme change

**File Upload Zones:**
- Dashed border rectangle (border-2 border-dashed)
- Upload icon (cloud or arrow up) centered
- "Drag & drop or click to upload" text
- File type and size limits below (text-xs)
- Progress bar during upload
- Error states with red border and message

### Additional UI Elements

**Buttons:**
- Primary: Solid background, white text, rounded-lg, px-6 py-3
- Secondary: Outline style, primary border
- Icon buttons: p-2 rounded-full, hover background
- Disabled state: opacity-50, cursor-not-allowed

**Cards:**
- Background white (dark mode: dark gray)
- Rounded corners (rounded-xl)
- Subtle shadow (shadow-sm)
- Padding p-6
- Hover: shadow-md transition

**Badges/Pills:**
- Small rounded-full with px-3 py-1
- Subject badges: Distinct background per subject
- Status indicators: Icon + text combination
- Uppercase text-xs font-semibold tracking-wide

**Loading States:**
- Skeleton screens for content loading
- Spinner for button actions
- Shimmer animation on placeholders

**Empty States:**
- Centered icon (large, 64px)
- Heading text (text-xl)
- Description paragraph
- Call-to-action button

## Images

**Profile Images:**
- User-uploaded photos displayed as circular avatars throughout the app
- Default fallback: User icon emoji (🦊 or ⚡) on colored background
- Sizes: w-10 h-10 (nav), w-32 h-32 (settings), w-8 h-8 (chat)

**No Large Hero Section:**
- This is a dashboard app - land directly on the Battle Arena or Dashboard
- Authentication pages: Simple centered card with app logo/name at top
- Focus on immediate functionality, not marketing

**Mindmap Previews:**
- PDF thumbnail or icon representation
- "View PDF" link button with download icon
- No embedded PDF viewers - open in new tab

## Responsive Behavior

**Mobile (< 768px):**
- Single column layouts
- Collapsible navigation (hamburger menu)
- Stacked progress comparisons
- Larger touch targets (min 44px)
- Bottom navigation bar for main sections

**Tablet (768px - 1024px):**
- Two-column grids where appropriate
- Side-by-side comparisons visible
- Sidebar navigation appears

**Desktop (> 1024px):**
- Full multi-column layouts
- Persistent sidebar navigation
- Side-by-side views for competitive elements
- Hover states fully active

## Visual Hierarchy & Principles

1. **Competitive First**: Always show both users' data side-by-side when comparing
2. **Instant Feedback**: Real-time updates visible within 1 second
3. **Clarity Over Decoration**: Information density is high, but clean
4. **Motivational Design**: Use success states, celebrations for achievements
5. **Consistent Patterns**: Completion checkboxes work identically everywhere
6. **Accessibility**: Maintain WCAG AA contrast ratios, keyboard navigation for all actions

This design creates a focused, competitive, and motivational study environment that feels premium while maintaining utility-first clarity.