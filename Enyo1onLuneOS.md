# Enyo on LuneOS with Cordova

## Notes

### Pre-requisites

LuneOS support requires the [webos-ports-sdk for LuneOS](https://github.com/webOS-ports/webos-ports-sdk) which is installed along-side the [legacy webOS SDK](http://sdk.webosarchive.com).

### JAVA
The Android SDK and modern Cordova use a different version of JAVA than the webOS SDK requires. 
At least on Linux systems both versions can co-exist, but after installing Cordova, you need to set the default back to the older JDK.

This website describes managing alternatives: [https://www.fosstechnix.com/install-oracle-java-8-on-ubuntu-20-04/](https://www.fosstechnix.com/install-oracle-java-8-on-ubuntu-20-04/)

## Build and Deploy

### Simple and Automated

- Create your Enyo app by adding to and modifying the contents of the `enyo-app` folder
- From the parent folder, use the command line to run `./build.sh luneos`
- Install the resulting ipk from `bin/` using `lune-install`

### DIY (Manual)

- Create your Enyo app by adding to and modifying the contents of the `enyo-app` folder
- From the `enyo-app` folder, use the command line to run `palm-package`
- Use `palm-install` to install the resulting ipk on your webOS device over USB.

## Debugging

Depending on your target MACHINE, you may be able to use Chrome to remotely debug. Obtain the IP address of the device you install to, and visit `http://<DEVICEIP>:1122` in Chrome.