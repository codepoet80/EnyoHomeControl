enyo.kind({
	name: "Controller.Colorbulb",
	kind: "Control",
	CurrentAccessory: null,
	CurrentHelper: null,
	CurrentState: false,
	SupportedAccessories: [
		"colorbulb"
	],
	components: [
		{kind: "VFlexBox", flex: 2, pack: "center", components: [
			{w: "fill", domStyles: {"text-align": "center"}, components: [
				{kind: "Image", flex:1, name: "imageDetail", src: "controllers/lightbulb/lightbulb-off.png", onclick: "lightControlClick", domStyles: {width: "400px", "margin-left": "auto", "margin-right": "auto"}},
			]},
			{w: "fill", name: "captionDetail", content: "Light Controller", domStyles: {"text-align": "center", "margin-left": "100px", "margin-right": "100px"}}
		]},

	],
	create: function() {
		enyo.warn("Lightbulb Controller created!");
		this.inherited(arguments);
	},
	SetState: function(state) {
		enyo.log("the lightbulb state should be: " + state)
		switch(state) {
			case true:
				this.$.imageDetail.setSrc("controllers/lightbulb/lightbulb-on.png");
				this.CurrentState = true;
				break;
			default:
				this.$.imageDetail.setSrc("controllers/lightbulb/lightbulb-off.png");
				this.CurrentState = false;
				break;
		}
	},
	lightControlClick: function() {
		enyo.log("light clicked for id " + JSON.stringify(this.CurrentAccessory.uniqueId));
		var newState = !this.CurrentState;
		this.SetState(newState);
		this.CurrentHelper.SetAccessoryValue(this, this.CurrentAccessory.uniqueId, "state", newState);
	}
});
