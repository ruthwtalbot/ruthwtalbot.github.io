var count = 0;
var workLinks = [
  {
    text: "NPR 2020 Election Displays",
    link: "https://apps.npr.org/elections20-interactive/",
    img: "elections",
  },
  {
    text: "Iowa Polling Places",
    link:
      "https://www.npr.org/2020/10/29/928315049/polling-places-are-closing-due-to-covid-19-it-could-tip-races-in-1-swing-state",
    img: "iowa",
  },
  {
    text: "Iowa Polling Places",
    link:
      "https://www.npr.org/2020/10/29/928315049/polling-places-are-closing-due-to-covid-19-it-could-tip-races-in-1-swing-state",
    img: "iowa",
  },
  {
    text: "NPR World COVID-19 Tracker",
    link:
      "https://www.npr.org/sections/goatsandsoda/2020/03/30/822491838/coronavirus-world-map-tracking-the-spread-of-the-outbreak",
    img: "world-tracker",
  },
];

var onWindowLoaded = function () {
  createWorkLinks()
  // setTimeout(timerRunner, 0);
};

var timerRunner = function () {
  switchDisplay();
  setTimeout(timerRunner, 3000);
};

var switchDisplay = function () {
  console.log("here");
  var element = document.getElementById("img-" + (count % 6));
  element.classList.add("text");
  var oldElement = document.getElementById("img-" + ((count - 1) % 6));
  if (oldElement) oldElement.classList.remove("text");

  count++;
};

var createWorkLinks = function() {
  var work = document.getElementById("work");
  var column; 
  for (link in workLinks) {
    if 
  }
}

// wait for images to load
window.onload = onWindowLoaded;
