using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Newtonsoft.Json;
using PhotinoNET;

namespace LofteApp.Communication;

public class Communicator
{
    public class MessageObject
    {
        public string? msg { get; set; }
        public string[]? data { get; set; }
    }

    private static string CreateMessage(string message, string[] data)
    {
        var messageObject = new MessageObject { msg = message, data = data };

        return JsonConvert.SerializeObject(messageObject);
    }

    public static void ProcessMessage(
        object? photinoWindow,
        ref string message, /*we make this a ref because it could be pretty big*/
        params string[] kwargs
    )
    {
        PhotinoWindow? window = (PhotinoWindow)photinoWindow ?? throw new NullReferenceException();

        MessageObject? messageJson = JsonConvert.DeserializeObject<MessageObject>(message);

        switch (messageJson.msg)
        {
            case "GetFileExplorer":
                GetFileExplorer(window, messageJson, kwargs);
                break;
            default:
                break;
        }
    }

    private static void GetFileExplorer(
        PhotinoWindow window,
        MessageObject messageJson,
        params string[] kwargs
    )
    {
        string explorerPath = kwargs[0];

        var fileSystem = BuildFileSystem(explorerPath);

        string jsonData = JsonConvert.SerializeObject(fileSystem);

        window.SendWebMessage(CreateMessage("FileExplorer", new string[] { jsonData }));
    }

    private static FileSystemNode BuildFileSystem(string path)
    {
        var node = new FileSystemNode
        {
            Name = Path.GetFileName(path),
            IsDirectory = true,
            Children = new List<FileSystemNode>()
        };

        try
        {
            foreach (string directory in Directory.GetDirectories(path))
            {
                node.Children.Add(BuildFileSystem(directory));
            }

            foreach (string file in Directory.GetFiles(path))
            {
                node.Children.Add(
                    new FileSystemNode { Name = Path.GetFileName(file), IsDirectory = false }
                );
            }
        }
        catch (UnauthorizedAccessException)
        {
            // TO-DO: Handle access denied errors
        }

        return node;
    }

    public class FileSystemNode
    {
        public string Name { get; set; }
        public bool IsDirectory { get; set; }
        public List<FileSystemNode> Children { get; set; }
    }
}