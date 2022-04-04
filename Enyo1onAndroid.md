# Enyo on Android with Cordova

## Notes

### Backward Compatibility
If you want to cross-target other platforms, particularly webOS, ensure you don't use
modern web features that won't render on older browsers.

### CORS
Be aware Cordova uses WebView on Android, and is unable to circumvent its CORS restrictions.
If you want to call a web service from your app, you'll need to add the appropriate CORS
headers (if you control the service) or come up with a work-around (if you don't control the service).

### JAVA
The Android SDK and modern Cordova use a different version of JAVA than the webOS SDK requires. 
At least on Linux systems both versions can co-exist, but after installing Cordova, you need to set the default back to the older JDK.

This website describes managing alternatives: [https://www.fosstechnix.com/install-oracle-java-8-on-ubuntu-20-04/](https://www.fosstechnix.com/install-oracle-java-8-on-ubuntu-20-04/)

## Build and Deploy

### Simple and Automated

- Create your Enyo app by adding to and modifying the contents of the `enyo-app` folder
- From the parent folder, use the command line to run `./build.sh android`
- Install the resulting apk from `bin/` using `adb`

### DIY (Manual)

- Create your Cordova project the standard way:
    - eg: `cordova create hello com.example.hello HelloWorld`
- Add the android platform
    - `cd <folder>` (eg: `hello`)
    - `cordova platform add android`
- Create your Enyo app by adding to and modifying the contents of the `enyo-app` folder
- From the parent folder, use the command line to run `./build.sh www`
- Copy the resulting build output from the Enyo `deploy` folder to the Cordova `www` folder (eg: `hello\www`)
- Use the `config.xml` included in this project to add the Android namespace and security exeptions
- Add the security exemption meta tag to your .html files in `www`:
    - `<meta http-equiv="Content-Security-Policy" content="default-src *; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval'">`
- Build your combined webOS + Cordova app for Android:
    - `cordova build android`

## Debugging

- Use `adb` to install the resulting apk to your Android device.
- You can use Chrome on your PC to debug Enyo apps:
    - With the Android device connected over USB (and USB debugging enabled)
    - Go to `chrome://inspect/#devices` in your Chrome-based browser
    - Launch your app from your Android device
    - Click "inspect" in the Chrome page where your app shows up