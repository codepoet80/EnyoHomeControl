enyo.kind({
	name: "Controller.Lightbulb",
	kind: "Control",
	CurrentAccessory: null,
	CurrentHelper: null,
	currentState: false,
	components: [
		{kind: "VFlexBox", flex: 2, pack: "center", components: [
			{w: "fill", domStyles: {"text-align": "center"}, components: [
				{kind: "Image", flex:1, name: "imageDetail", src: "images/lightbulb-off.png", onclick: "lightControlClick", domStyles: {width: "400px", "margin-left": "auto", "margin-right": "auto"}},
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
				this.$.imageDetail.setSrc("images/lightbulb-on.png");
				this.currentState = true;
				break;
			default:
				this.$.imageDetail.setSrc("images/lightbulb-off.png");
				this.currentState = false;
				break;
		}
	},
	lightControlClick: function() {
		enyo.log("light clicked for id " + JSON.stringify(this.CurrentAccessory.uniqueId));
		var newState = !this.currentState;
		this.SetState(newState);
		this.CurrentHelper.SetAccessoryValue(this, this.CurrentAccessory.uniqueId, "state", newState);
	}
});
