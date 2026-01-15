/* global TrelloPowerUp */

// Initialize the Power-Up
TrelloPowerUp.initialize({
  // Add board button to access the timeline
  'board-buttons': function(t, options) {
    return [{
      icon: {
        dark: './images/icon-light.svg',
        light: './images/icon-dark.svg'
      },
      text: 'Timeline View',
      callback: function(t) {
        return t.modal({
          url: './timeline.html',
          fullscreen: true,
          title: 'Timeline Viewer'
        });
      }
    }];
  },
  
  // Add settings capability (optional - for future enhancements)
  'show-settings': function(t, options) {
    return t.popup({
      title: 'Timeline Settings',
      url: './settings.html',
      height: 184
    });
  }
});
