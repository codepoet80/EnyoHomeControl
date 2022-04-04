## About

This bootplate is a template for a minimal Enyo1 web application.
You would normally use this to setup your local environment then go and modify the
files to build your own application.

Enyo was an open-source Javascript framework created for the Palm/HP TouchPad, and was later replaced with the cross platform [Enyo2](https://github.com/enyojs/enyo) (aka EnyoJS). While Enyo 1.0 was designed for webOS devices, with a few considerations, apps can run on LuneOS, in Chrome (or Chromium-based) browsers on the web, or with a little help from a Cordova wrapper, on modern Android phones.

If you want run webOS apps on other browsers (and you really [should stop using Chromium](https://www.theverge.com/2018/1/4/16805216/google-chrome-only-sites-internet-explorer-6-web-standards)), check out the [Enyo2 Bootplate](https://github.com/codepoet80/enyo2-bootplate).

You can learn more about legacy webOS at [webOS Archive](http://www.webosarchive.com/) or by exploring my other repos.

## Downloading

You can use a Git client to clone this repo and then initialize submodules.
The entire Enyo library is included in this repo, so you don't have to scrape it off a device.

Remove the `.git` folder to detach your local folder from the bootplate git repo
so that you can customize the contents for your own app (and add to your own repo)

## Dependencies

Each platform you want to target has its own dependencies and quirks. Check out the other docs in this folder for platform-specific details.

## Use

The bootplate provides a folder structure and app template to allow you to develop
Enyo apps for a variety of platforms including legacy webOS, LuneOS, Android and the web.

This project exists to allow apps to run on old *and* new devices, but can't prevent you
from using modern web features that won't work on older devices -- QA is up to you!

You create your app by modifying and updating the contents of the `enyo-app` folder.

The build script will help you build the app for different platforms. You specify
which platforms to build for with command line arguments to the build script.

Ensure the script is executable: `chmod +x build.sh`

Call the script, passing a list of the platforms you want to build, with a space between each one:

`./build.sh webos www android`

If you prefer to be in control, check out the other docs in this folder for platform-specific details.
