name = "homecontrol",
enyo.kind({
	name: "enyo.HomeControl",
	kind: enyo.VFlexBox,
	homeHelper: null,
	username: null,
	password: null,
	server: null,
	components: [
		{kind: "Helpers.Homebridge", name: "myHomebridge" },
		{kind: "Helpers.Updater", name: "myUpdater" },
		//UI Elements
		{kind: "PageHeader", components: [
			{kind: "VFlexBox", flex: 1, align: "center", components: [
				{content: "Home Control"},
			]}
		]},
		{kind: "Control", flex:1, layoutKind: "VFlexLayout", pack: "center", align: "middle", components: [
			{kind: "HFlexBox", flex: 1, components: [
				{kind: "Scroller", flex:1, domStyles: {"margin-top": "0px", "min-width": "130px"}, components: [
					{flex: 1, name: "roomList", kind: enyo.VirtualList, className: "list", onSetupRow: "renderRoomRow", components: [
							{kind: "Item", className: "item", components: [
								{kind: "HFlexBox", components: [
									{name: "itemCaption", flex: 2},
									{w: "fill", flex: 1, name: "itemType", domStyles: {"text-align": "right"}}
								]},
						]}
					]},
				]},
				{kind: "VFlexBox", flex: 2, pack: "center", components: [
					{w: "fill", domStyles: {"text-align": "center"}, components: [
						{kind: "Image", flex:1, name: "DeploymentImage", src: "icons/icon-256x256.png", domStyles: {width: "400px", "margin-left": "auto", "margin-right": "auto"}},
					]},
					{w: "fill", name: "DeploymentDetail", content: "Current Accessory: ", domStyles: {"text-align": "center", "margin-left": "100px", "margin-right": "100px"}}
				]},
			]},
			{kind: "Button", caption: "Update", onclick: "loadData"}
		]}
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
	},
	homeDataReady: function(self) {
		enyo.log("Home data is ready for: " + self.name);
		self.data = self.homeHelper.GetHomeLayout();
		self.$.roomList.refresh();
	},
	renderRoomRow: function(inSender, inIndex) {
		if (this.data && this.data.length > 0) {
			var record = this.data[inIndex];
			if (record) {
				this.$.itemCaption.setContent(record.caption);
				this.$.itemType.setContent(record.type);
				return true;
			}
		}
	},
});