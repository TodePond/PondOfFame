
const textCanvas = document.createElement("canvas")
const textContext = textCanvas.getContext("2d")

textContext.font = '50px Rosario'
textContext.fillStyle = "red"

const createTextImage = (text) => {
	textContext.clearRect(0, 0, canvas.width, canvas.height)
	textContext.fillText(text, 10, 50)
}

on.load(() => {
	//document.body.appendChild(textCanvas)
})

