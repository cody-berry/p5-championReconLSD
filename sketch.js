/**
 *  @author Cody
 *  @date 2022.7.30
 *
 *  download http://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions.json
 *  as a file and load it in JSON. print it out
 *  examine the structure of items.json, champions.json,
 *  {someChampion}.json, {someItemID}.json.
 *  display one image of a champion
 *  display ability images from a champion
 *  display passive image from a champion
 *  make it so that it loads a random champion every time
 *  make it so that if you press P or 1, it will reveal the champion's passive's
 *  tooltip in HTML
 *  make it so that if you press:
 *      Q or 2, it will reveal the champion's Q's tooltip in HTML
 *      W or 3, it will reveal the champion's W's tooltip in HTML
 *      .
 *      .
 *      .
 *  write an algorithm that will figure out all the opening and closing
 *  tags, and which closing tag closes a specific opening tag, then parse
 *  the tooltip with the algorithm
 *  replace all the opening and closing brackets with their respective values
 *  color everything in between the brackets and add the appropriate images
 */

let font
let instructions
let debugCorner /* output debug text in the bottom left corner of the canvas */


function preload() {
    font = loadFont('data/consola.ttf')
}


function setup() {
    let cnv = createCanvas(600, 300)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 14)

    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>
        numpad 1 → freeze sketch</pre>`)

    debugCorner = new CanvasDebugCorner(5)
}


function draw() {
    background(234, 34, 24)

    /* debugCorner needs to be last so its z-index is highest */
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.show()

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
}


/** 🧹 shows debugging info using text() 🧹 */
class CanvasDebugCorner {
    constructor(lines) {
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

    show() {
        textFont(font, 14)

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
            DEBUG_Y_OFFSET - LINE_HEIGHT*this.debugMsgList.length - TOP_PADDING
        )

        fill(0, 0, 100, 100) /* white */
        strokeWeight(0)

        for (let index in this.debugMsgList) {
            const msg = this.debugMsgList[index]
            text(msg, LEFT_MARGIN, DEBUG_Y_OFFSET - LINE_HEIGHT * index)
        }
    }
}