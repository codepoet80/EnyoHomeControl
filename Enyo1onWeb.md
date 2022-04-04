# Enyo on the Web

## Notes

Enyo apps natively run in modern Chrome or Chromium-based web browsers, with the only caveat being CORS restrictions.
If you want to cross-target other platforms, particularly webOS, ensure you don't use
modern web features that won't render on older browsers.

## Build and Deploy

### Simple and Automated

- Create your Enyo app by adding to and modifying the contents of the `enyo-app` folder
- From the parent folder, use the command line to run `./build.sh www`
- Copy (or symlink) the output `bin/www` folder to your web server

### DIY (Manual)

- Copy the contents of the `enyo-app` folder to your web server's directory of choice

## Debugging

Normal web debugging tools can be used.