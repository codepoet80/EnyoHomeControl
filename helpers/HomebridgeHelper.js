/*
Homebridge Helper
 Version 0.1
 Created: 2022
 Author: Jonathan Wise
 License: MIT
 Description: A helper to interact with Homebridge for home automation
*/
name = "homebridgehelper",
defaultHomebridgeServer = "homebridge.local";
defaultHomebridgeApiUrl = "http://" + defaultHomebridgeServer + "/api/";
enyo.kind({
    name: "Helpers.Homebridge",
    kind: "Control",
    //#region Public
    //  This stuff must be implemented to support the UI, but the details of the implementation are up to you
    published: {
        currentHomebridgeApiUrl: null,
    },
    events: {
        onConnectHomeReady: "",
        onUpdateAccessoriesReady: "",
        onSetAccessoryReady: "",
        onError: "" //TODO: Use this
    },
    create: function() {
        this.inherited(arguments);
        enyo.log("Homebridge Helper created as: " + this.name);
        this.currentHomebridgeApiUrl = defaultHomebridgeApiUrl;
    },
    ConnectHome: function(sender, server, user, pass) {
        if (server)
            this.currentHomebridgeApiUrl = this.currentHomebridgeApiUrl.replace("homebridge.local", server);
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
                        this.$.getAccessory.setUrl(this.currentHomebridgeApiUrl + "/accessories/" + services[j].uniqueId);
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
        if (type == "lightbulb") {
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
        } else if (type == "garagedoor") {
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
        }
        this.$.setAccessory.setUrl(this.currentHomebridgeApiUrl + "accessories/" + uniqueId);
        enyo.log("Homebridge Helper url is: " + this.$.setAccessory.url + " putData is " + JSON.stringify(putData));
        this.callServiceWithLatestProps(this.$.setAccessory, JSON.stringify(putData), {"Authorization": "Bearer " + this.bearerToken});
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
	},
    getHomeData: function(inSender) {
        this.callServiceWithLatestProps(this.$.getLayout, null, {"Authorization": "Bearer " + this.bearerToken})
	},
    buildNormalizedAccessory: function(accessory, data) {
        if (data.type) {
            if (data.serviceName)
                accessory.caption = data.serviceName;
            accessory.class = "defaultAccessory";
            if (data.type) {
                accessory.type = data.type.toLowerCase();
                switch(accessory.type){
                    case "lightbulb":
                        accessory.state = Boolean(data.values.On);
                        accessory.amount = data.values.Brightness;
                        accessory.condition = null;
                        accessory.class = "light";
                        break;
                    case "garagedooropener":
                        accessory.type = "garagedoor";
                        accessory.state = !Boolean(data.values.CurrentDoorState);
                        if (accessory.state == Boolean(data.values.TargetDoorState))
                            accessory.amount = 100;
                        else
                            accessory.amount = 50;
                        accessory.condition = !Boolean(data.values.ObstructionDetected);
                        accessory.class = "door";
                        break;
                    default:
                        enyo.log("HomebridgeHelper found an accessory of unknown type: " + data.type);
                        accessory.type = "unknown";
                }
            }
        }
        accessory.data = data;
        return accessory
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