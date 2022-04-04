# Enyo on webOS

## Notes

### Pre-requisites

webOS Support requires the [legacy webOS SDK](http://sdk.webosarchive.com).

### JAVA
If you're cross-compiling for webOS and other platforms, be aware that the Android SDK and modern Cordova use a different version of JAVA than the webOS SDK requires. 
At least on Linux systems both versions can co-exist, but after installing Cordova, you need to set the default back to the older JDK.

This website describes managing alternatives: [https://www.fosstechnix.com/install-oracle-java-8-on-ubuntu-20-04/](https://www.fosstechnix.com/install-oracle-java-8-on-ubuntu-20-04/)

## Build and Deploy

### Simple and Automated

- Create your Enyo app by adding to and modifying the contents of the `enyo-app` folder
- From the parent folder, use the command line to run `./build.sh webos`
- Install the resulting ipk from `bin/` using `palm-install`

### DIY (Manual)

- Create your Enyo app by adding to and modifying the contents of the `enyo-app` folder
- From the `enyo-app` folder, use the command line to run `palm-package`
- Use `palm-install` to install the resulting ipk on your webOS device over USB.

## Debugging

- Use `palm-log` and other [legacy webOS SDK Command line tools](http://sdk.webosarchive.com/docs/docs.html#dev-guide/tools/command-line-tools.html) to debug as normal.