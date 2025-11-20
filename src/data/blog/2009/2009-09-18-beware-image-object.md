---
layout: post
title: "Beware the Image object!"
date: 2009-09-18 11:38:00 +0200
category: software-craftsmanship
tags: .net
---

One requirement on the project I am working on (.NET 2.0, Windows Forms) was to make the end-user able to load a background image to an [`InkPicture`](http://msdn.microsoft.com/en-us/library/microsoft.ink.inkpicture.aspx) (which is just a special [`PictureBox`](http://msdn.microsoft.com/en-us/library/system.windows.forms.picturebox.aspx) control, with the ability to be drawn upon on a TabletPC). That did not seem very difficult at first: just create an [`OpenFileDialog`](http://msdn.microsoft.com/en-us/library/system.windows.forms.openfiledialog.aspx) and there you go.

```csharp
// WRONG! DO NOT USE THIS CODE!
if (_OpenFileDialog.ShowDialog()==DialogResult.OK)
    using (Stream ims=_OpenFileDialog.OpenFile())
        _InkPicture.Image=Image.FromStream(ims);
```

Clean, straightforward and... wrong! It took me quite some time to realize it though. My application started to throw occasional and rather erratic exceptions in completely unrelated places, and it kind of reminded me of the strange ways a native application could crash after a buffer had been overrun. But in a managed application?...

As often, the answer is [in the documentation](http://msdn.microsoft.com/en-us/library/93z9ee4x.aspx) (check the _Remarks_ section) :
> You must keep the stream open for the lifetime of the Image.

Uh ? Any more information on why I should do this, and perhaps more importantly _how_ I should do this ? Because my `Image` could be replaced from anywhere in the code. And even if I wanted to track the changes, there is no `ImageChanged` event on a `PictureBox`. And it feels weird to retain a reference to a `Stream` I never use...

As for the first question, the answer lies in [KB 814675](http://support.microsoft.com/?id=814675): `Image` is just a wrapper around the native GDI+ library, which has specific requirements:
> To retain access to the source bits, GDI+ locks any source file, and forces the application to maintain the life of any source stream, for the life of the Bitmap or the Image object.

As for the second question, tips can be found in the referenced article above. And here is my solution: use a copy of the stream based image that is unrelated to the original stream. Here is some code to create such a copy:

```csharp
public static Image Copy(Image original)
{
    // cf. http://support.microsoft.com/?id=814675

    Image ret=new Bitmap(original.Width, original.Height);
    using (Graphics g=Graphics.FromImage(ret))
    {
        g.DrawImageUnscaled(original, 0, 0);
        g.Save();
    }

    return ret;
}
```

And here is the correct code on how to load an `Image` into an `InkPicture`:

```csharp
if (_OpenFileDialog.ShowDialog()==DialogResult.OK)
    using (Stream ims=_OpenFileDialog.OpenFile())
        using (Image image=Image.FromStream(ims))
            _InkPicture.Image=Copy(image);
```
