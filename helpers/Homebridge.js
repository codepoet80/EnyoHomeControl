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
currentHomebridgeApiUrl = defaultHomebridgeApiUrl;
enyo.kind({
    name: "Helpers.Homebridge",
    kind: "Control",
    sender: null,   //Use this to manage scope in callbacks

    //#region Public
    //  This stuff must be implemented to support the UI, but the details of the implementation are up to you
    published: {
        OnDataLoadReady: function(sender) { enyo.warn("Homebridge Helper loaded data, but no one is listening to the event!"); },
        OnDataLoadFailure: function(sender) { enyo.error("Homebridge Helper could not logon or load data from Homebridge!"); },
        OnDataUpdateReady: function(sender) { enyo.warn("Homebridge Helper updated data, but no one is listening to the event!"); },
        OnDataUpdateFailure: function(sender) { enyo.error("Homebridge Helper could not update data from Homebridge!"); }
    },
    create: function() {
        this.inherited(arguments);
        enyo.log("Homebridge Helper created as: " + this.name);
    },
    LoadHomeData: function(sender, server, user, pass, successHandler, failureHandler) {
        if (server)
            currentHomebridgeApiUrl = currentHomebridgeApiUrl.replace("homebridge.local", server);
        enyo.log("Homebridge Helper is trying to get data from server " + currentHomebridgeApiUrl + " with credentials: " + user + ", " + pass + " for sender: " + sender.name);

        this.sender = sender;

        if (successHandler)
            this.OnDataLoadReady = successHandler.bind(this);
        if (failureHandler)
            this.OnDataLoadFailure = failureHandler.bind(this);

        this.callServiceWithLatestProps(this.$.doLogin, {username: user, password: pass});
    },
    GetHomeData: function() {   //All the data in the home
        var normalizedData = [];
		for (var i=0;i<this.homeData.length;i++) {
			if (this.homeData[i].services) {	//this is a room!
				normalizedData.push({caption: data[i].name, type: "Room"});
				var services = this.homeData[i].services;
				for (var j=0;j<services.length;j++) {
					normalizedData.push({caption: services[j].uniqueId, type: "Accessory"});
				}
			}
		}
        return normalizedData;
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
		for (var i=0;i<this.homeData.length;i++) {
			if (this.homeData[i].services) {	//this is a room!
                if (this.homeData[i].uniqueId == roomId) {
                    var services = this.homeData[i].services;
                    for (var j=0;j<services.length;j++) {
                        normalizedData.push({caption: services[j].serviceName, type: services[j].type, uniqueId: services[j].uniqueId, debugData: services[j]});
                    }
                }
			}
		}
        return normalizedData;
    },
    UpdateAccessoryDetails: function(sender, successHandler, failureHandler) {    //Details for a specific accessory
        
        this.sender = sender;

        if (successHandler)
            this.OnDataUpdateReady = successHandler.bind(this);
        if (failureHandler)
            this.OnDataUpdateFailure = failureHandler.bind(this);

        this.refreshCount = 0;
        for (var i=0;i<this.homeData.length;i++) {
            if (this.homeData[i].services) {
                var services = this.homeData[i].services;
                for (var j=0;j<services.length;j++) {
                    if (services[j].uniqueId) {
                        //enyo.log("Updating accessory: " + services[j].uniqueId);
                        this.$.getAccessory.setUrl(currentHomebridgeApiUrl + "/accessories/" + services[j].uniqueId);
                        this.callServiceWithLatestProps(this.$.getAccessory, null, {"Authorization": "Bearer " + this.bearerToken});
                        this.refreshCount++;
                    }
                }
            }
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
    ],
    callServiceWithLatestProps: function(service, params, headers) {    //Solve a race condition where service properties aren't updated
        service.setUrl(service.url.replace(defaultHomebridgeApiUrl, currentHomebridgeApiUrl));
        if (headers) {
            service.setHeaders(headers);
        }
        service.call(params);
    },
    loginSuccess: function(inSender, inResponse, inRequest)  {
		enyo.log("Homebridge Helper got login response: " + JSON.stringify(inResponse));	
		if (inResponse && inResponse.access_token) {
			this.bearerToken = inResponse.access_token;
			enyo.log("Homebridge Helper login success, token is: " + this.bearerToken);
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
    getLayoutSuccess: function(inSender, inResponse, inRequest) {
        if (inResponse) { //and its an object
            enyo.log("Homebridge Helper got home layout response: " + inResponse);
            this.homeData = inResponse;
            for (var i=0;i<inResponse.length;i++){
                if (inResponse[i].services) {
                    useid = this.uniqueId();
                    inResponse[i].uniqueId = useid;
                }
            }
            this.OnDataLoadReady(this.sender);
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
                            //enyo.log("Got new data for accessory " + augmentedData[i].services[j].uniqueId + ": \r\n" + JSON.stringify(inResponse));
                            augmentedData[i].services[j] = inResponse;
                        }
                    }
                }
                this.homeData = augmentedData;
            }
        }
        if (this.refreshCount <= 0) {
            enyo.log("Done getting accessories for sender: " + this.sender.name);
            this.OnDataUpdateReady(this.sender);
        }
            
    },
    uniqueId: function() {
        return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
    }
    //#endregion
});