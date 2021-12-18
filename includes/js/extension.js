function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}
async function displayUploadedFiles(contentContainer, postId) {
  const url = `/wp-json/fwe/v1/frontend/${postId}`;
  const response = await fetch(url);
  const html = await response.text();

  if (html) {
    let div = null;
    if ((div = contentContainer.querySelector(".fwe-frontend"))) {
      div.innerHTML = html;
      return;
    }
    div = document.createElement("div");
    div.className = "fwe-frontend";
    div.innerHTML = html;
    contentContainer.appendChild(div);
  }
}
async function setFilesFromServer(gallery, postId) {
  const url = `/wp-json/fwe/v1/files/${postId}`;
  console.log({ url });
  console.log({ postId });
  const response = await fetch(url);
  const data = JSON.parse(await response.text());
  console.log(gallery, data);
  if (data && data.length >= 1) {
    window.topicFiles = data.map((file) => ({
      file,
      uid: Math.random().toString(36).slice(-6),
      server: true,
    }));

    gallery.innerHTML = "";
    for (let file of window.topicFiles) {
      console.log(file);
      let div = document.createElement("div");
      div.id = file.uid;
      let src = file.file.type.includes("image")
        ? file.file.url
        : "/wp-includes/images/media/document.png";

      div.innerHTML = `
    <a><i class="fas fa-times-circle"></i></a>
    <img src="${src}" alt="" />
    `;
      div.addEventListener("click", function (e) {
        e.stopPropagation();
        window.topicFiles.map((file) => {
          // console.log(file.uid, div.id, file.uid == div.id);
          if (file.uid == div.id && file.server) file.toDelete = true;
          return file;
        });
        gallery.removeChild(div);
      });
      gallery.appendChild(div);
    }
  } else window.topicFiles = [];
}
function highlight(e) {
  dropArea.classList.add("highlight");
}

function unhighlight(e) {
  dropArea.classList.remove("active");
}

function handleDrop(e, parent) {
  var dt = e.dataTransfer;
  var files = dt.files;
  handleFiles(null, files, parent);
}

function handleFiles(element, files, parent) {
  if (!parent && element) {
    console.log(element);
    parent = element.closest("form");
  }
  files = [...files];
  const uid = Math.random().toString(36).slice(-6);
  files.forEach((f) => uploadFile(f, uid));
  files.forEach((f) => previewFile(f, uid, parent));
}

function previewFile(file, uid, parent) {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  console.log(uid);
  reader.onloadend = function () {
    const gallery = parent.querySelector(".fwe-extension-modal .gallery");
    let div = document.createElement("div");
    console.log(uid);
    div.id = uid;
    let src = reader.result.match("data:image*")
      ? reader.result
      : "/wp-includes/images/media/document.png";
    div.innerHTML = `
    <a><i class="fas fa-times-circle"></i></a>
    <img src="${src}" alt="" />
    `;
    div.addEventListener("click", function (e) {
      e.stopPropagation();
      window.topicFiles.map((file) => {
        if (file.uid == div.id && file.server) file.toDelete = true;
        return file;
      });
      gallery.removeChild(div);
    });
    gallery.appendChild(div);
  };
}

