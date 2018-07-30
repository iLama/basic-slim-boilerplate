var UIkit = require('uikit'),
    Icons = require('uikit/dist/js/uikit-icons');

// loads the Icon plugin
UIkit.use(Icons);

// components can be called from the imported UIkit reference
UIkit.notification('Hello world.');
