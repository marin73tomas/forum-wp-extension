jQuery(document).ready(function ($) {
  $("multi").MultiFile();
});

function ready(callback) {
  // in case the document is already rendered
  if (document.readyState != "loading") callback();
  // modern browsers
  else if (document.addEventListener)
    document.addEventListener("DOMContentLoaded", callback);
  // IE <= 8
  else
    document.attachEvent("onreadystatechange", function () {
      if (document.readyState == "complete") callback();
    });
}

ready(async function () {
  try {
    if (document.querySelector(".fmwp-create-topic")) {
      let container = null;
      const interval = setInterval(() => {
        container = document.querySelector(
          ".mce-container.mce-btn-group > div"
        );
        if (container) {
          const form = container.closest("form");

          form.setAttribute("enctype", "multipart/form-data");
          const extension = document.querySelector(".fwe-extension");
          const last = container.querySelector(".mce-last");
          if (last) {
            last.classList.remove("mce-last");
            last.style.display = "none";
          }
          container.appendChild(extension);

          clearInterval(interval);
          console.log("success");
        }
      }, 250);
    }
  } catch (error) {
    console.error(error);
  }
});
