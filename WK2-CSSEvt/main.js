var adjust = () => {
  /* adjust CSS animation */
  let line = document.querySelector("#line");
  let wwidth = Math.ceil(window.innerWidth * 0.8);
  let lwidth = line.scrollWidth;
  let end;
  let duration;
  if (lwidth < wwidth) {
    // checks whether the line width is less than the window width
    end = 0; // if so, the animation should end when the first word reached the end of the window
    duration = Math.ceil(wwidth / 100);
  } else {
    end = (lwidth - Math.ceil(wwidth * 0.5)) * -1;
    duration = Math.ceil(lwidth / 100);
  }
  console.log(
    `wwidth: ${wwidth}, lwidth: ${lwidth}, end: ${end}, duration: ${duration}`
  );
  let root = document.querySelector(":root");
  root.style.setProperty("--ani-end-margin", end + "px");
  root.style.setProperty("--ani-duration", duration + "s");
  
  /* select the block to show */
  let selection = "blk1";
  let selected = "block1";
  let select = document.getElementById("selector");

  select.addEventListener("click", (event) => {
    if (event.target.id === selection) {
      return;
    }
    switch (event.target.id) {
      case "blk1":
        document.getElementById(selected).style.display = "none";
        selection = "blk1";
        selected = "block1";
        document.getElementById("block1").style.display = "block";
        break;
      case "blk2":
        document.getElementById(selected).style.display = "none";
        selection = "blk2";
        selected = "block2";
        document.getElementById("block2").style.display = "block";
        break;
      case "blk3":
        document.getElementById(selected).style.display = "none";
        selection = "blk3";
        selected = "block3";
        document.getElementById("block3").style.display = "block";
        break;
      case "blk4":
        document.getElementById(selected).style.display = "none";
        selection = "blk4";
        selected = "block4";
        document.getElementById("block4").style.display = "block";
        break;
    }
  });
};

window.addEventListener("DOMContentLoaded", adjust);
window.addEventListener("resize", (event) => {
  adjust();
});
