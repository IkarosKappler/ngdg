"use strict";
/* Imports and exports for webpack */

// Expose main object to the global scope.
// globalThis.alloy_finger = require("./index.js");

// For the browser
globalThis.AlloyFinger = globalThis.alloy_finger = require("./index.js").AlloyFinger;
