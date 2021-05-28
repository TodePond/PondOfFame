const SAVE = (
	"camera:x=187,y=531,scale=0.7823;entities:;id=3,source=FroggyOrange.png,text=Flora Caulton,x=448,y=480,z=0,scale=1.0000,rotation=0.0000;id=2,source=FroggyFlip.png,text=Luke Wilson,x=-279,y=766,z=0,scale=1.0000,rotation=0.0000;id=6,source=Grass2Flip.png,text=undefined,x=898,y=756,z=0,scale=0.7351,rotation=0.0000;id=1,source=Grass2.png,text=undefined,x=-585,y=237,z=0,scale=0.7314,rotation=0.0000;routes:"
)

const urlParams = new URLSearchParams(window.location.search)

const EDIT_MODE = urlParams.has("edit")

const stage = Stage.make()
const {canvas, context} = stage


const camera = {x: 0, y: 0, scale: 1, scaleMod: 1}
const entities = new Map()
const freeEntityIds = new Set()
const layers = new Map()
const routes = new Map()
const freeRouteIds = new Set()

const selectedEntities = new Set()
const selectionBoxStart = [undefined, undefined]

const imageCache = new Map()

// Make an entity AND THEN place it on the map
const createEntity = (...args) => {
    const entity = makeEntity(...args)
    registerEntity(entity)
    return entity
}

// Get an entity id that is free to use (note: remember to remove it from the freeEntityIds list if you use it)
const getNewId = () => {
	findFreeEntityIds()
    if (freeEntityIds.size > 0) {
		return freeEntityIds.values().next().value
	}
    else return entities.size
}

// Place an entity on the map
const registerEntity = (entity) => {
    const id = getNewId()
	loadEntity(entity, id)
    return id
}

// Place an entity on the map in a specific id
const loadEntity = (entity, id) => {
	entity.id = id
	entities.set(id, entity)
	freeEntityIds.delete(id)
	const {z} = entity
	if (layers.get(z) === undefined) {
		layers.set(z, new Map())
	}
	const layer = layers.get(z)
	layer.set(id, entity)
}

const moveLayer = (entity, dz) => {
	const z = entity.z
	const layer = layers.get(z)
	const id = entity.id
	layer.delete(id)
	const nz = z + dz
	if (layers.get(nz) === undefined) {
		layers.set(nz, new Map())
	}
	const newLayer = layers.get(nz)
	newLayer.set(id, entity)
	entity.z = nz
}

// Remove an entity from the map
const unregisterEntity = (id) => {
	const entity = entities.get(id)
    freeEntityIds.add(id)
    entities.delete(id)

	const {z} = entity
	const layer = layers.get(z)
	layer.delete(id)
	if (layer.size === 0) layer.delete(z)
}

// Remove all entities
const unregisterAllEntities = () => {
	freeEntityIds.clear()
	entities.clear()
	layers.clear()
}

// Make an entity object
const makeEntity = (source, {x = 0, y = 0, z = 0, scale = 1, rotation = 0, text} = {}) => {
    const image = getImage(source)
    const entity = {id: undefined, source, image, x, y, z, scale, rotation, text}
    return entity
}

// Get an image element (make one if needed)
const getImage = (source) => {
	if (source === undefined) return new Image()
    const cachedImage = imageCache.get(source)
    if (cachedImage !== undefined) return cachedImage
    const image = new Image()
    image.src = `images/${source}`
    imageCache.set(source, image)
    return image
}

const titleStyle = HTML `<style>
	#title {
		position: absolute;
		top: 0px;
		color: rgb(224, 224, 224);
		font-family: Rosario;
		left: 0px;
		right: 0px;
		text-align: center;
		font-size: 50px;
		user-select: none;
		text-decoration: underline;
		margin: 0;
	}
</style>`
const title = HTML `<div id="title">POND OF FAME</div>`

on.load(() => {
    document.body.appendChild(canvas)
    document.body.style["margin"] = "0"
    canvas.style["background-color"] = "rgb(23, 29, 40)"
    trigger("resize")
    load(SAVE)

	document.head.appendChild(titleStyle)
	document.body.appendChild(title)
    
})

