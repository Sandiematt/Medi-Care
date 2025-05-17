// global.js - Polyfills for Node.js globals in React Native

// Process polyfill
global.process = global.process || {};
global.process.env = global.process.env || {};
global.process.cwd = function() { return '/'; }; // Mocked cwd function
global.process.browser = true;

// Buffer polyfill if needed
if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// Other polyfills can be added as needed 