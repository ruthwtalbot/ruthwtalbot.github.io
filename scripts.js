
var count = 0;
var onWindowLoaded = function() {
  setTimeout(timerRunner, 0);
}

var timerRunner = function() {
    switchDisplay()
    setTimeout(timerRunner, 3000);
}

var switchDisplay = function() {
  console.log("here")
  var element = document.getElementById("img-" + (count % 6));
  element.classList.add("text");
  var oldElement = document.getElementById("img-" + (count - 1) % 6);
  if (oldElement) oldElement.classList.remove("text");

  count++;
}


// wait for images to load
window.onload = onWindowLoaded;