on.resize(() => {
    canvas.width = innerWidth * devicePixelRatio
    canvas.height = innerHeight * devicePixelRatio
	canvas.style.width = innerWidth
	canvas.style.height = innerHeight
	if (innerWidth < (1920)) {
		camera.scaleMod = innerWidth / 1920
	}
})

let clipboard = []
on.keydown(e => {
	if (e.key === "Delete") {
		for (const entity of selectedEntities) {
			unregisterEntity(entity.id)
		}
		return
	}
	if (e.key === "=") {
		for (const entity of selectedEntities.values()) {
			moveLayer(entity, 1)
		}
		return
	}
	if (e.key === "-") {
		for (const entity of selectedEntities.values()) {
			moveLayer(entity, -1)
		}
		return
	}
	if (e.ctrlKey) {
		if (e.key === "p" || e.key === "d") {
			e.preventDefault()
			for (const entity of selectedEntities.values()) {
				print("Entity:", entity)
			}
			return
		}
		if (e.key === "c") {
			clipboard = []
			for (const entity of selectedEntities.values()) {
				clipboard.push({...entity})
			}
			return
		}
		if (e.key === "v") {
			selectedEntities.clear()
			for (const entity of clipboard) {
				entity.d
				const paste = createEntity(entity.source, {...entity})
				paste.d
				selectedEntities.add(paste)
			}
			return
		}
	}
})

const findFreeEntityIds = () => {
	const founds = [false].repeat(entities.size)
	for (const entity of entities.values()) {
		founds[entity.id] = true
	}
	const frees = []
	for (const i in founds) {
		if (!founds[i]) frees.push(i.as(Number))
	}
	freeEntityIds.clear()
	for (const free of frees) {
		freeEntityIds.add(free)
	}
}

on.mousewheel((e) => {
	e.preventDefault()
    const {deltaY} = e

	if (e.altKey) {
		for (const entity of selectedEntities) {
			const zoom = (-deltaY / 100) * (entity.scale - entity.scale * (1 - 0.05))
			entity.scale += zoom
			if (entity.scale < 0) entity.scale = 0
		}
		updateHovers()
		return
	}

	const zoom = (-deltaY / 100) * (camera.scale - camera.scale * (1 - 0.05))
    camera.scale += zoom
	camera.x += zoom
	camera.y += zoom
	if (camera.scale < 0) camera.scale = 0
	updateHovers()
	
}, {passive: false})

on.touchmove(e => {
	if (e.touches.length === 1) {
		//const [touch] = e.d.touches.d
		//touch.d
		e.preventDefault()
	}
	/*const {movementX, movementY} = e
	camera.x -= movementX / camera.scale
	camera.y -= movementY / camera.scale*/
}, {passive: false})

on.mousemove(e => {
	updateHovers()
	if (Mouse.Middle) {
		const {movementX, movementY} = e
		camera.x -= movementX / (camera.scale * camera.scaleMod)
		camera.y -= movementY / (camera.scale * camera.scaleMod)
	}
	else if (Mouse.Right) {
		const {movementX, movementY} = e

		if (e.altKey) {
			const [mx, my] = Mouse.position
			for (const entity of selectedEntities) {
				const space = getEntitySpace(entity)
				const [cx, cy] = space.center
				const [dx, dy] = [cx - mx, cy - my]
				entity.rotation += (movementY * -dx) / 2000
				entity.rotation += (movementX * dy) / 2000
			}
			updateHovers()
			return
		}

		for (const entity of selectedEntities.values()) {
			entity.x += movementX / camera.scale * camera.scaleMod
			entity.y += movementY / camera.scale * camera.scaleMod
		}
	}
})

on.mousedown(e => {
	if (!EDIT_MODE) return
	if (e.button === 0) {
		const [mx, my] = Mouse.position
		selectionBoxStart[0] = mx
		selectionBoxStart[1] = my
		
	}
})

