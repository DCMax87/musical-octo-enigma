/* global TrelloPowerUp, vis */

// Colour palettes
const COLOURS = [
    '#0079bf', '#d29034', '#519839', '#b04632', '#89609e',
    '#cd5a91', '#4bbf6b', '#00aecc', '#838c91', '#172b4d'
];

const TRELLO_LABEL_COLOURS = {
    'green': '#61bd4f', 'yellow': '#f2d600', 'orange': '#ff9f1a',
    'red': '#eb5a46', 'purple': '#c377e0', 'blue': '#0079bf',
    'sky': '#00c2e0', 'lime': '#51e898', 'pink': '#ff78cb',
    'black': '#344563', 'green_dark': '#519839', 'yellow_dark': '#d9b51c',
    'orange_dark': '#d29034', 'red_dark': '#b04632', 'purple_dark': '#89609e',
    'blue_dark': '#026aa7', 'sky_dark': '#0098b7', 'lime_dark': '#4bbf6b',
    'pink_dark': '#df4d83', 'black_dark': '#091e42', 'green_light': '#c1e6c1',
    'yellow_light': '#fdf4c1', 'orange_light': '#fce3c1', 'red_light': '#f5d3ce',
    'purple_light': '#e4d4f4', 'blue_light': '#c1e0f4', 'sky_light': '#c1f4fc',
    'lime_light': '#d4f4d4', 'pink_light': '#fcd4ea', 'black_light': '#c1c7d0'
};

let t = TrelloPowerUp.iframe();
let timeline = null;
let parsedItems = [];
let membersMap = {};
let listsMap = {};
let labelsMap = {};
let cardsMap = {};
let activeFilters = new Set();
let allLabelIds = new Set();
let currentView = 'timeline';
let currentMonth = new Date();
currentMonth.setDate(1);
currentMonth.setHours(0, 0, 0, 0);
let currentWeekStart = new Date();
let searchQuery = '';
let showCompleted = true;

// URL regex pattern
const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g;

// Initialize
async function init() {
    try {
        // Get board data from Trello API
        const board = await t.board('all');
        const lists = await t.lists('all');
        const cards = await t.cards('all');
        const members = await t.get('board', 'shared', 'members') || [];
        
        document.getElementById('board-name').textContent = 'Board: ' + board.name;
        
        // Process the data
        await processData(board, lists, cards, members);
        
        // Hide loading, show content
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('timeline-section').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading board data:', error);
        document.getElementById('loading').innerHTML = '<p style="color: #eb5a46;">Error loading board data. Please try again.</p>';
    }
}

async function processData(board, lists, cards, members) {
    // Build lookup maps
    membersMap = {};
    (members || []).forEach(m => {
        membersMap[m.id] = m;
    });

    listsMap = {};
    (lists || []).forEach(l => {
        if (!l.closed) {
            listsMap[l.id] = l;
        }
    });

    labelsMap = {};
    (board.labels || []).forEach(l => {
        labelsMap[l.id] = l;
    });

    cardsMap = {};
    (cards || []).forEach(c => {
        if (!c.closed) {
            cardsMap[c.id] = c;
        }
    });

    // Extract checklist items with due dates
    parsedItems = [];
    allLabelIds = new Set();
    
    for (const card of cards) {
        if (card.closed) continue;
        
        const list = listsMap[card.idList];
        if (!list) continue;
        
        const cardLabels = (card.idLabels || []).map(id => labelsMap[id]).filter(Boolean);
        
        // Get checklists for this card
        const checklists = card.checklists || [];
        
        for (const checklist of checklists) {
            const checkItems = checklist.checkItems || [];
            
            for (const item of checkItems) {
                if (item.due) {
                    const assignee = item.idMember ? membersMap[item.idMember] : null;
                    
                    // Track all labels
                    cardLabels.forEach(l => allLabelIds.add(l.id));
                    if (cardLabels.length === 0) allLabelIds.add('no-label');
                    
                    parsedItems.push({
                        id: item.id,
                        name: item.name,
                        due: new Date(item.due),
                        complete: item.state === 'complete',
                        checklist: checklist.name,
                        checklistId: checklist.id,
                        card: card.name,
                        cardId: card.id,
                        cardShortLink: card.shortLink,
                        labels: cardLabels,
                        list: list.name,
                        listId: list.id,
                        assignee: assignee,
                        assigneeName: assignee ? (assignee.fullName || assignee.username) : 'Unassigned'
                    });
                }
            }
        }
    }

    if (parsedItems.length === 0) {
        document.getElementById('timeline-section').innerHTML = '<p style="padding: 40px; text-align: center; color: #5e6c84;">No checklist items with due dates found in this board.</p>';
        return;
    }

    // Initialize filters - all active by default
    activeFilters = new Set(allLabelIds);
    currentWeekStart = getWeekStart(new Date());

    buildFilters();
    renderStatsDashboard();
    renderTimeline();
    setupEventListeners();
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
}

