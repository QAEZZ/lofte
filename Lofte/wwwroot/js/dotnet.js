
function callDotNet(message) {
    window.external.sendMessage(message);
}

window.external.receiveMessage(message => {
    message = JSON.parse(message);
    switch (message.Msg) {
        case "FileExplorer":
            let json_string = JSON.stringify(message.Data[0]);
            console.log(json_string);
            processFileExplorerData(message.Data[0]);
            break;
        default:
            console.log(`Unknown message, ${message.Msg}:\n${message.Data}`);
            break;
    }
});


document.addEventListener("DOMContentLoaded", function (e) {
    callDotNet('{"Msg": "GetFileExplorer", "Data": []}');
});

function processFileExplorerData(jsonData) {
    let data = JSON.parse(jsonData.replace(/\\/g, ""));
    let container = document.getElementById('js-sidebar-content');

    function createFileExplorer(parentElement, node, depth) {
        if (node.IsDirectory) {
            let details = document.createElement('details');
            details.classList.add('folder');
            details.setAttribute('data-path', node.Path);
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
            textNode.setAttribute('data-path', textNode.Path);
            textNode.innerHTML = node.Name;
            iconSpan.appendChild(textNode);
    
            summary.appendChild(iconSpan);
            details.appendChild(summary);
    
            if (depth > 0) {
                summary.style.marginLeft = depth * 10 + 'px';
            }
    
            details.addEventListener('toggle', function() {
                if (details.open) {
                    iconClosed.style.display = 'none';
                    iconOpen.style.display = 'inline';
                } else {
                    iconClosed.style.display = 'inline';
                    iconOpen.style.display = 'none';
                }
            });
    
            let Children = node.Children || [];
            for (let child of Children) {
                createFileExplorer(details, child, depth + 1);
            }
        } else {
            // File
            let summary = document.createElement('summary');
            let iconSpan = document.createElement('span');
            let iconFile = document.createElement('i');
            iconFile.className = 'ph-bold ph-file';
            iconSpan.appendChild(iconFile);
            let textNode = document.createElement('p');
            textNode.setAttribute('data-path', textNode.Path);
            textNode.innerHTML = node.Name;
            iconSpan.appendChild(textNode);
            summary.appendChild(iconSpan);
    
            parentElement.appendChild(summary);
            summary.classList.add('file');
    
            if (depth > 0) {
                summary.style.marginLeft = depth * 10 + 'px';
            }
        }
    }
    
    
    createFileExplorer(container, data, 0);
}

