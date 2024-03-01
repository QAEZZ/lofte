const text_editor = document.getElementById('js-text-editor-content');
const text_editor_textarea = document.getElementById('js-text-editor');

function callDotNet(message) {
    window.external.sendMessage(message);
}

window.external.receiveMessage(message => {
    message = JSON.parse(message);
    switch (message.Msg) {
        case "FileExplorer":
            console.log("Received FileExplorer message.");
            processFileExplorerData(message.Data[0]);
            break;
        case "FileContent":
            let data = JSON.parse(message.Data[0].replace(/\\\\/g, "/").replace(/\\/g, "/"));

            let b64_string = data.Content;
            let file_path = data.Path;

            // console.log(`FileContent data:\n${JSON.stringify(data)}`);

            processFileContentData(b64_string, file_path);
            break;
        default:
            console.log(`Unknown message, ${message.Msg}:\n${message.Data}`);
            break;
    }
});

function processFileExplorerData(jsonData) {
    let data = JSON.parse(jsonData.replace(/\\\\/g, "/"));
    let container = document.getElementById('js-sidebar-content');

    function createFileExplorer(parentElement, node, depth) {
        if (node.IsDirectory) {
            let details = document.createElement('details');
            details.classList.add('folder');
            parentElement.appendChild(details);

            let summary = document.createElement('summary');
            summary.classList.add('folder');

            let iconSpan = document.createElement('span');
            let iconClosed = document.createElement('i');
            iconClosed.className = 'ph-fill ph-folder-simple';
            iconSpan.appendChild(iconClosed);
            let iconOpen = document.createElement('i');
            iconOpen.className = 'ph-fill ph-folder-open';
            iconOpen.style.display = 'none'; // Initially hide the open folder icon
            iconSpan.appendChild(iconOpen);

            let textNode = document.createElement('p');
            textNode.innerHTML = node.Name;
            iconSpan.appendChild(textNode);

            summary.appendChild(iconSpan);
            details.appendChild(summary);

            if (depth > 0) {
                summary.style.marginLeft = depth * 10 + 'px';
            }

            details.addEventListener('toggle', function () {
                if (details.open) {
                    iconClosed.style.display = 'none';
                    iconOpen.style.display = 'inline';
                } else {
                    iconClosed.style.display = 'inline';
                    iconOpen.style.display = 'none';
                }
            });

            let Children = node.Children || [];
            for (let i = 0; i < Children.length; i++) {
                createFileExplorer(details, Children[i], depth + 1);
            }
        } else {
            // File
            let summary = document.createElement('summary');
            let iconSpan = document.createElement('span');
            let iconFile = document.createElement('i');
            iconFile.className = 'ph-bold ph-file';
            iconSpan.appendChild(iconFile);
            let textNode = document.createElement('p');
            textNode.innerHTML = node.Name;
            iconSpan.appendChild(textNode);
            summary.appendChild(iconSpan);

            parentElement.appendChild(summary);
            summary.classList.add('file');
            summary.setAttribute('data-path', node.Path);

            if (depth > 0) {
                summary.style.marginLeft = depth * 10 + 'px';
            }
        }
    }

    createFileExplorer(container, data, 0);

    let files = document.getElementsByClassName("file");
    for (let file of files) {
        file.addEventListener("click", function (e) {
            let path = file.getAttribute('data-path');
            console.log(`SENT: {"Msg": "GetFileContent", "Data": ['${path}']}`);
            callDotNet(`{"Msg": "GetFileContent", "Data": ['${path}']}`);
        });
    }
}


function processFileContentData(b64_string, file_path) {
    let fileInformation = analyzeBase64(b64_string, file_path);

    switch (fileInformation.type) {
        case "text/plain":
            let content = new TextDecoder('utf-8').decode(fileInformation.content);
            text_editor.textContent = content;
            text_editor_textarea.value = content;
            // hljs.highlightAll();
            Prism.highlightElement(text_editor);
            break;
        case "image/jpeg":
        case "image/png":
            let img = document.createElement('img');
            img.src = 'data:' + fileInformation.type + ';base64,' + b64_string;
            img.style.display = 'block';
            img.style.margin = "auto auto";
            text_editor.textContent = '';
            text_editor.appendChild(img);
            break;
        default:
            text_editor.textContent = "The file is not displayed in the text editor because it is either binary or uses an unsupported text encoding.";
            break;
    }


    function decodeBase64(base64String) {
        try {
            let binaryString = atob(base64String);
            let byteArray = new Uint8Array(binaryString.length);

            for (let i = 0; i < binaryString.length; i++) {
                byteArray[i] = binaryString.charCodeAt(i);
            }

            return byteArray;
        } catch (error) {
            return `Something went wrong: ${error}`;
        }
    }

    function isTextReadable(decodedBytes) {
        // Text files are unlikely to have null bytes ('\x00') at the start of the file.
        // Shout-out ChatGPT for this method of detecting if the file is text readable.
        const MAX_CHECK_BYTES = 1024;
        let checkLength = Math.min(decodedBytes.length, MAX_CHECK_BYTES);

        for (let i = 0; i < checkLength; i++) {
            if (decodedBytes[i] === 0) {
                return false; // Binary file detected
            }
        }

        return true; // Likely a text file
    }


    // function analyzeBase64(base64String, file_path) {
    //     let decodedBytes = decodeBase64(base64String);

    //     let extension = file_path.split('.').pop().toLowerCase();
    //     console.log(`Extension: ${extension}`);

    //     let fileType = 'application/octet-stream'; // Default to binary file
    //     if (['txt', 'text'].includes(extension)) {
    //         fileType = 'text/plain';
    //     } else if (['jpg', 'jpeg'].includes(extension)) {
    //         fileType = 'image/jpeg';
    //     } else if (extension === 'png') {
    //         fileType = 'image/png';
    //     }

    //     console.log('File Type:', fileType);

    //     // Decode base64 string
    //     let decodedBytes = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));

    //     // Convert the decoded bytes to a string if it's a text file
    //     let content = (fileType === 'text/plain') ? new TextDecoder('utf-8').decode(decodedBytes) : decodedBytes;

    //     return {
    //         type: fileType,
    //         content: content
    //     };
    // }



    function analyzeBase64(base64String, file_path) {
        let decodedBytes = decodeBase64(base64String);

        let extension = file_path.split('.').pop().toLowerCase();
        console.log(`Extension: ${extension}`);

        let fileType = 'application/octet-stream'; // Default to binary file
        if (isTextReadable(decodedBytes)) {
            fileType = 'text/plain';
        } else if (['jpg', 'jpeg'].includes(extension)) {
            fileType = 'image/jpeg';
        } else if (extension === 'png') {
            fileType = 'image/png';
        }

        console.log('File Type:', fileType);
        return {
            type: fileType,
            content: decodedBytes
        };
    }


    // function analyzeBase64(base64String, file_path) {
    //     let decodedBytes = decodeBase64(base64String);

    //     let extension = file_path.split('.').pop().toLowerCase();
    //     console.log(`Extension: ${extension}`);

    //     let fileType = 'application/octet-stream'; // Default to binary file
    //     if (isTextReadable(decodedBytes)) {
    //         fileType = 'text/plain';
    //     } else if (['jpg', 'jpeg'].includes(extension)) {
    //         fileType = 'image/jpeg';
    //     } else if (extension === 'png') {
    //         fileType = 'image/png';
    //     }

    //     console.log('File Type:', fileType);
    //     return fileType;
    // }

}


document.addEventListener("DOMContentLoaded", function (e) {
    callDotNet('{"Msg": "GetFileExplorer", "Data": []}');
});