function uploadFile(file, uid) {
  window.topicFiles.push({ file, uid });
}
function setUpOnReply() {
  document.addEventListener("mousedown", function (e) {
    var target = e.target;
    if (target && target.className == "fmwp-show-child-replies") {
      console.log("entro");
      const parentRow = target.closest(".fmwp-reply-row");
      let children = null;
      const childrenInterval = setInterval(function () {
        children = parentRow.querySelectorAll(".fmwp-reply-children > div");
        if (children && children.length >= 1) {
          clearInterval(childrenInterval);
          for (let child of children) {
            const replyID = child.getAttribute("data-reply_id");
            displayUploadedFiles(
              child.querySelector(
                `div[data-reply_id='${replyID}'] .fmwp-reply-content`
              ),
              replyID
            );
          }
        }
      }, 250);
      return;
    }
    const classes = ["fmwp-edit-reply", "fmwp-write-reply"];
    if (target && classes.some((c) => target.classList.contains(c))) {
      console.log("here 2")
      const uid = Math.floor(Math.random() * 1000000000);
      const replyButtonHTML = `
      <div class="fwe-extension mce-widget mce-btn mce-last">
                    <a>Upload Files</a>

                    <div class="modal micromodal-slide" id="modal-${uid}" aria-hidden="true">
                         <div class="modal__overlay" tabindex="-${uid}" data-micromodal-close>
                              <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-${uid}-title">
                                   <header class="modal__header">
                                        <h2 class="modal__title" id="modal-${uid}-title">
                                             Upload Files
                                        </h2>
                                        <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
                                   </header>
                                   <main class="modal__content" id="modal-${uid}-content">
                                        <div class="fwe-extension-modal">
                                             <div class="drop-area">
                                                  <p>Upload multiple files with the file dialog or by dragging and dropping images onto the dashed region</p>
                                                  <input type="file" id="fileElemreply" multiple onchange="handleFiles(this, this.files)">
                                                  <label class="button" for="fileElemreply">Select some files</label>
                                             </div>
                                             <div class="gallery"></div>
                                        </div>
                                   </main>
                              </div>
                         </div>
                    </div>

               </div>
      `;
      try {
        window.topicFilesReply = [];
        let container = null;
        const interval = setInterval(async () => {
          container = document.querySelector(
            "#fmwp-reply-popup-wrapper .mce-container.mce-btn-group > div"
          );
          console.log("inside");
          if (container) {
            console.log("in");
            clearInterval(interval);

            const form = container.closest("form");

            form.setAttribute("enctype", "multipart/form-data");
            form.setAttribute("action", "upload.php");
            const extension = document.createElement("div");
            extension.innerHTML = replyButtonHTML;
            extension
              .querySelector("a")
              .addEventListener("click", async function () {
                MicroModal.show(`modal-${uid}`); // [1]
              });

            const last = container.querySelector(".mce-last");
            if (last) {
              last.classList.remove("mce-last");
              last.style.display = "none";
            }

            container.appendChild(extension);
            let replyId = null;
            const replyInterval = setInterval(async () => {
              replyId = form.querySelector(
                'input[name="fmwp-reply[reply_id]"]'
              ).value;
              if (replyId) {
                clearInterval(replyInterval);
                await setFilesFromServer(
                  form.querySelector(".gallery"),
                  replyId
                );
              }
            }, 250);

            setUpDrapAndDrop(extension);
            console.log("reply files loaded");
          }
        }, 250);
      } catch (error) {
        console.error(error);
      }
    }
  });
}
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
function setUpDrapAndDrop(parent) {
  // ************************ Drag and drop ***************** //
  dropArea = parent.querySelector(".drop-area");

  // Prevent default drag behaviors
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Highlight drop area when item is dragged over it
  ["dragenter", "dragover"].forEach((eventName) => {
    dropArea.addEventListener(eventName, highlight, false);
  });
  ["dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  // Handle dropped files
  dropArea.addEventListener("drop", handleDrop.bind(null, parent), false);
}
ready(async function () {
  try {
    setUpOnReply();
    let editBtn = null;
    window.topicFiles = [];

    if (
      document.querySelector(".fmwp-create-topic") ||
      (editBtn = document.querySelector(".fmwp-edit-topic"))
    ) {
      const topicId = document
        .querySelector(".fmwp-topic-base")
        .getAttribute("data-topic_id");
      const content = document.querySelector(".fmwp-topic-data-content");
      displayUploadedFiles(content, topicId);
      let replies = null;

      const replyDataInterval = setInterval(() => {
        replies = document.querySelectorAll(".fmwp-reply-row");
        console.log({ replies });
        if (replies && replies.length > 0) {
          clearInterval(replyDataInterval);
          for (let reply of replies) {
            const replyID = reply.getAttribute("data-reply_id");
            const replyContent = reply.querySelector(".fmwp-reply-content");
            displayUploadedFiles(replyContent, replyID);
          }
        }
      }, 250);

      let container = null;

      const interval = setInterval(async () => {
        container = document.querySelector(
          `${
            editBtn ? "#wp-fmwptopiccontent-wrap " : ""
          }.mce-container.mce-btn-group > div`
        );

        if (container) {
          clearInterval(interval);

          const form = container.closest("form");

          form.setAttribute("enctype", "multipart/form-data");
          form.setAttribute("action", "upload.php");
          const extension = document.querySelector(".fwe-extension");

          extension
            .querySelector("a")
            .addEventListener("click", async function () {
              MicroModal.show("modal-1"); // [1]
            });

          const last = container.querySelector(".mce-last");
          if (last) {
            last.classList.remove("mce-last");
            last.style.display = "none";
          }

          container.appendChild(extension);
          if (editBtn) {
            console.log(form.querySelector(".gallery"));

            await setFilesFromServer(form.querySelector(".gallery"), topicId);
          }
          setUpDrapAndDrop(extension);
          console.log("files loaded");
        }
      }, 250);
    }
  } catch (error) {
    console.error(error);
  }
});