function getContrastColor(hexColor) {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#172b4d' : '#ffffff';
}

function renderStatsDashboard() {
    const filteredItems = getFilteredItems();
    const allItems = parsedItems.filter(item => {
        if (item.labels.length > 0) {
            return item.labels.some(l => activeFilters.has(l.id));
        } else {
            return activeFilters.has('no-label');
        }
    });
    
    const completed = allItems.filter(i => i.complete).length;
    const total = allItems.length;
    const now = new Date();
    const overdue = allItems.filter(i => !i.complete && i.due < now).length;
    const thisWeek = allItems.filter(i => {
        const weekStart = getWeekStart(now);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return i.due >= weekStart && i.due < weekEnd;
    }).length;
    
    const dashboard = document.getElementById('stats-dashboard');
    dashboard.innerHTML = `
        <div class="stat-card" style="--stat-color: #0079bf;">
            <div class="stat-card-value">${filteredItems.length}</div>
            <div class="stat-card-label">Visible Tasks</div>
        </div>
        <div class="stat-card" style="--stat-color: #61bd4f;">
            <div class="stat-card-value">${completed}</div>
            <div class="stat-card-label">Completed</div>
        </div>
        <div class="stat-card" style="--stat-color: ${overdue > 0 ? '#eb5a46' : '#838c91'};">
            <div class="stat-card-value">${overdue}</div>
            <div class="stat-card-label">Overdue</div>
        </div>
        <div class="stat-card" style="--stat-color: #f2d600;">
            <div class="stat-card-value">${thisWeek}</div>
            <div class="stat-card-label">This Week</div>
        </div>
        <div class="stat-card" style="--stat-color: #c377e0;">
            <div class="stat-card-value">${Math.round((completed / total) * 100) || 0}%</div>
            <div class="stat-card-label">Progress</div>
        </div>
    `;
}

function buildFilters() {
    const container = document.getElementById('filter-checkboxes');
    container.innerHTML = '';
    
    const labelSet = new Map();
    parsedItems.forEach(item => {
        if (item.labels.length > 0) {
            item.labels.forEach(l => {
                if (!labelSet.has(l.id)) {
                    labelSet.set(l.id, l);
                }
            });
        } else {
            if (!labelSet.has('no-label')) {
                labelSet.set('no-label', { id: 'no-label', name: 'No Label', color: 'black_light' });
            }
        }
    });
    
    labelSet.forEach((label, id) => {
        const colour = TRELLO_LABEL_COLOURS[label.color] || '#838c91';
        const isChecked = activeFilters.has(id);
        
        const el = document.createElement('label');
        el.className = 'filter-checkbox' + (isChecked ? ' checked' : '');
        el.style.backgroundColor = isChecked ? colour : '';
        el.innerHTML = `
            <input type="checkbox" value="${id}" ${isChecked ? 'checked' : ''}>
            <span class="check-icon">${isChecked ? '✓' : ''}</span>
            <span>${label.name || label.color || 'No Label'}</span>
        `;
        el.dataset.colour = colour;
        
        el.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) {
                activeFilters.add(id);
                el.classList.add('checked');
                el.style.backgroundColor = colour;
                el.querySelector('.check-icon').textContent = '✓';
            } else {
                activeFilters.delete(id);
                el.classList.remove('checked');
                el.style.backgroundColor = '';
                el.querySelector('.check-icon').textContent = '';
            }
            renderStatsDashboard();
            if (currentView === 'timeline') renderTimeline();
            else if (currentView === 'calendar') renderCalendar();
            else if (currentView === 'week') renderWeekView();
        });
        
        container.appendChild(el);
    });
}

