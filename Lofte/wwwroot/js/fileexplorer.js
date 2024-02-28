const directory_upload_button = document.getElementById('js-directory-upload-button');
const directory_input = document.getElementById('js-directory-input');

function selectFolder(e) {
    var theFiles = e.target.files;
    var relativePath = theFiles[0].webkitRelativePath;
    var folder = relativePath.split("/");
    alert(relativePath);
}

directory_upload_button.addEventListener('click', function (e) {
    // directory_input.click();
    alert("Currently work in progress, run Lofte in the directory you want, like running code from a terminal.");
});