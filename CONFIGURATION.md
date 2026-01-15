# Configuration Examples

## Example 1: Marketing Campaign Board

**Board Setup:**
- Lists: "Q1 Campaigns", "Q2 Campaigns", "Q3 Campaigns", "Q4 Campaigns"
- Labels: "Social Media" (green), "Email" (yellow), "Blog" (blue), "Video" (red)
- Cards: Campaign names
- Checklists: Content pieces with due dates
- Members: Assigned to specific checklist items

**Recommended View:**
- Swimlanes: Campaign (List) - to see all campaigns
- Color by: Content Type (Label) - to see content types at a glance
- This gives you a timeline of content across campaigns

## Example 2: Product Development

**Board Setup:**
- Lists: "Frontend", "Backend", "Design", "QA"
- Labels: "Bug" (red), "Feature" (green), "Enhancement" (yellow)
- Cards: Feature/bug names
- Checklists: Tasks with due dates
- Members: Developers assigned to tasks

**Recommended View:**
- Swimlanes: Person (Assignee) - to see workload distribution
- Color by: Content Type (Label) - to see priority/type
- This shows who's working on what and when

## Example 3: Event Planning

**Board Setup:**
- Lists: "Pre-Event", "Event Day", "Post-Event"
- Labels: "Venue" (blue), "Catering" (green), "Marketing" (yellow), "Speakers" (purple)
- Cards: Event components
- Checklists: Action items with deadlines
- Members: Event team assigned to tasks

**Recommended View:**
- Swimlanes: Content Type (Label) - to see tasks by category
- Color by: Campaign (List) - to see timeline phases
- This shows all tasks grouped by category across event phases

## Customizing for Your Workflow

### Label Color Mapping

The Power-Up uses Trello's standard label colors. You can customize the mapping in `js/timeline.js`:

```javascript
const TRELLO_LABEL_COLOURS = {
    'green': '#61bd4f',     // Use for: Approved, Done, Go
    'yellow': '#f2d600',    // Use for: In Progress, Warning
    'orange': '#ff9f1a',    // Use for: Review Needed
    'red': '#eb5a46',       // Use for: Urgent, Blocked
    'purple': '#c377e0',    // Use for: VIP, Special
    'blue': '#0079bf',      // Use for: Standard, Normal
    'sky': '#00c2e0',       // Use for: Optional, Nice-to-have
    'lime': '#51e898',      // Use for: Quick Win
    'pink': '#ff78cb',      // Use for: Creative
    'black': '#344563'      // Use for: Administrative
};
```

### Date Range Tips

- Timeline automatically adjusts to show all due dates ± 14 days
- Use Ctrl+Scroll to zoom in/out on the timeline
- Drag the timeline to pan left/right
- Weekend highlighting helps identify non-working days

### Best Practices

1. **Use Consistent Labels**: Apply the same label scheme across all cards for better filtering
2. **Assign Due Dates**: Only checklist items with due dates appear on the timeline
3. **Assign Members**: Helps with "Person" swimlane view
4. **Name Checklists Clearly**: Checklist names appear in the timeline items
5. **Keep Task Names Concise**: Long names are truncated in the timeline view

### Performance Tips

- For boards with 100+ tasks, consider using filters to reduce display load
- Use "Show Completed" toggle to hide finished tasks
- Calendar and Week views perform better than Timeline for very large datasets

## Integration Ideas

### With Other Power-Ups

- **Custom Fields**: Add priority or status custom fields
- **Card Repeater**: Auto-create recurring checklist items with due dates
- **Voting**: Use votes to prioritize which items appear first

### Workflow Automations

Use Trello's Butler automation to:
1. Auto-assign due dates based on card creation
2. Move cards when all checklist items are complete
3. Send notifications for upcoming due dates
4. Auto-archive completed items

## Advanced Customization

### Modify Timeline Appearance

In `css/timeline.css`, you can customize:

```css
/* Change timeline item height */
.vis-item {
    min-width: 200px; /* Adjust min width */
}

/* Change weekend highlighting */
.weekend-highlight {
    background-color: rgba(235, 90, 70, 0.06); /* Adjust opacity/color */
}

/* Customize modal appearance */
.item-modal-content {
    max-width: 500px; /* Make modal wider/narrower */
}
```

### Add Custom Statistics

In `js/timeline.js`, you can add custom stat cards to `renderStatsDashboard()`:

```javascript
<div class="stat-card" style="--stat-color: #custom-color;">
    <div class="stat-card-value">${customValue}</div>
    <div class="stat-card-label">Custom Label</div>
</div>
```
