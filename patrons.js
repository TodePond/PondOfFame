const makePatron = ({name, tier = "Froggy Hero", element = "Fire"}) => {
	const patron = {name, tier, element}
	return patron
}

const froggyHeroes = [
	makePatron({name: "Flora Caulton", element: "Wood"}),
	makePatron({name: "Sebastian Andreasson", element: "Sand"}),
	makePatron({name: "Max Bittker", element: "Fire"}),
	makePatron({name: "@walpolea", element: "Air"}),
	makePatron({name: "Gill W", element: "Flower"}),
	makePatron({name: "Latchy", element: "Wood"}),
	makePatron({name: "Florent Loock", element: "Fire"}),
	makePatron({name: "George McGhee", element: "Fire"}),
	makePatron({name: "Dimitar Irinkov", element: "Fire"}),
	makePatron({name: "@poorsquid", element: "Leaf"}),
	makePatron({name: "The Saddest Biccy - A Pitiful Digestive", element: "Leaf"}),
	makePatron({name: "Magnogen", element: "Water"}),
	makePatron({name: "Chrysophlax", element: "Fire"}),
	makePatron({name: "SeungBum Kim", element: "Fire"}),
	makePatron({name: "Collo", element: "Fire"}),
	makePatron({name: "Andy Bayer", element: "Fire"}),
	makePatron({name: "Erik Jonasson", element: "Leaf"}),
	makePatron({name: "livcomp", element: "Poison"}),
	makePatron({name: "Hayden Jackson", element: "Fire"}),
	makePatron({name: "Brian Zindler", element: "Fire"}),
	makePatron({name: "antovsky", element: "Sand"}),
	makePatron({name: "Benjamin Mastripolito", element: "Sand"}),
	makePatron({name: "Patrick Kennedy", element: "Flower"}),
	makePatron({name: "Ax2u", element: "Poison"}),
	makePatron({name: "Filip Optołowicz"}),
	makePatron({name: "Matt Giallourakis"}),
	makePatron({name: "Willhart", element: "Wood"}),
	makePatron({name: "Maxence", element: "Air"}),
	makePatron({name: "Anton Little", element: "Water", special: "Blue Flannel"}),
	makePatron({name: "stolksdorf", element: "Air"}),
	makePatron({name: "culi", element: "Leaf"}),
	makePatron({name: "Raphaël de Courville", element: "Sand"}),
	makePatron({name: "Craig Fouts"}),
	makePatron({name: "Taos"}),
	makePatron({name: "Sage Fiorentino-Lange"}),
	makePatron({name: "SimplyLinn", element: "Poison", special: "#926aa4"}),
	makePatron({name: "Fuzzyzilla", element: "Leaf"}),
	makePatron({name: "disconcision", element: "Poison"}),
	makePatron({name: "Scott Cardoza"}),
	makePatron({name: "Desktoy Sam", element: "Wood"}),
	makePatron({name: "alex"}),
	makePatron({name: "Mollie Rose"}),
	makePatron({name: "Jethro"}),
	makePatron({name: "John Fresco", element: "Sand"}),
	makePatron({name: "Andy Moody"}),
	makePatron({name: "Kyle"}),
	makePatron({name: "Steve Ruiz", element: "Wood"}),
	makePatron({name: "MG"}),
	makePatron({name: "migujorg"}),
]