enyo.kind({
	name: "Controller.Lightbulb",
	kind: "Control",
	components: [
		{kind: "VFlexBox", flex: 2, pack: "center", components: [
			{w: "fill", domStyles: {"text-align": "center"}, components: [
				{kind: "Image", flex:1, name: "imageDetail", src: "images/lightbulb-on.png", onclick: "lightControlClick", domStyles: {width: "400px", "margin-left": "auto", "margin-right": "auto"}},
			]},
			{w: "fill", name: "captionDetail", content: "Light Controller", domStyles: {"text-align": "center", "margin-left": "100px", "margin-right": "100px"}}
		]},

	],
	create: function() {
		enyo.warn("Lightbulb Controller created!");
		this.inherited(arguments);
	},
});
