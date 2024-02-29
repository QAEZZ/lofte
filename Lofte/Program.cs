using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Text;
using PhotinoNET;
using LofteApp.Communication;

namespace LofteApp;

class Program
{
    [STAThread]
    public static void Main(params string[] args)
    {
        string openPath;
        if (args.Length < 1)
        {
            Console.WriteLine("Path not specified, opening in current directory.");
            openPath = Directory.GetCurrentDirectory();
            Console.WriteLine(openPath);
        }
        else
        {
            openPath = args[0];

            if (!Directory.Exists(Path.GetFullPath(openPath)))
            {
                Console.WriteLine($"Path \"{Path.GetFullPath(openPath)}\" does not exist.");
                return;
            }
        }

        string windowTitle = "Lofte";

#pragma warning disable CS8622 // Nullability of reference types in type of parameter doesn't match the target delegate (possibly because of nullability attributes).

        var window = new PhotinoWindow()
            .SetTitle(windowTitle)
            .SetUseOsDefaultSize(false)
            .SetSize(new Size(1200, 800))
            .Center()
            .SetResizable(true)
            .SetContextMenuEnabled(false)
            .SetGrantBrowserPermissions(true)
            .RegisterCustomSchemeHandler(
                "app",
                (object sender, string scheme, string url, out string contentType) =>
                {
                    contentType = "text/javascript";
                    return new MemoryStream(
                        Encoding.UTF8.GetBytes(
                            @"
                        /*(() =>{
                            window.setTimeout(() => {
                                alert(`🎉 Dynamically inserted JavaScript.`);
                            }, 1000);
                        })();*/
                    "
                        )
                    );
                }
            )
            // Most event handlers can be registered after the
            // PhotinoWindow was instantiated by calling a registration
            // method like the following RegisterWebMessageReceivedHandler.
            // This could be added in the PhotinoWindowOptions if preferred.
            .RegisterWebMessageReceivedHandler(
                (object sender, string message) =>
                {
                    // var window = (PhotinoWindow)sender;
                    // window.SendWebMessage("{'msg': 'LofteAppReady', 'data': []}");
                    Communicator.ProcessMessage(sender, ref message, openPath);
                }
            )
            .Load("wwwroot/index.html");
#pragma warning restore CS8622 // Nullability of reference types in type of parameter doesn't match the target delegate (possibly because of nullability attributes).


        window.WaitForClose();
    }
}
