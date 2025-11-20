---
layout: post
title: "Encrypt configuration file in a custom managed action on x64"
date: 2009-05-15 16:28:00 +0200
category: software-craftsmanship
tags: howto wix .net x64
---

When I install a .NET (or ASP .NET) application, I like to encrypt the sensitive parts of the configuration file like the connection strings. So I have been used to create a [Custom Installer class](http://msdn.microsoft.com/en-us/library/system.configuration.install.installer.aspx) to achieve this. There are a few tricky things to take into account, like:
* when your configuration is loaded by the installer, it should be able to resolve embedded dependencies (like Enterprise Library assemblies) even when they are not in the GAC.
* this class accepts a _EXEPATH_ parameter that contains the path of the application which application file is to be encrypted. It should then be terminated [by an extra \ character](http://msdn.microsoft.com/en-us/library/2w2fhwzz.aspx).

For the record, here is how I do this:

```csharp
[RunInstaller(true)]
public partial class EncryptConfigInstaller:
    Installer
{

    public EncryptConfigInstaller()
    {
        InitializeComponent();
    }

    public override void Install(IDictionary stateSaver)
    {
        base.Install(stateSaver);

        string exePath=Context.Parameters["exepath"].TrimEnd('\\');

        AppDomain.CurrentDomain.SetData("EXEDIR", Path.GetDirectoryName(exePath));
        AppDomain.CurrentDomain.AssemblyResolve+=_AssemblyResolver;
        try
        {
            EncryptConfiguration(ConfigurationManager.OpenExeConfiguration(exePath));
        } finally
        {
            AppDomain.CurrentDomain.AssemblyResolve-=_AssemblyResolver;
        }
    }

    private static Assembly CurrentDomain_AssemblyResolve(object sender, ResolveEventArgs args)
    {
        AssemblyName name=new AssemblyName(args.Name);

        return Assembly.LoadFile(Path.Combine((string)AppDomain.CurrentDomain.GetData("EXEDIR"), string.Concat(name.Name, ".dll")));
    }

    private static void EncryptConfiguration(Configuration config)
    {
        EncryptSection(config.GetSection("connectionStrings"));

        config.Save(ConfigurationSaveMode.Modified);
    }

    private static void EncryptSection(ConfigurationSection section)
    {
        if ((section!=null) && (!section.SectionInformation.IsProtected))
        {
            section.SectionInformation.ProtectSection("DataProtectionConfigurationProvider");
            section.SectionInformation.ForceSave=true;
        }
    }

    private static ResolveEventHandler _AssemblyResolver=new ResolveEventHandler(CurrentDomain_AssemblyResolve);
}
```

Then even if I know that [managed actions are considered evil](http://www.msifaq.com/a/1044.htm), as I do not think I have a choice here, I am using the well known [WiX Custom Managed Actions](http://blogs.msdn.com/josealmeida/archive/2004/11/08/253831.aspx) trick. So everything is fine in a perfect world.

Except when a client tried to install one of my applications on a x64 platform (namely Windows Server 2008). Once solved the obvious [native libraries problem](/blog/software-craftsmanship/2009/05/15/oracle-not-so-instant-client.html), I was still puzzled by the fact that the user who had installed the application was the only one able to run it! It was only after a couple of days of wrong conjectures, poor tricks and unproductive Google searches that I cornered the problem: the encryption process was broken.

Extensive reasons behind that [can be found here](http://blogs.msdn.com/heaths/archive/2006/02/01/64-bit-managed-custom-actions-with-visual-studio.aspx), but basically it is because `InstallUtilLib.dll`, which is used to launch Installer classes, is a native library. As such, you should use the 64 bits version on a x64 platform. So I ended up copying both versions in an independent lib folder, and here is the magic corresponding WiX line:

```xml
<Binary Id="InstallUtilBinary" SourceFile="$(sys.CURRENTDIR)..\..\lib\$(sys.BUILDARCH)\InstallUtilLib.dll" />
```

Yes, I learned a lot about x64 lately. But I guess I am not done yet :-)
