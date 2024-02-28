// https://codepen.io/rod911/details/wvzPjEV

var resize = document.querySelector("#js-resize");
var left = document.querySelector(".sidebar");
var container = document.querySelector("#resize-container");
var moveX =
   left.getBoundingClientRect().width +
   resize.getBoundingClientRect().width / 2;

var drag = false;
resize.addEventListener("mousedown", function (e) {
   drag = true;
   moveX = e.x;
});

container.addEventListener("mousemove", function (e) {
   moveX = e.x;
   if (drag)
      left.style.width =
         moveX - resize.getBoundingClientRect().width / 2 + "px";
});

container.addEventListener("mouseup", function (e) {
   drag = false;
});