function getFilteredItems() {
    return parsedItems.filter(item => {
        const labelMatch = item.labels.length > 0 
            ? item.labels.some(l => activeFilters.has(l.id))
            : activeFilters.has('no-label');
        
        if (!labelMatch) return false;
        if (!showCompleted && item.complete) return false;
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const searchableText = [
                item.name, item.checklist, item.card, item.list, item.assigneeName,
                ...item.labels.map(l => l.name || l.color)
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(query)) return false;
        }
        
        return true;
    });
}

function getColourMap(colourBy, items) {
    const map = {};
    let colourIndex = 0;

    if (colourBy === 'campaign') {
        items.forEach(item => {
            if (!map[item.listId]) {
                map[item.listId] = { name: item.list, colour: COLOURS[colourIndex % COLOURS.length] };
                colourIndex++;
            }
        });
    } else if (colourBy === 'content-type') {
        items.forEach(item => {
            if (item.labels.length > 0) {
                const label = item.labels[0];
                if (!map[label.id]) {
                    const colour = TRELLO_LABEL_COLOURS[label.color] || COLOURS[colourIndex % COLOURS.length];
                    map[label.id] = { name: label.name || label.color, colour: colour };
                    colourIndex++;
                }
            } else {
                if (!map['no-label']) {
                    map['no-label'] = { name: 'No Label', colour: '#838c91' };
                }
            }
        });
    } else if (colourBy === 'checklist') {
        items.forEach(item => {
            if (!map[item.checklistId]) {
                map[item.checklistId] = { name: item.checklist, colour: COLOURS[colourIndex % COLOURS.length] };
                colourIndex++;
            }
        });
    }

    return map;
}

function getItemColourKey(item, colourBy) {
    if (colourBy === 'campaign') return item.listId;
    if (colourBy === 'content-type') return item.labels.length > 0 ? item.labels[0].id : 'no-label';
    if (colourBy === 'checklist') return item.checklistId;
    return 'default';
}

function getGroups(swimlaneBy, items) {
    const groups = new Map();

    items.forEach(item => {
        let key, name;
        
        if (swimlaneBy === 'campaign') {
            key = item.listId;
            name = item.list;
        } else if (swimlaneBy === 'content-type') {
            if (item.labels.length > 0) {
                key = item.labels[0].id;
                name = item.labels[0].name || item.labels[0].color;
            } else {
                key = 'no-label';
                name = 'No Label';
            }
        } else if (swimlaneBy === 'person') {
            key = item.assignee ? item.assignee.id : 'unassigned';
            name = item.assigneeName;
        }

        if (!groups.has(key)) {
            groups.set(key, { id: key, content: name });
        }
    });

    return Array.from(groups.values());
}

function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function linkify(text) {
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener" onclick="event.stopPropagation()">$1</a>');
}

function truncateText(text, maxLength = 40) {
    const displayText = text.replace(urlRegex, '[link]');
    if (displayText.length <= maxLength) return linkify(text);
    return linkify(text.substring(0, maxLength)) + '…';
}

