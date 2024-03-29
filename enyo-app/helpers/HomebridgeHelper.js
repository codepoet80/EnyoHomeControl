/*
Homebridge Helper
 Version 0.1
 Created: 2022
 Author: Jon W
 License: MIT
 Description: A helper to interact with Homebridge for home automation
*/
name = "homebridgehelper",
defaultHomebridgeServer = "homebridge.local";
defaultHomebridgeApiUrl = defaultHomebridgeServer + "/api";
enyo.kind({
    name: "Helpers.Homebridge",
    kind: "Control",
    useSecure: false,
    //#region Public
    //  This stuff must be implemented to support the UI, but the details of the implementation are up to you
    published: {
        currentHomebridgeApiUrl: null,
    },
    events: {
        onConnectHomeReady: "",
        onUpdateAccessoriesReady: "",
        onSetAccessoryReady: "",
        onError: "",
        onLoginError: "",
    },
    create: function() {
        this.inherited(arguments);
        enyo.log("Homebridge Helper created as: " + this.name);
        this.currentHomebridgeApiUrl = defaultHomebridgeApiUrl;
    },
    ConnectHome: function(sender, server, user, pass) {
        enyo.warn("Connect called with server: " + server + ", useSecure is: " + this.useSecure);
        if (server)
            this.currentHomebridgeApiUrl = server + "/api";
        if (server.indexOf("/") == -1)
            this.currentHomebridgeApiUrl = this.currentHomebridgeApiUrl + "/";
        if (this.currentHomebridgeApiUrl.indexOf("http://") == -1 && this.currentHomebridgeApiUrl.indexOf("https://") == -1)
            this.currentHomebridgeApiUrl = "http://" + this.currentHomebridgeApiUrl;
        if (this.useSecure)
            this.currentHomebridgeApiUrl = this.currentHomebridgeApiUrl.replace("http://", "https://");
        if (browserSupportsCors()) {
            enyo.warn("This browser enforces CORS, but Homebridge does not allow it and must be circumvented!");
        }
        enyo.log("Homebridge Helper is trying to get data from server " + this.currentHomebridgeApiUrl + " with credentials: " + user + ", " + pass + " for sender: " + sender.name);
        this.callServiceWithLatestProps(this.$.doLogin, {username: user, password: pass});
    },
    GetHomeLayout: function() { //Just the layout of the home (eg: rooms or zones)
        var normalizedData = [];
		for (var i=0;i<this.homeData.length;i++) {
			if (this.homeData[i].services) {
				normalizedData.push({caption: this.homeData[i].name, type: "Room", uniqueId: this.homeData[i].uniqueId });
			}
		}
        return normalizedData;
    },
    GetAccessoryDataForRoom: function(roomId, changeable) {   //Just the accessories in a given room
        var normalizedData = [];
        //enyo.log("Home data currently: " + JSON.stringify(this.homeData));
		for (var i=0;i<this.homeData.length;i++) {
			if (this.homeData[i].services) {	//we're in a room!
                if (this.homeData[i].uniqueId == roomId) {
                    var services = this.homeData[i].services;
                    for (var j=0;j<services.length;j++) {
                        //Here's where we normalize the accessory data (see interface.md)
                        var thisAccessory = {
                            uniqueId: services[j].uniqueId,
                        }
                        thisAccessory = this.buildNormalizedAccessory(thisAccessory, services[j]);
                        normalizedData.push(thisAccessory);
                    }
                }
			}
		}
        return normalizedData;
    },
    UpdateAccessories: function(sender) {    
        enyo.log("Updating accessories for sender: " + sender.name);
        this.refreshCount = 0;
        for (var i=0;i<this.homeData.length;i++) {
            if (this.homeData[i].services) {
                var services = this.homeData[i].services;
                for (var j=0;j<services.length;j++) {
                    if (services[j].uniqueId) {
                        //enyo.log("Updating accessory: " + services[j].uniqueId);
                        this.$.getAccessory.setUrl(this.currentHomebridgeApiUrl + "accessories/" + services[j].uniqueId);
                        this.callServiceWithLatestProps(this.$.getAccessory, null, {"Authorization": "Bearer " + this.bearerToken});
                        this.refreshCount++;
                    }
                }
            }
        }
    },
    SetAccessoryValue: function(sender, uniqueId, type, setting, value) {
        enyo.log("Homebridge Helper is operating on " + uniqueId + " of type: " + type + " with setting " + setting + " to value " + value);
        //Adapt normalized data for device type
        //TODO: Privatize
        var putData = null;
        switch (type) {
            case "outlet": 
                switch (setting) {
                    default:
                        var putData = {
                            "characteristicType": "On",
                            "value": "0"
                        }
                        if (value)
                            putData.value = "1";
                        break;
                }
                break;
            case "television": 
                switch (setting) {
                    default:
                        var putData = {
                            "characteristicType": "Active",
                            "value": "0"
                        }
                        if (value)
                            putData.value = "1";
                        break;
                }
                break;
            case "lightbulb": 
                switch (setting) {
                    case "amount":
                        var putData = {
                            "characteristicType": "Brightness",
                            "value": value
                        }
                        break;
                    default:
                        var putData = {
                            "characteristicType": "On",
                            "value": "0"
                        }
                        if (value)
                            putData.value = "1";
                        break;
                }
                break;
            case "colorbulb":
                switch (setting) {
                    case "state":
                        var putData = {
                            "characteristicType": "On",
                            "value": "0"
                        }
                        if (value)
                            putData.value = "1";
                        break;
                    case "amount":
                        var putData = {
                            "characteristicType": "Brightness",
                            "value": value
                        }
                        break;
                    default:
                        putData = {
                            "characteristicType": setting,
                            "value": value
                        }
                        break;        
                }
                break;
            case "garagedoor":
                enyo.warn("Homebridge Helper setting garage door setting: " + setting + " to value " + value);
                switch (setting) {
                    default:
                        var putData = {
                            "characteristicType": "TargetDoorState",
                            "value": "1"
                        }
                        if (value)
                            putData.value = "0";
                        break;
                }
                enyo.log("garage door put data is: " + JSON.stringify(putData));
                break;
            case "fan": 
                switch (setting) {
                    case "amount":
                        var putData = {
                            "characteristicType": "RotationSpeed",
                            "value": value
                        }
                        break;
                    default:
                        var putData = {
                            "characteristicType": "On",
                            "value": "0"
                        }
                        if (value)
                            putData.value = "1";
                        break;
                }
                break;
        }
        if (putData) {
            this.$.setAccessory.setUrl(this.currentHomebridgeApiUrl + "accessories/" + uniqueId);
            enyo.log("Homebridge Helper url is: " + this.$.setAccessory.url + " putData is " + JSON.stringify(putData));
            this.callServiceWithLatestProps(this.$.setAccessory, JSON.stringify(putData), {"Authorization": "Bearer " + this.bearerToken});
        } else {
            enyo.warn("Homebridge Helper could not build data for SetAccessoryValue call. Ensure the accessory type is handled.")
        }
    },
    //#endregion

    //#region Private implementation stuff
    bearerToken: "not set",
    homeData: [],
    refreshCount: 0,
    components: [
        { kind: "WebService", name: "doLogin", url: defaultHomebridgeApiUrl + "auth/login",
            method: "POST",
            onSuccess: "loginSuccess",
            onFailure: "loginFailure" 
        },
        { kind: "WebService", name:"getLayout", url: defaultHomebridgeApiUrl + "accessories/layout", 
            method: "GET",
            headers: { "Authorization": "Bearer " },    //to be filled in later
            onSuccess: "getLayoutSuccess", 
            onFailure: "getLayoutFailure" 
        },
        { kind: "WebService", name:"getAccessory", url: defaultHomebridgeApiUrl + "accessories/",   //to be filled in later 
            method: "GET",
            headers: { "Authorization": "Bearer " },    //to be filled in later
            onSuccess: "getAccessorySuccess", 
            onFailure: "getAccessoryFailure" 
        },
        { kind: "WebService", name:"setAccessory", url: defaultHomebridgeApiUrl + "accessories/",   //to be filled in later
            method: "PUT",
            headers: { "Authorization": "Bearer " },    //to be filled in later
            onSuccess: "setAccessorySuccess",
            onFailure: "setAccessoryFailure",
            contentType: "application/json"
        }
    ],
    callServiceWithLatestProps: function(service, params, headers) {    //Solve a race condition where service properties aren't updated
        service.setUrl(service.url.replace(defaultHomebridgeApiUrl, this.currentHomebridgeApiUrl));
        if (headers) {
            service.setHeaders(headers);
        }
        service.call(params);
    },
    loginSuccess: function(inSender, inResponse, inRequest)  {
		enyo.log("Homebridge Helper got login response: " + JSON.stringify(inResponse));	
		if (inResponse && inResponse.access_token) {
			this.bearerToken = inResponse.access_token;
			this.getHomeData(inSender);
		} else {
			this.loginFailure(inSender, inResponse, inRequest);
		}
	},
    loginFailure: function(inSender, inResponse, inRequest) {
        enyo.error("Homebridge Helper hit an error during login");
        enyo.log(inResponse);
        if (inResponse.statusCode == 403)
            this.doLoginError("Login forbidden (error code 403). Check your username and password!", inResponse, true);
        else {
            if (browserSupportsCors()) {
                this.doLoginError(("Login failed. Check the URL of the server, and ensure that you are not being blocked by CORS! " + (inResponse.statusCode || -1)), inResponse, true);
            }
            else {
                this.doLoginError(("Login failed. Check the URL of the server. " + (inResponse.statusCode || -1)), inResponse, true);

            }
        }   
	},
    getHomeData: function(inSender) {
        this.callServiceWithLatestProps(this.$.getLayout, null, {"Authorization": "Bearer " + this.bearerToken})
	},
    getLayoutSuccess: function(inSender, inResponse, inRequest) {
        if (inResponse) { //and its an object
            //enyo.log("Homebridge Helper got home layout response: " + inResponse);
            this.homeData = inResponse;
            for (var i=0;i<inResponse.length;i++){
                if (inResponse[i].services) {
                    useid = this.uniqueId();
                    inResponse[i].uniqueId = useid;
                }
            }
            this.doConnectHomeReady();
        } else {
            this.$.getLayoutFailure(inSender, inResponse, inResponse);
        }
    },
    getLayoutFailure: function(inSender, inResponse, inRequest) {
        enyo.error("Homebridge Helper hit an error getting home layout");
        enyo.error("data: " + JSON.stringify(inResponse));
    },
    getAccessorySuccess: function(inSender, inResponse, inRequest) {
        var augmentedData = this.homeData;
        this.refreshCount--;
        if (inResponse.uniqueId) {
            for (var i=0;i<augmentedData.length;i++) {
                if (augmentedData[i].services) {
                    for (var j=0;j<augmentedData[i].services.length;j++) {
                        if (augmentedData[i].services[j].uniqueId && augmentedData[i].services[j].uniqueId == inResponse.uniqueId) {
                            //enyo.log("Homebridge Helper got new data for accessory " + augmentedData[i].services[j].uniqueId + ": \r\n" + JSON.stringify(inResponse));
                            augmentedData[i].services[j] = inResponse;
                        }
                    }
                }
                this.homeData = augmentedData;
            }
        }
        if (this.refreshCount <= 0) {
            this.doUpdateAccessoriesReady();
        }
    },
    buildNormalizedAccessory: function(accessory, data) {
        if (data.type) {
            if (data.serviceName)
                accessory.caption = data.serviceName;
            //Special case
            if (data.accessoryInformation && data.accessoryInformation.Model && data.accessoryInformation.Model == "LightGroup")
                accessory.caption = "Light Group";
            accessory.class = "defaultAccessory";
            if (data.type) {
                accessory.type = data.type.toLowerCase();
                switch(accessory.type){
                    case "lightbulb":
                        accessory.state = Boolean(data.values.On);
                        accessory.amount = data.values.Brightness;
                        if (data.values && data.values.hasOwnProperty("Hue") && data.values.hasOwnProperty("Saturation")) {
                            accessory.type = "colorbulb";
                            accessory.amount = {
                                hue: data.values.Hue,
                                saturation: data.values.Saturation,
                                brightness: accessory.amount,
                            }
                        }
                        accessory.condition = null;
                        accessory.class = "light";
                        break;
                    case "outlet":
                        accessory.state = Boolean(data.values.On);
                        accessory.condition = null;
                        accessory.class = "outlet";
                        break;
                    case "television":
                        accessory.state = Boolean(data.values.Active);
                        accessory.amount = data.values.ActiveIdentifier;
                        accessory.class = "outlet";
                        break;
                    case "garagedooropener":
                        accessory.type = "garagedoor";
                        accessory.state = !Boolean(data.values.CurrentDoorState);
                        if (accessory.state == Boolean(data.values.TargetDoorState))
                            accessory.amount = [100]
                        else
                            accessory.amount = [50];
                        accessory.condition = !Boolean(data.values.ObstructionDetected);
                        accessory.class = "door";
                        break;
                    case "temperaturesensor":
                        accessory.type = "temperaturesensor";
                        accessory.amount = data.serviceCharacteristics[0].value;
                        break;
                    case "fan":
                        accessory.state = Boolean(data.values.On);
                        accessory.amount = data.values.RotationSpeed;
                        accessory.class = "fan";
                        break;
                    default:
                        if (data.type.toLowerCase().indexOf("sensor") != -1) {
                            accessory.type = "basicsensor";
                            enyo.log("Handling basic sensor: " + JSON.stringify(data));
                        } else {
                            enyo.log("HomebridgeHelper found an accessory of unknown type: " + data.type);
                            accessory.type = "unknown";
                        }
                        break;
                }
            }
        }
        accessory.data = data;
        return accessory
    },
    setAccessorySuccess: function(inSender, inResponse, inRequest) {
        this.doSetAccessoryReady();
    },
    uniqueId: function() {
        return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
    }
    //#endregion
});

function browserSupportsCors() {
    //Detect browser support for CORS
    if ('withCredentials' in new XMLHttpRequest()) {
        /* supports cross-domain requests */
        return true;
    }
    else if(typeof XDomainRequest !== "undefined"){
        return true;
    }else{
        //Time to retreat with a fallback or polyfill
        return false;
    }
}