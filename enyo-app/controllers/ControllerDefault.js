enyo.kind({
	name: "Controller.Default",
	kind: "Control",
	SupportedAccessories: [
		"room"
	],
	components: [
		{kind: "VFlexBox", flex: 2, pack: "center", components: [
			{w: "fill", domStyles: {"text-align": "center"}, components: [
				{kind: "Image", flex:1, name: "imageDetail", src: "icons/icon-256x256.png", onclick: "lightControlClick", domStyles: {"margin-top": "20px", width: "200px", "margin-left": "auto", "margin-right": "auto"}},
			]},
			{w: "fill", name: "captionDetail", content: "Home Control", domStyles: {"text-align": "center", "margin-left": "100px", "margin-right": "100px"}}
		]},

	],
	create: function() {
		this.inherited(arguments);
		enyo.warn(this.name + " created!");
		this.$.imageDetail.applyStyle("height", (window.innerHeight * 0.35) + "px");
		this.$.imageDetail.applyStyle("width", (window.innerHeight * 0.35) + "px");
	},
});
