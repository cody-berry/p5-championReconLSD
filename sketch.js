/**
 *  @author Cody
 *  @date 2022.
 *
 *
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
let abilityInfo


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

    /* initialize 'abilityInfo' div for writing later */
    abilityInfo = select('#abilityInfo')
    abilityInfo.html('press any ability to read ability info')

    // championData's JSON keys are the champion names
    for (let championName of Object.keys(championData)) {
        championNames.push(championName)
    }

    importantChampionData = {}

    for (let name of championNames) {
        importantChampionData[name] = {
            // the champion icon that you see when looking at the map in League.
            'icon': loadImage(championData[name]['icon']),
        }

        // now what about the abilities, like 'P', 'Q', 'W', 'E', 'R'?
        for (let abilityPrefix of ['P', 'Q', 'W', 'E', 'R']) {
            // we add them here.
            importantChampionData[name][abilityPrefix] = [
                // the ability name
                championData[name]['abilities'][abilityPrefix][0]['name'],
                // the ability descriptions and leveling attributes, which we
                // will fill in later. this includes cooldowns.
                [],
                // the cooldown
                undefined,
                // the ability icon
                loadImage(championData[name]['abilities'][abilityPrefix][0]['icon'])
            ]
        }

        // adding descriptions to all abilities.
        for (let abilityPrefix of ['P', 'Q', 'W', 'E', 'R']) {
            // the ability descriptions are in the 'effects' section of each
            // ability.
            for (let effect of championData[name]['abilities'][abilityPrefix][0]['effects']) {
                importantChampionData[name][abilityPrefix][1].push([effect['description'],
                // and the leveling content!
                effect['leveling']])
            }

            // the cooldown of the ability is in the 'cooldown' section.
            if (championData[name]['abilities']
                [abilityPrefix][0]['cooldown']) {
                importantChampionData[name][abilityPrefix][2] = championData[name]['abilities']
                    [abilityPrefix][0]['cooldown']['modifiers'][0]
            }
        }
    }

    // a random champion. championNames is a list, and random(), when given
    // a single list, returns a random element of that list.
    randomChampion = random(championNames)

    print(importantChampionData, randomChampion)
}


function draw() {
    background(234, 34, 24)

    imageMode(CORNER)

    // if the champion's icon exist, draw it at the max screen size.
    // the screen size is proportional to most champions' icons
    if (importantChampionData[randomChampion]['icon']) {
        image(importantChampionData[randomChampion]['icon'], 0, 0, width, height)
    }

    // if the passive icon exists, draw it at its normal size in the bottom-left
    // corner. the reason why we're not doing a for loop here is that I want
    // to separate the passive from the other abilities.
    if (importantChampionData[randomChampion]['P'][3]) {
        // i want the bottom-left corner to be at 20, height-20. all icon
        // heights and widths are 64.
        image(importantChampionData[randomChampion]['P'][3], 20, height-84)
    }

    // set the number of icons we've gotten. based on that, we can tell what
    // our starting x-coordinate should be.
    let numIcons = 0

    // for each icon...
    for (let abilityPrefix of ['Q', 'W', 'E', 'R']) {
        // check if it's loaded.
        if (importantChampionData[randomChampion][abilityPrefix][3]) {
            // for every icon, we move to the right by 80. then add 100 for
            // spacing from the passive.
            image(importantChampionData[randomChampion][abilityPrefix][3],
                 numIcons*80 + 130, height-84)
        }
        numIcons++
    }

    /* debugCorner needs to be last so its z-index is highest */
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.showBottom()

    if (frameCount > 3000)
        noLoop()
}

function printAbilityDetails(abilityPrefix) {
    let abilityName =
        // name in a span with a class of 'name'
        "<span class='name'>" + importantChampionData[randomChampion][abilityPrefix][0] + "</span>   "

    let abilityDescriptions = ''

    let abilityLeveling = ''

    // add descriptions and leveling stats
    for (let descriptionAndLeveling of importantChampionData[randomChampion][abilityPrefix][1]) {
        // add descriptions: description plus a newline
        abilityDescriptions += descriptionAndLeveling[0] + " "

        // add leveling stats
        for (let levelingStat of descriptionAndLeveling[1]) {
            abilityLeveling += levelingStat['attribute'] + ': '

            // iterate through every leveling unit
            for (let levelingAttribute of levelingStat['modifiers']) {
                // now iterate through every leveling value

                let lastLevelingValue = -1000

                for (let levelingValue of levelingAttribute['values']) {
                    if (levelingValue === lastLevelingValue) {
                        break
                    }
                    abilityLeveling += levelingValue + '/'
                    lastLevelingValue = levelingValue
                }
                abilityLeveling = abilityLeveling.substring(0, abilityLeveling.length - 1)
                abilityLeveling += levelingAttribute['units'][0] + ' +'
            }
            abilityLeveling = abilityLeveling.substring(0, abilityLeveling.length - 1)

            abilityLeveling += '\n'
        }
    }

    let abilityCooldown = ''
    // iterate through every leveling value only if the cooldown exists
    let lastLevelingValue = -1000
    if (importantChampionData[randomChampion][abilityPrefix][2] !== undefined) {
        abilityCooldown += 'Cooldown: '
        for (let levelingValue of importantChampionData[randomChampion][abilityPrefix][2]['values']) {
            if (levelingValue === lastLevelingValue) {
                break
            }
            abilityCooldown += levelingValue + '/'
            lastLevelingValue = levelingValue
        }
    }
    abilityCooldown = abilityCooldown.substring(0, abilityCooldown.length - 1)

    if (importantChampionData[randomChampion][abilityPrefix][2] !== undefined) {
        abilityCooldown += 's'
    }

    abilityCooldown += '\n\n'

    abilityInfo.html(`<pre>${
        abilityName + abilityCooldown + 
        abilityDescriptions + '\n' + abilityLeveling
    }</pre>`)
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

    if (['P', '1', 'p'].includes(key)) {   // then research the passive
        printAbilityDetails('P')
    } if (['Q', '2', 'q'].includes(key)) { // then research Q
        printAbilityDetails('Q')
    } if (['W', '3', 'w'].includes(key)) { // then research W
        printAbilityDetails('W')
    } if (['E', '4', 'e'].includes(key)) { // then research E
        printAbilityDetails('E')
    } if (['R', '5', 'r'].includes(key)) { // then research R
        printAbilityDetails('R')
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