function showItemModal(item, colour) {
    const modal = document.getElementById('item-modal');
    const avatar = document.getElementById('modal-avatar');
    const title = document.getElementById('modal-title');
    const meta = document.getElementById('modal-meta');
    
    const initials = item.assignee ? getInitials(item.assignee.fullName || item.assignee.username) : '?';
    
    avatar.style.backgroundColor = colour;
    avatar.textContent = initials;
    title.innerHTML = linkify(item.name);
    
    meta.innerHTML = `
        <div class="item-modal-meta-row">
            <span class="item-modal-meta-label">Due Date</span>
            <span>${formatDate(item.due)}</span>
        </div>
        <div class="item-modal-meta-row">
            <span class="item-modal-meta-label">Assigned</span>
            <span>${item.assigneeName}</span>
        </div>
        <div class="item-modal-meta-row">
            <span class="item-modal-meta-label">Checklist</span>
            <span>${item.checklist}</span>
        </div>
        <div class="item-modal-meta-row">
            <span class="item-modal-meta-label">Card</span>
            <span><a href="https://trello.com/c/${item.cardShortLink}" target="_blank">${item.card}</a></span>
        </div>
        <div class="item-modal-meta-row">
            <span class="item-modal-meta-label">Campaign</span>
            <span>${item.list}</span>
        </div>
        ${item.labels.length > 0 ? `
        <div class="item-modal-meta-row">
            <span class="item-modal-meta-label">Labels</span>
            <span>${item.labels.map(l => l.name || l.color).join(', ')}</span>
        </div>
        ` : ''}
    `;
    
    modal.classList.remove('hidden');
}

function renderTimeline() {
    const swimlaneBy = document.getElementById('swimlane-select').value;
    const colourBy = document.getElementById('colour-select').value;
    
    const filteredItems = getFilteredItems();
    
    if (filteredItems.length === 0) {
        document.getElementById('stats').textContent = 'No items match the current filters';
        document.getElementById('timeline').innerHTML = '<p style="padding: 40px; text-align: center; color: #5e6c84;">No items to display. Adjust your filters.</p>';
        if (timeline) {
            timeline.destroy();
            timeline = null;
        }
        return;
    }

    const colourMap = getColourMap(colourBy, filteredItems);
    const groups = getGroups(swimlaneBy, filteredItems);

    const statsEl = document.getElementById('stats');
    statsEl.textContent = `${filteredItems.length} items with due dates across ${groups.length} ${swimlaneBy === 'campaign' ? 'campaigns' : swimlaneBy === 'content-type' ? 'content types' : 'people'}`;

    const DAY_MS = 24 * 60 * 60 * 1000;
    
    const items = filteredItems.map(item => {
        let groupId;
        if (swimlaneBy === 'campaign') groupId = item.listId;
        else if (swimlaneBy === 'content-type') groupId = item.labels.length > 0 ? item.labels[0].id : 'no-label';
        else if (swimlaneBy === 'person') groupId = item.assignee ? item.assignee.id : 'unassigned';

        const colourKey = getItemColourKey(item, colourBy);
        const colour = colourMap[colourKey]?.colour || '#838c91';
        const avatarTextColor = getContrastColor(colour);
        
        const initials = item.assignee ? getInitials(item.assignee.fullName || item.assignee.username) : '?';
        const isOverdue = !item.complete && item.due < new Date();
        
        const dueDate = new Date(item.due);
        dueDate.setHours(0, 0, 0, 0);
        
        return {
            id: item.id,
            group: groupId,
            content: `
                <div class="item-content" style="--accent-color: ${colour}; --avatar-text-color: ${avatarTextColor};">
                    <div class="item-avatar">${initials}</div>
                    <div class="item-details">
                        <div class="item-text" title="${item.name.replace(/"/g, '&quot;')}">${truncateText(item.name, 35)}</div>
                        <div class="checklist-tag" title="${item.checklist}"><span class="checklist-icon">☑</span>${item.checklist}</div>
                    </div>
                </div>
            `,
            start: dueDate,
            title: `${item.name}\n\n📅 ${formatDate(item.due)}\n👤 ${item.assigneeName}\n📋 ${item.checklist}\n🗂 ${item.card}\n📁 ${item.list}`,
            className: `${item.complete ? 'complete' : ''} ${isOverdue ? 'overdue' : ''}`.trim(),
            _itemData: item,
            _colour: colour
        };
    });

    const container = document.getElementById('timeline');
    
    if (timeline) {
        timeline.destroy();
    }

    const allDates = filteredItems.map(i => i.due.getTime());
    const minDate = new Date(Math.min(...allDates) - 14 * DAY_MS);
    const maxDate = new Date(Math.max(...allDates) + 14 * DAY_MS);

    const options = {
        orientation: 'top',
        stack: true,
        stackSubgroups: true,
        verticalScroll: true,
        zoomKey: 'ctrlKey',
        maxHeight: 600,
        min: minDate,
        max: maxDate,
        margin: { item: { horizontal: 4, vertical: 6 } },
        tooltip: { followMouse: true, overflowMethod: 'cap' },
        showCurrentTime: true,
        format: {
            minorLabels: { day: 'D', weekday: 'ddd D' }
        },
        timeAxis: { scale: 'day', step: 1 },
        align: 'center'
    };

    timeline = new vis.Timeline(container, items, groups, options);
    
    timeline.on('select', (props) => {
        if (props.items.length > 0) {
            const itemId = props.items[0];
            const timelineItem = items.find(i => i.id === itemId);
            if (timelineItem && timelineItem._itemData) {
                showItemModal(timelineItem._itemData, timelineItem._colour);
            }
            timeline.setSelection([]);
        }
    });
    
    addWeekendHighlights(container, minDate, maxDate);
    
    timeline.on('rangechanged', () => {
        const range = timeline.getWindow();
        addWeekendHighlights(container, range.start, range.end);
    });
}

