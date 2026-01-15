# Quick Start Guide

## For Local Development/Testing

1. **Install a local web server** (choose one):
   ```bash
   # Option 1: Using Python
   python -m http.server 8000
   
   # Option 2: Using Node.js http-server
   npm install -g http-server
   http-server -p 8000
   
   # Option 3: Using PHP
   php -S localhost:8000
   ```

2. **Use ngrok for HTTPS tunnel** (Trello requires HTTPS):
   ```bash
   # Install ngrok from https://ngrok.com/
   ngrok http 8000
   ```
   
   Copy the HTTPS URL provided (e.g., `https://abc123.ngrok.io`)

3. **Create Custom Power-Up**:
   - Go to https://trello.com/power-ups/admin
   - Click "Create New Power-Up"
   - Set connector URL to: `https://your-ngrok-url.ngrok.io/js/client.js`
   - Click "Create"

4. **Add to your board**:
   - Open a Trello board
   - Power-Ups menu → Find your custom Power-Up → Add

5. **Test**:
   - Click "Timeline View" button in the board toolbar
   - Should load the timeline with your board's checklist items

## For Production (GitHub Pages)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Repository Settings → Pages
   - Source: main branch / (root)
   - Save

3. **Update Power-Up**:
   - Edit your custom Power-Up at https://trello.com/power-ups/admin
   - Change connector URL to: `https://USERNAME.github.io/REPO/js/client.js`
   - Save

## Troubleshooting

**"Failed to load Power-Up"**
- Check that your URL is HTTPS
- Verify the connector URL ends with `/js/client.js`
- Check browser console for CORS errors

**"No items found"**
- Ensure your board has cards with checklists
- Checklist items must have due dates assigned
- Try assigning a due date to a checklist item and refresh

**Power-Up button doesn't appear**
- Refresh the Trello board
- Check that the Power-Up is enabled in Power-Ups menu
- Verify the manifest.json is accessible at your hosting URL

## Testing Checklist

Before deploying:
- [ ] manifest.json is accessible via HTTPS
- [ ] All files are in correct directory structure
- [ ] Icons load properly
- [ ] Timeline displays data from a real board
- [ ] All three views (Timeline, Week, Calendar) work
- [ ] Filters and search function correctly
- [ ] Modal opens when clicking items
- [ ] Card links in modal work
