name = "homecontrol",
enyo.kind({
	name: "enyo.HomeControl",
	kind: enyo.VFlexBox,
	homeHelper: null,
	username: null,
	password: null,
	server: null,
	online: false,
	layoutData: null,
	selectedRoom: null,
	accessoryData: null,
	selectedLight: null,
	components: [
		{kind: "Helpers.Homebridge", name: "myHomebridge" },
		{kind: "Helpers.Updater", name: "myUpdater" },
		//UI Elements
		{kind: "PageHeader", components: [
			{kind: "VFlexBox", flex: 1, align: "center", components: [
				{content: "Home Control", domStyles: {"font-weight": "bold", "font-size": "larger"}},
			]}
		]},
		{name: "slidingPane", kind: "SlidingPane", flex: 1, onSelectView: "slidingSelected", components: [
			{name: "panelRooms", width: "250px", components: [
				{name: "headerRoom", kind: "Header", components: [
					{w: "fill", content:"Rooms", domStyles: {"font-weight": "bold"}},
					{kind: "Image", flex:1, name: "spinnerRoom", src: "images/spinner.gif", domStyles: {width: "20px"}},					
				]},
				{kind: "Scroller", flex:1, domStyles: {"margin-top": "0px", "min-width": "130px"}, components: [
					{flex: 1, name: "roomList", kind: enyo.VirtualList, className: "list", onSetupRow: "renderRoomRow", components: [
						{kind: "Item", className: "item", title: "", onclick: "roomClick", /*Xonmousedown: "roomClick",*/ components: [
							{w: "fill", name:"roomListContainer", domStyles: {margin: "-12px", padding: "12px"}, components: [
								{kind: "HFlexBox", components: [
									{name: "roomCaption", flex: 2, domStyles: {overflow: "hidden", "text-overflow": "ellipsis"} },
									/*{w: "fill", flex: 1, name: "roomType", domStyles: {"text-align": "right"}}*/
								]}	
							]}
						]}
					]},
				]},
				{kind: "Toolbar", components: [
					{kind: "GrabButton"},
					{caption: "Update", onclick: "doUpdateRooms"}
				]}
			]},
			{name: "panelLights", width: "300px", /*fixedWidth: true,*/ peekWidth: 100, components: [
				{name: "headerLights", kind: "Header", components: [
					{w: "fill", content:"Lights", domStyles: {"font-weight": "bold"}},
					{kind: "Image", flex:1, name: "spinnerLights", src: "images/spinner.gif", domStyles: {width: "20px"}},					
				]},
				{kind: "Scroller", flex:1, domStyles: {"margin-top": "0px", "min-width": "130px"}, components: [
					{flex: 1, name: "lightList", kind: enyo.VirtualList, className: "list", onSetupRow: "renderLightRow", components: [
						{kind: "Item", className: "item", onclick: "lightClick", /*Xonmousedown: "lightClick",*/ components: [
							{w: "fill", name:"lightListContainer", domStyles: {margin: "-12px", padding: "12px"}, components: [
								{kind: "HFlexBox", components: [
									{name: "lightCaption", flex: 2, domStyles: {overflow: "hidden", "text-overflow": "ellipsis"} },
									{w: "fill", flex: 1, name: "lightType", content:"Light", domStyles: {"text-align": "right"}}
								]}	
							]}
						]}
					]},
				]},
				{kind: "Toolbar", components: [
					{kind: "GrabButton"},
				]}
			]},
			{name: "panelDetail", flex: 2, dismissible: false, peekWidth:210, onHide: "rightHide", onShow: "rightShow", onResize: "slidingResize", components: [
				{name: "headerDetail", kind: "Header", content: "Nothing Selected", domStyles: {"font-weight": "bold", overflow: "hidden", "text-overflow": "ellipsis"}},
				{kind: "VFlexBox", flex: 2, pack: "center", components: [
					{w: "fill", domStyles: {"text-align": "center"}, components: [
						{kind: "Image", flex:1, name: "imageDetail", src: "icons/icon-256x256.png", onclick: "lightControlClick", domStyles: {width: "400px", "margin-left": "auto", "margin-right": "auto"}},
					]},
					{w: "fill", name: "captionDetail", content: "Home Control", domStyles: {"text-align": "center", "margin-left": "100px", "margin-right": "100px"}}
				]},
				{kind: "Toolbar", components: [
					{kind: "GrabButton"}
				]}
			]}
		]},
	],
	create: function() {
		this.inherited(arguments);

		//Detect environment for appropriate behavior
		enyo.log("Home Control is starting up on " + window.location.hostname + " as: " + this.name);
		if (window.location.hostname != ".media.cryptofs.apps.usr.palm.applications.com.jonandnic.enyo.homecontrol") {
			enyo.warn("webOS environment not detected, assuming a web server!");	
		} else {
			this.$.myUpdater.CheckForUpdate("Home Control");
		}

		//Load preferences
		//TODO: username and password
		this.username = "admin";
		this.password = "admin";
		//TODO: server path
		this.server = "homebridge.jonandnic.com";
		//TODO: helper type (support for multiple back-ends)
		this.homeHelper = this.$.myHomebridge;
		
		//Login and Load Home Layout
		this.homeHelper.LoadHomeData(this, this.server, this.username, this.password, this.homeDataReady);
		window.setInterval(function() {
			enyo.log("timer fired: " + this.online)
			if (this.online) {
				this.$.spinnerLights.applyStyle("display", "inline");
				this.homeHelper.UpdateAccessoryDetails(this, this.lightDataUpdated)
			}
		}.bind(this), 10000);
	},
	homeDataReady: function(self) {
		self.online = true;
		enyo.log("Home data is ready for: " + self.name);
		self.layoutData = self.homeHelper.GetHomeLayout();
		self.$.spinnerRoom.applyStyle("display", "none");
		//enyo.log(JSON.stringify(self.layoutData));
		self.$.roomList.refresh();

		enyo.log("Calling for updated accessory data on this: " + self.name);
		self.homeHelper.UpdateAccessoryDetails(self, self.lightDataUpdated);
	},
	renderRoomRow: function(inSender, inIndex) {
		if (this.layoutData && this.layoutData.length > 0) {
			var record = this.layoutData[inIndex];
			if (record) {
				this.$.roomCaption.setContent(record.caption);
				var isRowSelected = (inIndex == this.$.selectedRoom);
				if (isRowSelected) {
					this.$.roomListContainer.applyStyle("background-color", "dimgray");
					this.$.roomListContainer.applyStyle("color", "white");
					this.showAccessoryController(record.uniqueId, record.caption, "Room");
					//Load the light list for the selected room
					enyo.log("Get accessory data for room: " + record.uniqueId);
					this.lightData = this.homeHelper.GetAccessoryDataForRoom(record.uniqueId, true);
					this.$.lightList.refresh();
				} else {
					this.$.roomListContainer.applyStyle("background-color", null);
					this.$.roomListContainer.applyStyle("color", null);
				}
				return true;
			}
		}
	},
	roomClick: function(inSender, inEvent) {
		enyo.log("Room clicked on row: " + inEvent.rowIndex);
		this.$.selectedRoom = inEvent.rowIndex;
		this.$.selectedLight = null;
		this.$.roomList.select(inEvent.rowIndex); //OR: this.$.roomList.refresh();
	},
	renderLightRow: function(inSender, inIndex) {
		if (this.lightData && this.lightData.length > 0) {
			var record = this.lightData[inIndex];
			if (record) {
				this.$.lightCaption.setContent(record.caption || record.uniqueId);
				this.$.lightType.setContent(record.type);
				var isRowSelected = (inIndex == this.$.selectedLight);
				if (isRowSelected) {
					this.$.lightListContainer.applyStyle("background-color", "dimgray");
					this.$.lightListContainer.applyStyle("color", "white");
					enyo.log("Selected Item: " + JSON.stringify(record));
					this.showAccessoryController(record.uniqueId, record.uniqueId, "Light");
				} else {
					this.$.lightListContainer.applyStyle("background-color", null);
					this.$.lightListContainer.applyStyle("color", null);
				}
				return true;
			}
		}
	},
	lightClick: function(inSender, inEvent) {
		enyo.log("Light clicked on row: " + inEvent.rowIndex);
		this.$.selectedLight = inEvent.rowIndex;
		this.$.lightList.select(inEvent.rowIndex);	//OR: this.$.roomList.refresh();
	},
	lightDataUpdated: function(self) {
		enyo.log("Accessories updated on: " + self.name);
		self.$.spinnerLights.applyStyle("display", "none");
		self.$.roomList.refresh();
	},
	showAccessoryController: function(accessoryId, accessoryCaption, accessoryType) {
		switch(accessoryType.toLowerCase()) {
			case "room":
				this.$.headerDetail.setContent(accessoryCaption);
				this.$.imageDetail.setSrc("icons/icon-256x256.png");
				this.$.captionDetail.setContent("Home Control");
				break;
			default:
				this.$.headerDetail.setContent(accessoryCaption);
				this.$.imageDetail.setSrc("images/lightbulb-off.png");
				this.$.captionDetail.setContent("Light Bulb Control");
				break;
		}
	},
	lightControlClick: function(inSender, inEvent) {
		if (this.$.imageDetail.src == "images/lightbulb-on.png")
			this.$.imageDetail.setSrc("images/lightbulb-off.png");
		else
			this.$.imageDetail.setSrc("images/lightbulb-on.png");
	}
});
/*
EnumerateObject = function(objectToEnumerate) {
    for (var key in objectToEnumerate) {
        enyo.log("=== prop:" + key + ": " + objectToEnumerate[key]);
        if (objectToEnumerate.hasOwnProperty(key)) {
            var obj = objectToEnumerate[key];
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    enyo.log("...... sub: " + prop + " = " + obj[prop])
                }
            }
        }
    }
}
*/