on.mouseup(e => {
	if (!EDIT_MODE) return
	if (e.button === 0) {
		const [mx, my] = Mouse.position
		const [sx, sy] = selectionBoxStart
		if (sx !== undefined || sy !== undefined) {
			let hits = selectedEntities
			if (sx === mx && sy === my) {
				const hit = getHit(mx, my)
				if (hit !== undefined) {
					if ((e.shiftKey || e.ctrlKey) && selectedEntities.has(hit)) {
						selectedEntities.delete(hit)
					}
					else hits = new Set([hit])
				}
				else hits = new Set()
			}
			else {
				hits = getSelects([sx, sy], [mx, my])
			}
			
			if (!e.shiftKey && !e.ctrlKey) {
				selectedEntities.clear()
			}

			for (const hit of hits.values()) {
				selectedEntities.add(hit)
			}
			
			selectionBoxStart[0] = undefined
			selectionBoxStart[1] = undefined
		}
	}
})

on.contextmenu(e => e.preventDefault())

const getHits = (x, y) => {
	const hits = new Set()
	for (const entity of entities.values()) {
		const space = getEntitySpace(entity)
		const isCollision = isSpaceCollision([x, y], space)
		if (isCollision) hits.add(entity)
	}
	return hits
}

const getHit = (x, y) => {
	const hits = getHits(x, y)
	const hit = findTopHit(hits)
	return hit
}

const findTopHit = (hits) => {
	const dummy = {z: -Infinity}
	const hit = [...hits.values()].reduce((a, b) => a.z > b.z? a : b, dummy)
	if (dummy === hit) return undefined
	return hit
}

const updateHovers = () => {
	if (!EDIT_MODE) return
	const [mx, my] = Mouse.position
	const [sx, sy] = selectionBoxStart
	if (sx === undefined || sy === undefined) {
		const hits = getHits(mx, my)
		const hit = findTopHit(hits)
		for (const entity of entities.values()) {
			if (hit === entity) {
				entity.highlight = true
				entity.hover = true
			}
			else if (hits.has(entity)) {
				entity.hover = true
				entity.highlight = false
			}
			else {
				entity.hover = false
				entity.highlight = false
			}
		}
		return
	}
	else {
		const hits = getSelects([sx, sy], [mx, my])
		for (const entity of entities.values()) {
			if (hits.has(entity)) {
				entity.hover = true
				entity.highlight = true
			}
			else {
				entity.hover = false
				entity.highlight = false
			}
		}
	}
}

const getSelects = ([sx, sy], [mx, my]) => {
	const hits = new Set()
	const selection = {rotation: 0, position: [sx, sy], center: [sx+(mx-sx)/2, sy+(my-sy)/2], dimensions: [mx-sx, my-sy]}
	for (const entity of entities.values()) {
		const space = getEntitySpace(entity)
		// TODO: replace with actual rectangle collision detection (instead of faking it with point collision detection)
		if (isSpaceCollision([mx, my], space)) {
			hits.add(entity)
			continue
		}
		if (isSpaceCollision([sx, sy], space)) {
			hits.add(entity)
			continue
		}
		if (isSpaceCollision(selection.center, space)) {
			hits.add(entity)
			continue
		}
		if (isSpaceCollision(space.center, selection)) {
			hits.add(entity)
			continue
		}
		for (const corner of space.corners) {
			const rcorner = rotate(corner, space.center, space.rotation)
			if (isSpaceCollision(rcorner, selection)) {
				hits.add(entity)
				break
			}
		}
	}
	return hits
}

// https://en.wikipedia.org/wiki/Polar_coordinate_system#Converting_between_polar_and_Cartesian_coordinates
const rotate = ([x, y], [ox, oy], radians) => {
	const [dx, dy] = [x - ox, y - oy]
	const d = Math.sqrt(dx**2 + dy**2)
	const angle = Math.atan2(dy,dx)
	const [rx, ry] = [d * Math.cos(radians + angle), d * Math.sin(radians + angle)]
	return [ox + rx, oy + ry]
}

