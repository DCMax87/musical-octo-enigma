# Trello Timeline Viewer Power-Up

A Trello Power-Up that visualizes your board's checklist items with due dates on an interactive timeline, week view, and calendar.

## Features

- **Timeline View**: Visualize all checklist items with due dates on an interactive Gantt-style timeline
- **Week View**: See your tasks organized by day of the week
- **Calendar View**: Month-by-month calendar display of your tasks
- **Multiple Display Options**:
  - Group by: Campaign (List), Content Type (Label), or Person (Assignee)
  - Color by: Content Type, Campaign, or Checklist
- **Filtering**: Filter tasks by labels with easy toggle controls
- **Search**: Search across task names, checklists, cards, and more
- **Statistics Dashboard**: Track visible tasks, completed items, overdue tasks, and progress
- **Overdue Indicators**: Visual warnings for overdue items
- **Completed Task Toggle**: Show or hide completed tasks
- **Interactive**: Click any item to see full details with a link to the original card

## Installation

### Option 1: Install as a Custom Power-Up (Recommended for Testing)

1. **Host the Power-Up Files**
   - Upload all files to a publicly accessible web server (GitHub Pages, Netlify, Vercel, etc.)
   - Ensure HTTPS is enabled (required by Trello)
   - Note the URL where your files are hosted

2. **Create a Custom Power-Up in Trello**
   - Go to [https://trello.com/power-ups/admin](https://trello.com/power-ups/admin)
   - Click "Create New Power-Up"
   - Fill in the details:
     - Name: Timeline Viewer
     - Workspace: Select your workspace
   - In the "Iframe Connector URL" field, enter: `https://your-domain.com/js/client.js`
   - Click "Create"

3. **Enable the Power-Up on Your Board**
   - Open any Trello board
   - Click "Power-Ups" in the board menu
   - Find "Timeline Viewer" under "Custom"
   - Click "Add"

### Option 2: Host on GitHub Pages (Free)

1. **Create a GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/trello-timeline-powerup.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to "main" branch, "/" (root)
   - Save and note your GitHub Pages URL (e.g., `https://yourusername.github.io/trello-timeline-powerup`)

3. **Follow Option 1 steps 2-3** using your GitHub Pages URL

## File Structure

```
trello-timeline-powerup/
├── manifest.json           # Power-Up configuration
├── timeline.html          # Main timeline viewer page
├── settings.html          # Settings page
├── css/
│   └── timeline.css       # Styles for timeline viewer
├── js/
│   ├── client.js          # Power-Up connector
│   └── timeline.js        # Timeline functionality
└── images/
    ├── icon.svg           # Main Power-Up icon
    ├── icon-light.svg     # Light theme icon
    └── icon-dark.svg      # Dark theme icon
```

## Usage

1. **Open the Timeline Viewer**
   - Click the "Timeline View" button in the board toolbar

2. **Understand the Data Source**
   - The timeline shows all checklist items that have due dates assigned
   - Items must be in non-archived cards
   - Items must have a due date set

3. **Navigate Views**
   - **Timeline**: Horizontal timeline with swimlanes
   - **Week**: 7-day week view with tasks organized by day
   - **Calendar**: Monthly calendar view

4. **Customize Display**
   - **Swimlanes** (Timeline only): Choose how to group items
     - Campaign (List): Group by Trello list
     - Content Type (Label): Group by card labels
     - Person (Assignee): Group by assigned member
   - **Color by**: Choose what determines item colors
     - Content Type: Use label colors
     - Campaign: Use list-based colors
     - Checklist: Use checklist-based colors

5. **Filter and Search**
   - Use label checkboxes to filter which items are visible
   - Use the search box to find specific tasks
   - Toggle "Show Completed" to include/exclude finished items

6. **View Item Details**
   - Click any item to see full details
   - Modal shows: due date, assignee, checklist, card (with link), campaign, and labels

## Requirements

- Trello board with:
  - Cards (not archived)
  - Checklists on those cards
  - Checklist items with due dates assigned
  - (Optional) Labels on cards for better organization
  - (Optional) Members assigned to checklist items

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Requires internet connection for external libraries (vis-timeline)

## Dependencies

- [Trello Power-Up Client Library](https://p.trellocdn.com/power-up.min.js)
- [vis-timeline 7.7.3](https://visjs.github.io/vis-timeline/)

## Customization

### Change Colors

Edit the `COLOURS` array in `js/timeline.js`:

```javascript
const COLOURS = [
    '#0079bf', '#d29034', '#519839', '#b04632', '#89609e',
    '#cd5a91', '#4bbf6b', '#00aecc', '#838c91', '#172b4d'
];
```

### Modify Timeline Options

Edit the `options` object in the `renderTimeline()` function in `js/timeline.js`:

```javascript
const options = {
    orientation: 'top',
    stack: true,
    maxHeight: 600,
    // ... add more vis-timeline options
};
```

## Troubleshooting

### "No checklist items with due dates found"

- Ensure your cards have checklists
- Ensure checklist items have due dates assigned
- Check that cards are not archived

### Power-Up doesn't load

- Verify your hosting URL is accessible via HTTPS
- Check browser console for errors
- Ensure manifest.json has correct connector URL

### Items not displaying correctly

- Refresh the timeline viewer
- Check that labels exist and are assigned to cards
- Verify members are assigned to checklist items

## Privacy & Security

- This Power-Up only accesses board data you have permission to view
- No data is stored or transmitted to external servers
- All processing happens client-side in your browser
- Links to cards use standard Trello URLs

## Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

## License

MIT License - feel free to modify and use for your own purposes.

## Credits

- Built with [Trello Power-Up API](https://developer.atlassian.com/cloud/trello/power-ups/)
- Timeline visualization powered by [vis-timeline](https://github.com/visjs/vis-timeline)
- Icons designed with SVG

## Version History

### v1.0.0 (Current)
- Initial release
- Timeline, week, and calendar views
- Filtering and search capabilities
- Statistics dashboard
- Interactive item details
