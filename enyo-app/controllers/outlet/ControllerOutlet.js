enyo.kind({
	name: "Controller.Outlet",
	kind: "Control",
	layoutKind: "VFlexLayout", 
	/* Public Interface */
	SupportedAccessories: [
		"outlet",
		"television"
	],
	published: {
		accessory: null,
		helper: null,
		state: false,
		amount: 0,
		condition: true
	},
	events: {
		onAccessoryChanged: "",
	},
	create: function() {
		this.inherited(arguments);
		enyo.warn(this.name + " created!");
		this.$.imageDetail.applyStyle("height", (window.innerHeight * 0.35) + "px");
		this.$.imageDetail.applyStyle("width", (window.innerHeight * 0.35) + "px");
		this.accessoryChanged();
	},
	stateChanged: function(oldState) {	//This is a UI function only, to actually change the accessory value, call the Helper
		enyo.log(this.name + " is setting " + this.SupportedAccessories[0] + " state from: " + oldState + " to " + this.state);
		var newCaption = "Off";
		switch(this.state) {
			case true:
				newCaption = "On"
				this.$.imageDetail.setSrc("controllers/outlet/outlet-on.png");
				break;
			default:
				this.$.imageDetail.setSrc("controllers/outlet/outlet-off.png");
				break;
		}
		if (this.accessory.caption)
			newCaption = this.accessory.caption + " " + newCaption;
		this.$.captionDetail.setContent(newCaption);
	},
	accessoryChanged: function(oldAccessory) {
		if (this.accessory && this.accessory.caption) {
			enyo.log(this.name + " has been informed of a new accessory " + this.accessory.caption);
			enyo.log(JSON.stringify(this.accessory));
			this.state = this.accessory.state;
			this.stateChanged();
			this.amount = this.accessory.amount;
			this.condition = this.accessory.condition;
		}
	},
	/* Private Definitions */
	components: [
		{kind:"Scroller", flex: 1, components: [
			{w: "fill", domStyles: {"text-align": "center"}, components: [
				{kind: "Image", flex:1, name: "imageDetail", src: "controllers/outlet/outlet-off.png", onclick: "outletControlClick", domStyles: {width: "400px", "margin-left": "auto", "margin-right": "auto"}},
			]},
			{w: "fill", name: "captionDetail", content: "Outlet Controller", domStyles: {"text-align": "center", "margin-left": "100px", "margin-right": "100px"}},
		]},

	],
	outletControlClick: function(inSender, inEvent){
		enyo.log(this.name + " saw " + this.SupportedAccessories[0] + " clicked for ID: " + JSON.stringify(this.accessory.uniqueId));
		var newState = !this.state;
		this.state = newState;
		this.helper.SetAccessoryValue(this, this.accessory.uniqueId, this.accessory.type, "state", newState);
		this.stateChanged();
		this.doAccessoryChanged(inEvent);
	},
	dimmerChanged: function(inSender, inEvent) {
		this.amount = this.$.sliderDimmer.position;
		enyo.log("Dimmer value: " + this.amount);
		this.helper.SetAccessoryValue(this, this.accessory.uniqueId, this.accessory.type, "amount", this.amount);
		this.doAccessoryChanged(inEvent);
	}
});