const isSpaceCollision = ([x, y], {rotation, position, center, dimensions}) => {
	if (rotation !== 0) {
		const [rx, ry] = rotate([x, y], center, -rotation)
		return isSpaceCollision([rx, ry], {rotation: 0, position, center, dimensions})
	}

	const [px, py] = position
	const [width, height] = dimensions

	const left = Math.min(px, px + width)
	const right = Math.max(px, px + width)
	const top = Math.min(py, py + height)
	const bottom = Math.max(py, py + height)

	if (x < left) return false
	if (x > right) return false
	if (y < top) return false
	if (y > bottom) return false
	return true
}

const toRadians = (degrees) => degrees * Math.PI / 180
const toDegrees = (radians) => radians * 180 / Math.PI

const makeSpace = ({scale = 1, x = 0, y = 0, width = 100, height = 100, rotation = 0}) => {

	const w = scale * width * camera.scale * camera.scaleMod
	const h = scale * height * camera.scale * camera.scaleMod
	const dimensions = [w, h]

	const px = canvas.width/2 + (x - camera.x - (width * scale)/2) * camera.scale * camera.scaleMod
	const py = canvas.height/2 + (y - camera.y - (height * scale)/2) * camera.scale * camera.scaleMod
	const position = [px, py]

	const cx = px + w/2
	const cy = py + h/2
	const center = [cx, cy]

	const corners = [
		[px, py],
		[px + w, py],
		[px + w, py + h],
		[px, py + h],
	]
	
	return {dimensions, position, center, corners, rotation: toRadians(rotation)}
}

const getEntitySpace = (entity) => {
	const image = entity.image
	const [width, height] = [image.width, image.height]
	const {scale, x, y, rotation} = entity
	return makeSpace({scale, x, y, width, height, rotation})
}

const getRouteId = () => {
	if (freeRouteIds.size > 0) {
		return freeRouteIds.values().next().value
	}
	return routes.size
}

const deleteRoute = (id) => {
	freeRouteIds.add(id)
	routes.delete(id)
}

const deleteAllRoutes = () => {
	freeRouteIds.clear()
	routes.clear()
}

const createRoute = (start, end, {id = getRouteId(), length = 5000, type = "snake", flip = false, slope = 0.5} = {}) => {
	const route = {start, end, length, type, flip, slope, id}
	freeRouteIds.delete(id)
	routes.set(id, route)
	return route
}

const getCurve = ([ax, ay], [bx, by], {length = 5000, type = "snake", flip = false, slope = 0.5} = {}) => {
	const [dx, dy] = [bx - ax, by - ay]
	let [ix, iy] = [dx / length, dy / length]
	if (flip) [ix, iy] = [iy, ix]
	const points = []
	const previous = [ax, ay]
	for (const i of (0).to(length-1)) {
		const [px, py] = previous
		let [jx, jy] = [ix, iy]
		if (type === "snake") {
			const easing = Math.min(i, length-1 - (i))
			const racing  = (length/2 - 1) - easing
			
			const ease = (easing * slope + racing) / (1 + slope)
			const race = (racing * slope + easing) / (1 + slope) 

			jx = ix * 2 * (race) / (length/2 - 1)
			jy = iy * 2 * (ease) / (length/2 - 1)
		}
		else if (type === "single") {

			const easing = length-1-i
			const racing = i

			const ease = (easing * slope + racing) / (1 + slope)
			const race = (racing * slope + easing) / (1 + slope) 

			jx = ix * 2 * ease / (length - 1)
			jy = iy * 2 * race / (length - 1)
		}
		if (flip) [jx, jy] = [jy, jx]
		const [x, y] = [px + jx, py + jy]
		points.push([x, y])
		previous[0] = x
		previous[1] = y
	}
	return points
}

let flightDelay = 0
const animateRoute = (route, plane = 0) => {
	const r = routes.get(route)
	const p = entities.get(plane)
	p.flying = true
	r.flightProgress = 0
	r.flying = true
	flightDelay = 200
}