function addWeekendHighlights(container, start, end) {
    container.querySelectorAll('.weekend-highlight').forEach(el => el.remove());
    
    const centerPanel = container.querySelector('.vis-panel.vis-center');
    if (!centerPanel) return;
    
    const DAY_MS = 24 * 60 * 60 * 1000;
    let current = new Date(start);
    current.setHours(0, 0, 0, 0);
    
    while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            const highlight = document.createElement('div');
            highlight.className = 'weekend-highlight';
            
            const left = timeline.body.util.toScreen(current);
            const nextDay = new Date(current.getTime() + DAY_MS);
            const right = timeline.body.util.toScreen(nextDay);
            
            highlight.style.left = left + 'px';
            highlight.style.width = (right - left) + 'px';
            highlight.style.top = '0';
            highlight.style.bottom = '0';
            
            centerPanel.appendChild(highlight);
        }
        current = new Date(current.getTime() + DAY_MS);
    }
}

function renderCalendar() {
    const filteredItems = getFilteredItems();
    const colourBy = document.getElementById('colour-select').value;
    const colourMap = getColourMap(colourBy, filteredItems);
    
    const itemsByDate = new Map();
    filteredItems.forEach(item => {
        const dateKey = item.due.toISOString().split('T')[0];
        if (!itemsByDate.has(dateKey)) {
            itemsByDate.set(dateKey, []);
        }
        itemsByDate.get(dateKey).push(item);
    });
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendar-title').textContent = `${monthNames[month]} ${year}`;
    
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const dayEl = createCalendarDay(day, true, new Date(year, month - 1, day));
        grid.appendChild(dayEl);
    }
    
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        const dayEl = createCalendarDay(day, false, date, itemsByDate, colourMap, colourBy);
        grid.appendChild(dayEl);
    }
    
    const remainingCells = 42 - (startingDayOfWeek + totalDays);
    for (let day = 1; day <= remainingCells; day++) {
        const dayEl = createCalendarDay(day, true, new Date(year, month + 1, day));
        grid.appendChild(dayEl);
    }
}

