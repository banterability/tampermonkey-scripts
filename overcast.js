// ==UserScript==
// @name         Overcast Delete + Summary Stats
// @namespace    http://overcast.fm
// @version      1.0
// @description  Add delete buttons, hide podcasts, and summary statistics to Overcast
// @author       Jeff Long
// @match        https://overcast.fm/podcasts
// @grant        none
// ==/UserScript==

(function() {
  "use strict";
  var CONSTANTS = {
    days: 1000 * 60 * 60 * 24,
    hours: 1000 * 60 * 60,
    minutes: 1000 * 60
  };

  function removeFeeds() {
    Array.from(document.querySelectorAll(".feedcell")).forEach(node =>
      node.remove()
    );
  }

  function extractTimeElement(time, value, constant) {
    var elapsed;
    if (time > constant) {
      elapsed = Math.floor(time / constant);
      time = time - constant * elapsed;
    } else {
      elapsed = 0;
    }
    return {
      time: time,
      value: value,
      elapsed: elapsed
    };
  }

  function spellOut(totalTime) {
    var constantName,
      constantValue,
      elapsed,
      output,
      ref,
      time,
      totalTime,
      value;
    output = {};

    for (constantName in CONSTANTS) {
      constantValue = CONSTANTS[constantName];
      (ref = extractTimeElement(totalTime, constantName, constantValue)),
        (time = ref.time),
        (value = ref.value),
        (elapsed = ref.elapsed);
      totalTime = time;
      output[value] = elapsed;
    }
    return output;
  }

  function getTotalTime() {
    const totalMinutes = Array.from(
      document.querySelectorAll(".episodecell .titlestack .caption2:last-child")
    )
      .map(node => {
        let timeString = node.textContent.split(" • ")[1] || "";
        return timeString.trim();
      })
      .filter(timeString => !timeString.match(/^at /))
      .map(timeString => parseInt(timeString, 10))
      .filter(mins => !isNaN(mins))
      .reduce((memo, val) => {
        return memo + val;
      }, 0);

    const result = spellOut(totalMinutes * 60 * 1000);
    const resultData = Object.keys(result)
      .map(key => `${result[key]} ${key}`)
      .join(", ");
    return `More than ${resultData}`;
  }

  function getEpisodeDeleteLink(url, cb) {
    fetch(url)
      .then(function(res) {
        return res.text();
      })
      .then(function(bodyString) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(bodyString, "text/html");
        var episodeId = doc.querySelector("#audioplayer").dataset.itemId;
        cb("/podcasts/delete_item/" + episodeId);
      });
  }

  function createSummaryElement() {
    let summaryEl = document.createElement("div");
    let episodeCount = document.querySelectorAll(".episodecell").length;

    summaryEl.innerHTML = `<span id="episode-count">${episodeCount}</span> episodes<br><span id="total-time">${getTotalTime()}</span>`;

    const styles = {
      right: 0,
      top: 0,
      border: "2px solid black",
      padding: "5px",
      position: "fixed"
    };

    Object.keys(styles).map(key => (summaryEl.style[key] = styles[key]));

    document.body.appendChild(summaryEl);
  }

  function init() {
    var episodeNodes = Array.from(document.querySelectorAll(".episodecell"));
    episodeNodes.forEach(function(node) {
      var button = document.createElement("button");
      button.textContent = "Delete";
      button.style.right = 0;
      button.style.position = "absolute";

      button.addEventListener(
        "click",
        function(ev) {
          ev.preventDefault();

          const el = ev.target.parentElement;
          const episodeUrl = el.getAttribute("href");

          el.remove();

          getEpisodeDeleteLink(episodeUrl, deleteUrl => {
            fetch(deleteUrl, { credentials: "same-origin" }).then(() => {
              let episodeCountEl = document.querySelector("#episode-count");
              let totalTimeEl = document.querySelector("#total-time");
              let count = parseInt(episodeCountEl.textContent, 10);
              let totalTime = getTotalTime();
              episodeCountEl.textContent = count - 1;
              totalTimeEl.textContent = totalTime;
            });
          });
        },
        false
      );

      node.appendChild(button);
    });

    Array.from(document.querySelectorAll(".pure-u-sm-3-5")).map(
      node => (node.style.width = "100%")
    );

    removeFeeds();
    createSummaryElement();
  }

  init();
})();