const MAX_SPEED = 2
let prevRoute = undefined
let prevPlaneRot = undefined
stage.draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

	context.textAlign = "center"

	// Non-Plane Images
	const zs = [...layers.keys()].sort((a, b) => a - b)
	for (const z of zs) {
		const layer = layers.get(z)
		for (const entity of layer.values()) {

			if (entity.source === "Plane.png") continue

			const {image} = entity
			let {dimensions, rotation, center} = getEntitySpace(entity)

			const [width, height] = dimensions
			const [cx, cy] = center
			const [ox, oy] = [-width/2, -height/2]

			context.translate(cx, cy)
			context.rotate(rotation)
			context.drawImage(image, ox, oy, width, height)
			if (entity.text !== "undefined") { //haha woops
				
				context.font = `${70 * entity.scale * camera.scale * camera.scaleMod}px Rosario`
				context.fillStyle = "rgb(224, 224, 224)"
				context.fillText(entity.text, ox + width/2, oy + width * 0.95)
			}
			context.rotate(-rotation)
			context.translate(-(cx), -(cy))
		}
	}

	// Routes
	context.lineWidth = 26 * camera.scale * camera.scaleMod
	context.setLineDash([100 * camera.scale * camera.scaleMod, 50 * camera.scale * camera.scaleMod])
	context.strokeStyle = "rgba(224, 224, 224)"

	let currentFrame = undefined

	for (const route of routes.values()) {
		const {start, end, slope, length, type, flip} = route
		const s = entities.get(start)
		const e = entities.get(end)
		if (s === undefined || e === undefined) {
			deleteRoute(route.id)
			continue
		}
		const [sx, sy] = getEntitySpace(s).center
		const [ex, ey] = getEntitySpace(e).center
		const curve = getCurve([sx, sy], [ex, ey], {slope, length, type, flip})

		context.beginPath()
		context.moveTo(sx, sy)
		let i = -1
		let previous = [sx, sy]
		for (const [x, y] of curve) {
			i++
			if (route.flying && i > route.flightProgress) {
				currentFrame = [previous, [x, y]]
				break
			}
			context.lineTo(x, y, ex, ey)
			previous = [x, y]
		}
		if (route.flying && flightDelay <= 0) {

			prevRoute = route
			const easing = Math.min(route.flightProgress + route.length / 8, (route.length-1) - (route.flightProgress)) * MAX_SPEED
			
			route.flightProgress += MAX_SPEED
			let penalty = MAX_SPEED - (easing / (route.length/3))
			penalty
			if (penalty > MAX_SPEED - MAX_SPEED * 0.06) penalty = MAX_SPEED - MAX_SPEED * 0.06
			route.flightProgress -= penalty
			
			if (route.flightProgress >= length) {
				route.flying = false
			}
		}
		flightDelay--
		context.stroke()
	}

	// Plane Images
	for (const z of zs) {
		const layer = layers.get(z)
		for (const entity of layer.values()) {

			if (entity.source !== "Plane.png") continue

			const {image} = entity
			let {dimensions, rotation, center} = getEntitySpace(entity)

			if (entity.flying) {
				
				if (currentFrame === undefined) {
					const end = entities.get(prevRoute.end)
					entity.x = end.x
					entity.y = end.y
					entity.rotation = toDegrees(prevPlaneRot)
					entity.flying = false
					let newSpace = getEntitySpace(entity)
					dimensions = newSpace.dimensions
					rotation = newSpace.rotation
					center = newSpace.center
				}
				else {
					const [prev, next] = currentFrame
					const [px, py] = prev
					const [nx, ny] = next
					const [dx, dy] = [nx - px, ny - py]
					rotation = Math.atan2(dy, dx)
					center = next
					prevPlaneRot = rotation
				}
			}

			const [width, height] = dimensions
			const [cx, cy] = center
			const [ox, oy] = [-width/2, -height/2]

			context.translate(cx, cy)
			context.rotate(rotation)
			context.drawImage(image, ox, oy, width, height)
			context.rotate(-rotation)
			context.translate(-(cx), -(cy))
		}
	}

	// Hovers
	context.lineWidth = 5 * camera.scale * camera.scaleMod
	context.setLineDash([])
	for (const entity of entities.values()) {
        let {dimensions, rotation, center} = getEntitySpace(entity)
		
		if (entity.flying) {
			const [prev, next] = currentFrame
			const [px, py] = prev
			const [nx, ny] = next
			const [dx, dy] = [nx - px, ny - py]
			rotation = Math.atan2(dy, dx)
			center = next
		}

		const [width, height] = dimensions
		const [cx, cy] = center
		const [ox, oy] = [-width/2, -height/2]

		context.translate(cx, cy)
		context.rotate(rotation)
		
		if (entity.highlight) {
			context.fillStyle = "rgba(0, 128, 255, 25%)"
			context.fillRect(ox, oy, width, height)
		}

		if (selectedEntities.has(entity)) {
			context.strokeStyle = "rgba(0, 255, 128)"
			context.strokeRect(ox, oy, width, height)
		}
		else if (entity.hover) {
			context.strokeStyle = "rgba(0, 128, 255)"
			context.strokeRect(ox, oy, width, height)
		}

		context.rotate(-rotation)
		context.translate(-(cx), -(cy))

    }

	if (Mouse.Left) {
		const [sx, sy] = selectionBoxStart
		if (sx !== undefined && sy !== undefined) {
			const [mx, my] = Mouse.position
			context.strokeStyle = "rgba(0, 128, 255)"
			context.strokeRect(sx, sy, mx - sx, my - sy)
			context.fillStyle = "rgba(0, 128, 255, 25%)"
			context.fillRect(sx, sy, mx - sx, my - sy)
		}
	}
}

