/**
 *  @author Cody
 *  @date 2022.
 *
 */

let font
let fixedWidthFont
let variableWidthFont
let instructions
let debugCorner /* output debug text in the bottom left corner of the canvas */
let championData /* loaded version of champions.json */
let championNames = [] /* all champion names */
let randomChampion
let importantChampionData /* constantly updated to include everything we
 need to know for all champions' info */


function preload() {
    font = loadFont('data/consola.ttf')
    fixedWidthFont = loadFont('data/consola.ttf')
    variableWidthFont = loadFont('data/meiryo.ttf')
    championData = loadJSON('champions.json')
}


function setup() {
    let cnv = createCanvas(700, 700)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 14)

    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>
        numpad 1 → freeze sketch</pre>`)

    debugCorner = new CanvasDebugCorner(5)

    // championData's JSON keys are the champion names
    for (let championName of Object.keys(championData)) {
        championNames.push(championName)
    }

    importantChampionData = {}

    for (let name of championNames) {
        importantChampionData[name] = {
            // the champion icon that you see when looking at the map in League.
            'icon': loadImage(championData[name]['icon']),
            // the passive name and all descriptions
            'P': [championData[name]['abilities']['P'][0]['name'], [],
                // the passive icon
                loadImage(championData[name]['abilities']['P'][0]['icon'])],
            // Q name, descriptions, and icon
            'Q': [championData[name]['abilities']['Q'][0]['name'], [],
                loadImage(championData[name]['abilities']['Q'][0]['icon'])],
            // W name, descriptions, and icon
            'W': [championData[name]['abilities']['W'][0]['name'], [],
                loadImage(championData[name]['abilities']['W'][0]['icon'])],
            // E name, descriptions, and icon
            'E': [championData[name]['abilities']['E'][0]['name'], [],
                loadImage(championData[name]['abilities']['E'][0]['icon'])],
            // R name, descriptions, and icon
            'R': [championData[name]['abilities']['R'][0]['name'], [],
                loadImage(championData[name]['abilities']['R'][0]['icon'])],
        }
        // adding descriptions to passive
        for (let effect of championData[name]['abilities']['P'][0]['effects']) {
            importantChampionData[name]['P'][1].push(effect['description'])
        }
        // adding descriptions to Q
        for (let effect of championData[name]['abilities']['Q'][0]['effects']) {
            importantChampionData[name]['Q'][1].push(effect['description'])
        }
        // adding descriptions to W
        for (let effect of championData[name]['abilities']['W'][0]['effects']) {
            importantChampionData[name]['W'][1].push(effect['description'])
        }
        // adding descriptions to E
        for (let effect of championData[name]['abilities']['E'][0]['effects']) {
            importantChampionData[name]['E'][1].push(effect['description'])
        }
        // adding descriptions to R
        for (let effect of championData[name]['abilities']['R'][0]['effects']) {
            importantChampionData[name]['R'][1].push(effect['description'])
        }
    }

    // a random champion. championNames is a list, and random(), when given
    // a single list, returns a random element of that list.
    randomChampion = random(championNames)

    print(importantChampionData, randomChampion)
}


function draw() {
    background(234, 34, 24)

    /* debugCorner needs to be last so its z-index is highest */
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.showBottom()

    imageMode(CORNER)

    // if the champion's icon exist, draw it at the max screen.
    // the screen size is proportional to most champions' icons
    if (importantChampionData[randomChampion]['icon']) {
        image(importantChampionData[randomChampion]['icon'], 0, 0, width, height)
    }

    if (frameCount > 3000)
        noLoop()
}


function keyPressed() {
    /* stop sketch */
    if (keyCode === 97) { /* numpad 1 */
        noLoop()
        instructions.html(`<pre>
            sketch stopped</pre>`)
    }

    if (key === '`') { /* toggle debug corner visibility */
        debugCorner.visible = !debugCorner.visible
        console.log(`debugCorner visibility set to ${debugCorner.visible}`)
    }
}


/** 🧹 shows debugging info using text() 🧹 */
class CanvasDebugCorner {
    constructor(lines) {
        this.visible = true
        this.size = lines
        this.debugMsgList = [] /* initialize all elements to empty string */
        for (let i in lines)
            this.debugMsgList[i] = ''
    }

    setText(text, index) {
        if (index >= this.size) {
            this.debugMsgList[0] = `${index} ← index>${this.size} not supported`
        } else this.debugMsgList[index] = text
    }

    showBottom() {
        if (this.visible) {
            noStroke()
            textFont(fixedWidthFont, 14)

            const LEFT_MARGIN = 10
            const DEBUG_Y_OFFSET = height - 10 /* floor of debug corner */
            const LINE_SPACING = 2
            const LINE_HEIGHT = textAscent() + textDescent() + LINE_SPACING

            /* semi-transparent background */
            fill(0, 0, 0, 10)
            rectMode(CORNERS)
            const TOP_PADDING = 3 /* extra padding on top of the 1st line */
            rect(
                0,
                height,
                width,
                DEBUG_Y_OFFSET - LINE_HEIGHT * this.debugMsgList.length - TOP_PADDING
            )

            fill(0, 0, 100, 100) /* white */
            strokeWeight(0)

            for (let index in this.debugMsgList) {
                const msg = this.debugMsgList[index]
                text(msg, LEFT_MARGIN, DEBUG_Y_OFFSET - LINE_HEIGHT * index)
            }
        }
    }

    showTop() {
        if (this.visible) {
            noStroke()
            textFont(fixedWidthFont, 14)

            const LEFT_MARGIN = 10
            const TOP_PADDING = 3 /* extra padding on top of the 1st line */

            /* offset from top of canvas */
            const DEBUG_Y_OFFSET = textAscent() + TOP_PADDING
            const LINE_SPACING = 2
            const LINE_HEIGHT = textAscent() + textDescent() + LINE_SPACING

            /* semi-transparent background, a console-like feel */
            fill(0, 0, 0, 10)
            rectMode(CORNERS)

            rect( /* x, y, w, h */
                0,
                0,
                width,
                DEBUG_Y_OFFSET + LINE_HEIGHT*this.debugMsgList.length/*-TOP_PADDING*/
            )

            fill(0, 0, 100, 100) /* white */
            strokeWeight(0)

            textAlign(LEFT)
            for (let i in this.debugMsgList) {
                const msg = this.debugMsgList[i]
                text(msg, LEFT_MARGIN, LINE_HEIGHT*i + DEBUG_Y_OFFSET)
            }
        }
    }
}