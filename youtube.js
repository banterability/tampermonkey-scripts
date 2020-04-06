// ==UserScript==
// @name         Delete from Youtube "Watch Later"
// @namespace    https://www.youtube.com/
// @version      0.9
// @description  Always show delete buttons on YouTube's Watch Later list
// @author       Jeff Long
// @match        https://www.youtube.com/playlist?list=WL&disable_polymer=true
// @grant        none
// ==/UserScript==

(function() {
  "use strict";
  Array.from(
    document.querySelectorAll('.yt-uix-button[title="Remove"]')
  ).forEach(node => (node.style.left = "auto"));
})();