// Save the map state to a string
const save = () => {
    const lines = []
    lines.push(`camera:x=${Math.round(camera.x)},y=${Math.round(camera.y)},scale=${camera.scale.toFixed(4)}`)
    lines.push(`entities:`)
    for (const entity of entities.values()) {
        lines.push(`id=${entity.id},source=${entity.source},text=${entity.text},x=${Math.round(entity.x)},y=${Math.round(entity.y)},z=${Math.round(entity.z)},scale=${entity.scale.toFixed(4)},rotation=${entity.rotation.toFixed(4)}`)
    }
	lines.push(`routes:`)
    for (const route of routes.values()) {
        lines.push(`id=${route.id},start=${route.start},end=${route.end},length=${route.length},type=${route.type},flip=${route.flip},slope=${route.slope}`)
    }
    return lines.join(`;`)
}

const Load = MotherTode(`
	:: Camera ";" Entities ";" Routes EOF
	Camera (
		:: "camera:x=" Number ",y=" Number ",scale=" Number
		>> ([c, x, _1, y, _2, scale]) => {
			camera.x = x.output
			camera.y = y.output
			camera.scale = scale.output
		}
	)
	Entities :: "entities:" { Entity }
	Entity (
		:: ";id=" Number ",source=" String ",text=" String ",x=" Number ",y=" Number ",z=" Number ",scale=" Number ",rotation=" Number
		?? ([_1, id, _2, source, _a, text, _3, x, _4, y, _5, z, _6, scale, _7, rotation]) => {
			const entity = makeEntity(source.output, {x: x.output, y: y.output, z: z.output, scale: scale.output, rotation: rotation.output, text: text.output})
			loadEntity(entity, id.output)
			return true
		}
	)
	Routes :: "routes:" { Route }
	Route (
		:: ";id=" Number ",start=" Number ",end=" Number ",length=" Number ",type=" String ",flip=" Boolean ",slope=" Number
		?? ([_1, id, _2, start, _3, end, _4, length, _5, type, _6, flip, _7, slope]) => {
			const route = createRoute(start.output, end.output, {id: id.output, length: length.output, type: type.output, flip: flip.output, slope: slope.output})
			return true
		}
	)
	String :: /[^,]/+
	Number :: "-"? /[0-9.]/+ >> (n) => n.output.as(Number)
	Boolean :: True | False
	True :: "true" >> true
	False :: "false" >> false
`)

// Load a map state
const load = (save) => {
	MotherTode.Term.resetCache()
	unregisterAllEntities()
	const result = Load(save)
	if (!result.success) {
		result.smartLog()
		result.log()
	}
	return result
}
