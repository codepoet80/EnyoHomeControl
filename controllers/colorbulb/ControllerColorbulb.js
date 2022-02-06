enyo.kind({
	name: "Controller.Colorbulb",
	kind: "Control",
	/* Public Interface */
	SupportedAccessories: [
		"colorbulb"
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
		this.$.imageDetail.applyStyle("height", (window.innerHeight * 0.4) + "px");
		this.$.imageDetail.applyStyle("width", (window.innerHeight * 0.4) + "px");
		this.accessoryChanged();
	},
	stateChanged: function(oldState) {	//This is a UI function only, to actually change the accessory value, call the Helper
		enyo.log(this.name + " is setting " + this.SupportedAccessories[0] + " state from: " + oldState + " to " + this.state);
		var newCaption = "Off";
		switch(this.state) {
			case true:
				newCaption = "On"
				this.$.imageDetail.setSrc("controllers/lightbulb/lightbulb-on.png");
				break;
			default:
				this.$.imageDetail.setSrc("controllers/lightbulb/lightbulb-off.png");
				break;
		}
		if (this.accessory.caption)
			newCaption = this.accessory.caption + " " + newCaption;
		this.$.captionDetail.setContent(newCaption);
	},
	accessoryChanged: function(oldAccessory) {
		if (this.accessory && this.accessory.caption) {
			enyo.log(this.name + " has been informed of a new accessory " + this.accessory.caption);
			//enyo.log(JSON.stringify(this.accessory));
			this.state = this.accessory.state;
			this.stateChanged();
			this.amount = this.accessory.amount;
			this.$.sliderHue.setProperty("position", this.amount.hue);
			this.$.sliderSaturation.setProperty("position", this.amount.saturation);
			this.$.sliderBright.setProperty("position", this.amount.brightness);
			this.condition = this.accessory.condition;
		}
	},
	/* Private Definitions */
	components: [
		{kind: "VFlexBox", flex: 2, pack: "center", components: [
			{w: "fill", domStyles: {"text-align": "center"}, components: [
				{kind: "Image", flex:1, name: "imageDetail", src: "controllers/lightbulb/lightbulb-off.png", onclick: "lightControlClick", domStyles: {width: "400px", "margin-left": "auto", "margin-right": "auto"}},
			]},
			{w: "fill", name: "captionDetail", content: "Light Controller", domStyles: {"text-align": "center", "margin-left": "100px", "margin-right": "100px"}},
			{kind: "VFlexBox", pack: "center", components: [
				{content: "Hue", domStyles: {"margin-left": "15%"}},
				{kind: "Slider", name: "sliderHue", title: "Hue", onChange: "dimmerChanged", domStyles: { width:"70%", "margin-left": "auto", "margin-right": "auto"}},
			]},
			{kind: "VFlexBox", pack: "center", components: [
				{content: "Saturation", domStyles: {"margin-left": "15%"} },
				{kind: "Slider", name: "sliderSaturation", title: "Saturation", onChange: "dimmerChanged", domStyles: {width: "70%", "margin-left": "auto", "margin-right": "auto"}},
			]},
			{kind: "VFlexBox", pack: "center", components: [
				{content: "Brightness", domStyles: {"margin-left": "15%"} },
				{kind: "Slider", name: "sliderBright", title:"Brightness", onChange: "dimmerChanged", domStyles: {width: "70%", "margin-left": "auto", "margin-right": "auto"}},
			]},
		]},
	],
	lightControlClick: function(inSender, inEvent){
		enyo.log(this.name + " saw " + this.SupportedAccessories[0] + " clicked for ID: " + JSON.stringify(this.accessory.uniqueId));
		var newState = !this.state;
		this.state = newState;
		this.helper.SetAccessoryValue(this, this.accessory.uniqueId, this.accessory.type, "state", newState);
		this.stateChanged();
		this.doAccessoryChanged(inEvent);
	},
	dimmerChanged: function(inSender, inEvent) {
		enyo.log("Dimmer " + inSender.name + " title: " + inSender.title + " value: " + inSender.position);
		this.amount[inSender.title.toLowerCase()] = inSender.position;
		this.helper.SetAccessoryValue(this, this.accessory.uniqueId, this.accessory.type, inSender.title, inSender.position);
	}
});