function createCalendarDay(dayNumber, isOtherMonth, date, itemsByDate, colourMap, colourBy) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    if (isOtherMonth) dayEl.classList.add('other-month');
    
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        dayEl.classList.add('weekend');
    }
    
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        dayEl.classList.add('today');
    }
    
    const dayNumberEl = document.createElement('div');
    dayNumberEl.className = 'calendar-day-number';
    dayNumberEl.textContent = dayNumber;
    dayEl.appendChild(dayNumberEl);
    
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'calendar-items';
    
    if (!isOtherMonth && itemsByDate && colourMap) {
        const dateKey = date.toISOString().split('T')[0];
        const items = itemsByDate.get(dateKey) || [];
        
        const maxVisible = 3;
        items.slice(0, maxVisible).forEach(item => {
            const colourKey = getItemColourKey(item, colourBy);
            const colour = colourMap[colourKey]?.colour || '#838c91';
            const avatarTextColor = getContrastColor(colour);
            const initials = item.assignee ? getInitials(item.assignee.fullName || item.assignee.username) : '?';
            const isOverdue = !item.complete && item.due < new Date();
            
            const itemEl = document.createElement('div');
            itemEl.className = `calendar-item ${item.complete ? 'complete' : ''} ${isOverdue ? 'overdue' : ''}`.trim();
            itemEl.style.setProperty('--accent-color', colour);
            itemEl.style.setProperty('--avatar-text-color', avatarTextColor);
            itemEl.innerHTML = `
                <div class="calendar-item-name" title="${item.name.replace(/"/g, '&quot;')}">${item.name}</div>
                <div class="calendar-item-meta">
                    <div class="calendar-item-avatar">${initials}</div>
                    <span>${item.checklist}</span>
                </div>
            `;
            itemEl.addEventListener('click', () => showItemModal(item, colour));
            itemsContainer.appendChild(itemEl);
        });
        
        if (items.length > maxVisible) {
            const moreEl = document.createElement('div');
            moreEl.className = 'calendar-item-more';
            moreEl.textContent = `+${items.length - maxVisible} more`;
            itemsContainer.appendChild(moreEl);
        }
    }
    
    dayEl.appendChild(itemsContainer);
    return dayEl;
}

function renderWeekView() {
    const filteredItems = getFilteredItems();
    const colourBy = document.getElementById('colour-select').value;
    const colourMap = getColourMap(colourBy, filteredItems);
    
    const itemsByDate = new Map();
    filteredItems.forEach(item => {
        const dateKey = item.due.toISOString().split('T')[0];
        if (!itemsByDate.has(dateKey)) {
            itemsByDate.set(dateKey, []);
        }
        itemsByDate.get(dateKey).push(item);
    });
    
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const startStr = formatDate(currentWeekStart);
    const endStr = formatDate(weekEnd);
    document.getElementById('week-title').textContent = `Week of ${startStr} - ${endStr}`;
    
    const grid = document.getElementById('week-grid');
    grid.innerHTML = '';
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        
        const column = document.createElement('div');
        column.className = 'week-day-column';
        
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            column.classList.add('weekend');
        }
        
        if (date.getTime() === today.getTime()) {
            column.classList.add('today');
        }
        
        const header = document.createElement('div');
        header.className = 'week-day-header';
        header.innerHTML = `
            <div class="week-day-name">${dayNames[dayOfWeek]}</div>
            <div class="week-day-number">${date.getDate()}</div>
        `;
        column.appendChild(header);
        
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'week-items';
        
        const dateKey = date.toISOString().split('T')[0];
        const items = itemsByDate.get(dateKey) || [];
        
        items.forEach(item => {
            const colourKey = getItemColourKey(item, colourBy);
            const colour = colourMap[colourKey]?.colour || '#838c91';
            const avatarTextColor = getContrastColor(colour);
            const initials = item.assignee ? getInitials(item.assignee.fullName || item.assignee.username) : '?';
            const isOverdue = !item.complete && item.due < new Date();
            
            const itemEl = document.createElement('div');
            itemEl.className = `week-item ${item.complete ? 'complete' : ''} ${isOverdue ? 'overdue' : ''}`.trim();
            itemEl.style.setProperty('--accent-color', colour);
            itemEl.style.setProperty('--avatar-text-color', avatarTextColor);
            itemEl.innerHTML = `
                <div class="week-item-name">${item.name}</div>
                <div class="week-item-meta">
                    <div class="week-item-avatar">${initials}</div>
                    <div class="week-item-checklist"><span>☑</span> ${item.checklist}</div>
                </div>
            `;
            itemEl.addEventListener('click', () => showItemModal(item, colour));
            itemsContainer.appendChild(itemEl);
        });
        
        column.appendChild(itemsContainer);
        grid.appendChild(column);
    }
}

