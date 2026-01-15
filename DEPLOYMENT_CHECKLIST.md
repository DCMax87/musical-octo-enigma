# Deployment Checklist

Use this checklist to ensure your Trello Timeline Power-Up is properly deployed.

## Pre-Deployment

- [ ] All files are in the correct directory structure
- [ ] manifest.json is in the root directory
- [ ] All paths in manifest.json are relative (start with ./)
- [ ] Icons exist in images/ directory
- [ ] CSS file exists in css/ directory
- [ ] JS files exist in js/ directory

## Hosting Setup

### Option: GitHub Pages
- [ ] Created GitHub repository
- [ ] Pushed all files to main branch
- [ ] Enabled GitHub Pages in repository settings
- [ ] Noted GitHub Pages URL (https://username.github.io/repo-name)
- [ ] Verified index.html loads at GitHub Pages URL
- [ ] Verified manifest.json is accessible (add /manifest.json to URL)

### Option: Other Hosting (Netlify, Vercel, etc.)
- [ ] Uploaded all files to hosting service
- [ ] HTTPS is enabled
- [ ] Noted hosting URL
- [ ] Verified index.html loads
- [ ] Verified manifest.json is accessible

### Option: Local Testing with ngrok
- [ ] Started local web server (python -m http.server 8000)
- [ ] Started ngrok (ngrok http 8000)
- [ ] Noted HTTPS ngrok URL
- [ ] Verified files are accessible through ngrok URL

## Trello Power-Up Setup

- [ ] Logged into Trello
- [ ] Navigated to https://trello.com/power-ups/admin
- [ ] Clicked "Create New Power-Up"
- [ ] Filled in Power-Up details:
  - [ ] Name: Timeline Viewer (or your choice)
  - [ ] Workspace: Selected your workspace
  - [ ] Iframe connector URL: https://your-domain.com/js/client.js
  - [ ] Support contact: Your email
- [ ] Clicked "Create"
- [ ] Power-Up appears in the list

## Board Installation

- [ ] Opened a Trello board for testing
- [ ] Clicked "Power-Ups" in the board menu
- [ ] Found "Timeline Viewer" under "Custom" section
- [ ] Clicked "Add"
- [ ] Power-Up is now enabled on the board

## Functionality Testing

### Basic Functionality
- [ ] "Timeline View" button appears in board toolbar
- [ ] Clicking button opens modal
- [ ] Modal loads without errors (check browser console)
- [ ] Board name displays correctly
- [ ] Loading indicator appears initially

### Data Display
- [ ] Checklist items with due dates appear on timeline
- [ ] Items are grouped correctly (test all swimlane options)
- [ ] Items are colored correctly (test all color-by options)
- [ ] Labels display correctly
- [ ] Member avatars/initials display correctly

### View Switching
- [ ] Timeline view displays correctly
- [ ] Week view displays correctly
- [ ] Calendar view displays correctly
- [ ] Switching between views works smoothly
- [ ] Data persists when switching views

### Filtering & Search
- [ ] Label filters display all board labels
- [ ] Clicking filter checkboxes updates display
- [ ] "Select All" / "Deselect All" works
- [ ] Search box filters items correctly
- [ ] "Show Completed" toggle works

### Statistics
- [ ] Visible Tasks count is correct
- [ ] Completed count is correct
- [ ] Overdue count is correct
- [ ] This Week count is correct
- [ ] Progress percentage is correct

### Interactivity
- [ ] Clicking timeline items opens modal
- [ ] Modal displays all item details
- [ ] Card link in modal works (opens Trello card)
- [ ] Modal closes when clicking outside
- [ ] Modal closes on Escape key
- [ ] Weekend highlighting appears correctly
- [ ] Current time marker appears (red line)

### Navigation
- [ ] Timeline zoom (Ctrl+Scroll) works
- [ ] Timeline pan (drag) works
- [ ] Week view navigation buttons work
- [ ] Calendar month navigation works
- [ ] "Today" button in calendar works
- [ ] "This Week" button in week view works

### Responsive Design
- [ ] Layout works on desktop
- [ ] Layout works on tablet (if applicable)
- [ ] All controls are accessible
- [ ] Text is readable

## Error Handling

### Test Edge Cases
- [ ] Board with no checklist items (should show message)
- [ ] Board with no due dates (should show message)
- [ ] Board with archived cards (should exclude them)
- [ ] Board with no labels (should show "No Label" option)
- [ ] Board with unassigned items (should show "Unassigned")

### Browser Console
- [ ] No JavaScript errors in console
- [ ] No failed network requests
- [ ] No CORS errors
- [ ] Trello Power-Up API loads successfully

## Performance

- [ ] Timeline renders within 3 seconds
- [ ] Switching views is responsive (<1 second)
- [ ] Search results appear instantly
- [ ] Filter changes apply immediately
- [ ] No lag when scrolling timeline

## Documentation

- [ ] README.md is complete and accurate
- [ ] QUICKSTART.md has correct URLs
- [ ] CONFIGURATION.md examples match your setup
- [ ] CONVERSION_SUMMARY.md reflects your deployment

## Final Steps

- [ ] Tested on multiple boards
- [ ] Tested with different board configurations
- [ ] Verified all documentation links work
- [ ] Shared Power-Up URL with team (if applicable)
- [ ] Bookmarked Power-Up admin page for future updates

## Troubleshooting Reference

If something doesn't work, check:

1. **Browser Console**: Look for error messages
2. **Network Tab**: Check if files are loading (200 status)
3. **URLs**: Verify all paths are correct and HTTPS
4. **Trello API**: Ensure board data is accessible
5. **File Structure**: Confirm all files are in correct locations

## Common Issues

| Issue | Solution |
|-------|----------|
| "Failed to load Power-Up" | Check connector URL is correct and HTTPS |
| Button doesn't appear | Refresh board, verify Power-Up is enabled |
| No items displayed | Ensure checklist items have due dates |
| Icons don't load | Check image paths in manifest.json |
| Modal won't open | Check browser console for errors |
| Card links don't work | Verify cardShortLink is being fetched |

## Success Criteria

Your Power-Up is successfully deployed when:
- ✅ Timeline View button appears in Trello toolbar
- ✅ Clicking button opens full-screen timeline
- ✅ All checklist items with due dates are visible
- ✅ All three views work (Timeline, Week, Calendar)
- ✅ Filters and search function correctly
- ✅ Clicking items shows detailed modal
- ✅ Card links in modal open Trello cards

## Next Steps After Deployment

1. **Monitor Usage**: Watch for any error reports
2. **Gather Feedback**: Ask users for feature requests
3. **Iterate**: Make improvements based on feedback
4. **Update Documentation**: Keep docs in sync with changes
5. **Consider Publishing**: If you want to share publicly, apply to Trello's Power-Up directory

---

**Date Deployed**: _____________

**Deployed By**: _____________

**Hosting URL**: _____________

**Power-Up ID**: _____________
