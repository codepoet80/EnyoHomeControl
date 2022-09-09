#!/bin/bash

mydir=$(cd `dirname $0` && pwd)
mkdir $mydir/bin/ -p

if [ "$1" = "clean" ]; then
    echo -n "Cleaning up..."
    rm -rf $mydir/bin/*
    rm -rf $mydir/enyo-app/deploy/*
    rm -rf $mydir/enyo-app/build/*
    echo "Done!"
    exit
fi

www=0
webOS=0
android=0
verbose=
for arg in "$@"; do
    if [ "$arg" = 'webos' ]; then
        webOS=1
    fi
    if [ "$arg" = 'luneos' ]; then
        webOS=1
    fi
    if [ "$arg" = 'android' ]; then
        android=1
    fi
    if [ "$arg" = 'www' ]; then
        www=1
    fi
    if [ "$arg" = 'web' ]; then
        www=1
    fi
    if [ "$arg" = '-v' ]; then
        verbose="-v"
    fi
done

if [[ $www -eq 0 ]] && [[ $webOS -eq 0 ]] && [[ $android -eq 0 ]] ; then
    echo "No build target specified"
    echo "Allowed: webos luneos www android"
    echo "(or any combination)"
    echo "Or to clean-up all build folders, you can pass: clean"
    exit
fi

if [ $webOS -eq 1 ]; then
    echo "Building for LuneOS/webOS..."
    rm -rf $mydir/bin/*.ipk
    rm -rf $mydir/bin/www
    cp $mydir/cordova-webos.js $mydir/enyo-app/cordova.js -f
    cd $mydir/enyo-app
    palm-package .
    mv $mydir/enyo-app/*.ipk $mydir/bin/
fi

if [ $www -eq 1 ]; then
    echo "Building for www..."
    mkdir $mydir/bin/www -p
    rm -rf $mydir/bin/www/*
    cp $mydir/cordova-www.js $mydir/enyo-app/cordova.js -f
    cp $mydir/enyo-app/* $mydir/bin/www -R
fi

if [ $android -eq 1 ]; then
    echo "Building for Android..."
    rm -rf $mydir/bin/*.apk
    dirname=$mydir/cordova-wrapper
    cd $mydir/cordova-wrapper
    mkdir $mydir/cordova-wrapper/www -p
    rm -rf $mydir/cordova-wrapper/www/*
    cordova platform add android
    echo "Copying to Cordova..."
    cp $mydir/enyo-app/* $mydir/cordova-wrapper/www -R
    cd $mydir/cordova-wrapper
    echo "Building Cordova..."
    cordova build android
    cp $mydir/cordova-wrapper/platforms/android/app/build/outputs/apk/debug/*.apk $mydir/bin/
fi

# Put cordova back
cp $mydir/cordova-www.js $mydir/enyo-app/cordova.js -f

echo
echo "Build output at: $mydir/bin/"
ls $mydir/bin/