function switchView(view) {
    currentView = view;
    
    document.getElementById('view-timeline').classList.toggle('active', view === 'timeline');
    document.getElementById('view-week').classList.toggle('active', view === 'week');
    document.getElementById('view-calendar').classList.toggle('active', view === 'calendar');
    
    document.getElementById('timeline').classList.toggle('hidden', view !== 'timeline');
    document.getElementById('week-view').classList.toggle('hidden', view !== 'week');
    document.getElementById('calendar').classList.toggle('hidden', view !== 'calendar');
    
    document.getElementById('swimlane-select').parentElement.style.display = 
        view === 'timeline' ? 'flex' : 'none';
    
    if (view === 'calendar') {
        renderCalendar();
    } else if (view === 'week') {
        renderWeekView();
    }
}

function setupEventListeners() {
    // View toggle
    document.getElementById('view-timeline').addEventListener('click', () => switchView('timeline'));
    document.getElementById('view-week').addEventListener('click', () => switchView('week'));
    document.getElementById('view-calendar').addEventListener('click', () => switchView('calendar'));
    
    // Week navigation
    document.getElementById('prev-week').addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderWeekView();
    });
    
    document.getElementById('next-week').addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderWeekView();
    });
    
    document.getElementById('this-week').addEventListener('click', () => {
        currentWeekStart = getWeekStart(new Date());
        renderWeekView();
    });
    
    // Search and filters
    document.getElementById('search-input').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderStatsDashboard();
        if (currentView === 'timeline') renderTimeline();
        else if (currentView === 'calendar') renderCalendar();
        else if (currentView === 'week') renderWeekView();
    });
    
    document.getElementById('show-completed').addEventListener('change', (e) => {
        showCompleted = e.target.checked;
        renderStatsDashboard();
        if (currentView === 'timeline') renderTimeline();
        else if (currentView === 'calendar') renderCalendar();
        else if (currentView === 'week') renderWeekView();
    });
    
    // Calendar navigation
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        renderCalendar();
    });
    
    document.getElementById('today-btn').addEventListener('click', () => {
        currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);
        renderCalendar();
    });
    
    // Controls
    document.getElementById('swimlane-select').addEventListener('change', renderTimeline);
    document.getElementById('colour-select').addEventListener('change', () => {
        if (currentView === 'timeline') renderTimeline();
        else if (currentView === 'calendar') renderCalendar();
        else if (currentView === 'week') renderWeekView();
    });
    
    // Toggle all filters
    document.getElementById('toggle-all-filters').addEventListener('click', () => {
        const allChecked = activeFilters.size === allLabelIds.size;
        
        if (allChecked) {
            activeFilters.clear();
            document.getElementById('toggle-all-filters').textContent = 'Select All';
        } else {
            activeFilters = new Set(allLabelIds);
            document.getElementById('toggle-all-filters').textContent = 'Deselect All';
        }
        
        const container = document.getElementById('filter-checkboxes');
        container.querySelectorAll('.filter-checkbox').forEach(el => {
            const input = el.querySelector('input');
            const id = input.value;
            const isChecked = activeFilters.has(id);
            input.checked = isChecked;
            el.classList.toggle('checked', isChecked);
            el.style.backgroundColor = isChecked ? el.dataset.colour : '';
            el.querySelector('.check-icon').textContent = isChecked ? '✓' : '';
        });
        
        renderStatsDashboard();
        if (currentView === 'timeline') renderTimeline();
        else if (currentView === 'calendar') renderCalendar();
        else if (currentView === 'week') renderWeekView();
    });
    
    // Modal close
    document.getElementById('item-modal').addEventListener('click', (e) => {
        if (e.target.id === 'item-modal') {
            document.getElementById('item-modal').classList.add('hidden');
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('item-modal').classList.add('hidden');
        }
    });
}

// Initialize on load
init();
