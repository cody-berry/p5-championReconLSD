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
/* what is the ability we've selected? */
let selectedAbility

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
    textFont(font, 20)

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
                [
                    // the ability name for the first mode
                    championData[name]['abilities'][abilityPrefix][0]['name'],
                    // the ability descriptions and leveling attributes, which we
                    // will fill in later. this includes cooldowns.
                    [],
                    // the cooldown for the first mode
                    undefined,
                    // the ability icon
                    loadImage(championData[name]['abilities'][abilityPrefix][0]['icon']),
                    // non-null properties
                    {}
                ]
            ]

            if (championData[name]['abilities'][abilityPrefix][1]) {
                importantChampionData[name][abilityPrefix].push(
                    [
                        // the ability name for the second mode
                        championData[name]['abilities'][abilityPrefix][1]['name'],
                        // the ability descriptions and leveling attributes, which we
                        // will fill in later. this includes cooldowns.
                        [],
                        // the cooldown for the second mode
                        undefined,
                        // the ability icon
                        loadImage(championData[name]['abilities'][abilityPrefix][0]['icon']),
                        // non-null properties
                        {}
                    ]
                )
            }
        }

        // adding descriptions/leveling/cooldown/non-null properties to all
        // abilities.
        for (let abilityPrefix of ['P', 'Q', 'W', 'E', 'R']) {
            // the ability descriptions are in the 'effects' section of each
            // ability.
            for (let effect of championData[name]['abilities'][abilityPrefix][0]['effects']) {
                importantChampionData[name][abilityPrefix][0][1].push([effect['description'],
                    // and the leveling content!
                    effect['leveling']])
            }

            // the cooldown of the ability is in the 'cooldown' section.
            if (championData[name]['abilities']
                [abilityPrefix][0]['cooldown']) {
                importantChampionData[name][abilityPrefix][0][2] = championData[name]['abilities']
                    [abilityPrefix][0]['cooldown']['modifiers'][0]
            }

            // add non-null properties other than 'effects', 'name', 'icon',
            // 'cooldown', 'notes', and 'blurb', which pretty much has to be
            // non-null.
            for (let property of Object.keys(championData[name]['abilities'][abilityPrefix][0])) {
                if ((!['effects', 'name', 'icon', 'cooldown', 'notes', 'blurb'].includes(property)) && (championData[name]['abilities'][abilityPrefix][0][property])) {
                    // if the property is NOT the cost:
                    if (property !== 'cost') {
                        importantChampionData[name][abilityPrefix][0][4][property] = championData[name]['abilities'][abilityPrefix][0][property]
                    } else { // if the property is the cost
                        // if the cost is a leveling thing:
                        if (Object.keys(championData[name]['abilities'][abilityPrefix][0]['cost']).includes('modifiers')) {
                            // we basically do the same things we do for
                            // 'cooldown', if you haven't already seen that.
                            importantChampionData[name][abilityPrefix][0][4][property] = ''
                            let lastLevelingValue = -1000
                            for (let levelingValue of championData[name]['abilities'][abilityPrefix]
                                [0]['cost']['modifiers'][0]['values']) {
                                if (levelingValue === lastLevelingValue) {
                                    break
                                }
                                importantChampionData[name][abilityPrefix][0][4][property] += levelingValue + '/'
                                lastLevelingValue = levelingValue
                            }
                            importantChampionData[name][abilityPrefix][0][4][property] =
                                importantChampionData[name][abilityPrefix][0][4][property].substring(0, importantChampionData[name][abilityPrefix][0][4][property].length - 1)
                        }
                        // otherwise:
                        else {
                            // we simply treat 'cost' as a normal property
                            importantChampionData[name][abilityPrefix][0][4][property] =
                                championData[name]['abilities'][abilityPrefix][0][property]
                        }
                    }
                }
            }

            // now for the second mode.
            if (importantChampionData[name][abilityPrefix][1]) {
                // the ability descriptions are in the 'effects' section of each
                // ability.
                for (let effect of championData[name]['abilities'][abilityPrefix][1]['effects']) {
                    importantChampionData[name][abilityPrefix][1][1].push([effect['description'],
                        // and the leveling content!
                        effect['leveling']])
                }

                // the cooldown of the ability is in the 'cooldown' section.
                if (championData[name]['abilities']
                    [abilityPrefix][1]['cooldown']) {
                    importantChampionData[name][abilityPrefix][1][2] = championData[name]['abilities']
                        [abilityPrefix][1]['cooldown']['modifiers'][0]
                }

                // add non-null properties other than 'effects', 'name', 'icon',
                // 'cooldown', 'notes', and 'blurb', which pretty much has to be
                // non-null.
                for (let property of Object.keys(championData[name]['abilities'][abilityPrefix][1])) {
                    if ((!['effects', 'name', 'icon', 'cooldown', 'notes', 'blurb'].includes(property)) && (championData[name]['abilities'][abilityPrefix][1][property])) {
                        // if the property is NOT the cost:
                        if (property !== 'cost') {
                            importantChampionData[name][abilityPrefix][1][4][property] = championData[name]['abilities'][abilityPrefix][1][property]
                        } else { // if the property is the cost
                            // if the cost is a leveling thing:
                            if (Object.keys(championData[name]['abilities'][abilityPrefix][1]['cost']).includes('modifiers')) {
                                // we basically do the same things we do for
                                // 'cooldown', if you haven't already seen that.
                                importantChampionData[name][abilityPrefix][1][4][property] = ''
                                let lastLevelingValue = -1000
                                for (let levelingValue of championData[name]['abilities'][abilityPrefix]
                                    [1]['cost']['modifiers'][0]['values']) {
                                    if (levelingValue === lastLevelingValue) {
                                        break
                                    }
                                    importantChampionData[name][abilityPrefix][1][4][property] += levelingValue + '/'
                                    lastLevelingValue = levelingValue
                                }
                                importantChampionData[name][abilityPrefix][1][4][property] =
                                    importantChampionData[name][abilityPrefix][1][4][property].substring(0, importantChampionData[name][abilityPrefix][1][4][property].length - 1)
                            }
                            // otherwise:
                            else {
                                // we simply treat 'cost' as a normal property
                                importantChampionData[name][abilityPrefix][1][4][property] =
                                    championData[name]['abilities'][abilityPrefix][1][property]
                            }
                        }
                    }
                }
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
    textFont(font, 20)
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
        // however, if we're selecting this ability, we display it up a bit
        // from where it's supposed to be and stroke. this is why we
        // noStroke after.
        if (selectedAbility === 'P') {
            noFill()
            stroke(0, 0, 100)
            strokeWeight(2)
            rect(20, height-104, 84, height-40)
            stroke(0, 0, 100, 75)
            rect(19, height-105, 85, height-39)
            stroke(0, 0, 100, 50)
            rect(18, height-106, 86, height-38)
            stroke(0, 0, 100, 33)
            rect(17, height-107, 87, height-37)
            stroke(0, 0, 100, 22)
            rect(16, height-108, 88, height-36)
            stroke(0, 0, 100, 16)
            rect(15, height-109, 89, height-35)
            stroke(0, 0, 100, 10)
            rect(14, height-110, 90, height-34)
            stroke(0, 0, 100, 5)
            rect(13, height-111, 91, height-33)
            image(importantChampionData[randomChampion]['P'][3], 20, height-104)
        } else {
            image(importantChampionData[randomChampion]['P'][3], 20, height-84)
        }

        noStroke()

        fill(0, 0, 100)
        textAlign(LEFT, BOTTOM)
        text('P', 42, height - 150)
    }

    // set the number of icons we've gotten. based on that, we can tell what
    // our starting x-coordinate should be.
    let numIcons = 0

    // for each icon...
    for (let abilityPrefix of ['Q', 'W', 'E', 'R']) {
        // check if it's loaded.
        if (importantChampionData[randomChampion][abilityPrefix][3]) {
            // for every icon, we move to the right by 80. then add 140 for
            // spacing from the passive.
            // however, if we're selecting this ability, we display it up a bit
            // from where it's supposed to be and stroke. this is why we
            // noStroke after.
            if (selectedAbility === abilityPrefix) {
                noFill()
                stroke(0, 0, 100)
                strokeWeight(2)
                rect(numIcons * 80 + 140, height-104, numIcons*80+204, height-40)
                stroke(0, 0, 100, 75)
                rect(numIcons * 80 + 139, height-105, numIcons*80+205, height-39)
                stroke(0, 0, 100, 50)
                rect(numIcons * 80 + 138, height-106, numIcons*80+206, height-38)
                stroke(0, 0, 100, 33)
                rect(numIcons * 80 + 137, height-107, numIcons*80+207, height-37)
                stroke(0, 0, 100, 22)
                rect(numIcons * 80 + 136, height-108, numIcons*80+208, height-36)
                stroke(0, 0, 100, 16)
                rect(numIcons * 80 + 135, height-109, numIcons*80+209, height-35)
                stroke(0, 0, 100, 10)
                rect(numIcons * 80 + 134, height-110, numIcons*80+210, height-34)
                stroke(0, 0, 100, 5)
                rect(numIcons * 80 + 133, height-111, numIcons*80+211, height-33)
                image(importantChampionData[randomChampion][abilityPrefix][3], numIcons * 80 + 140, height - 104)
            } else {
                image(importantChampionData[randomChampion][abilityPrefix][3],
                    numIcons * 80 + 140, height - 84)
            }

            noStroke()

            fill(0, 0, 100)
            textAlign(LEFT, BOTTOM)
            text(abilityPrefix, numIcons*80 + 162, height - 150)
        }
        numIcons++
    }

    /* debugCorner needs to be last so its z-index is highest */
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.showTop()
}

function printAbilityDetails(abilityPrefix) {
    let abilityName =
        // name in a span with a class of 'name'
        "<span class=\"name\">" +
        importantChampionData[randomChampion][abilityPrefix][0][0] + "</span>   "

    let abilityDescriptions = ''

    let abilityLeveling = ''

    // add descriptions and leveling stats
    for (let descriptionAndLeveling of importantChampionData[randomChampion][abilityPrefix][0][1]) {
        // add descriptions: description plus a newline
        abilityDescriptions += descriptionAndLeveling[0] + " "

        // add leveling stats
        for (let levelingStat of descriptionAndLeveling[1]) {
            abilityLeveling += levelingStat['attribute'] + ': '

            let isFirstLevelingAttribute = true

            // iterate through every leveling unit
            for (let levelingAttribute of levelingStat['modifiers']) {
                // make sure to add colors using '<span>'s
                let modifierSpanClass = undefined
                switch (levelingAttribute['units'][0]) {
                    // AP-related. note that no % bonus AP is to be found.
                    case '% AP':
                        modifierSpanClass = 'ap'
                        break

                    // AD-related
                    case '% AD':
                        modifierSpanClass = 'ad'
                        break
                    case '% bonus AD':
                        modifierSpanClass = 'ad'
                        break

                    // health-related content
                    case '% maximum health':
                        modifierSpanClass = 'hp'
                        break
                    case '% of target\'s maximum health':
                        modifierSpanClass = 'hp'
                        break
                    case '%  of target\'s maximum health':
                        modifierSpanClass = 'hp'
                        break
                    case '% missing health':
                        modifierSpanClass = 'hp'
                        break
                    case '% of missing health':
                        modifierSpanClass = 'hp'
                        break

                    // armor-related
                    case '% armor':
                        modifierSpanClass = 'armor'
                        break
                    case '% bonus armor':
                        modifierSpanClass = 'armor'
                        break
                    case '% total armor':
                        modifierSpanClass = 'armor'
                        break

                    // magic-resistance related. note that no '% magic
                    // resistance' is to be found.
                    case '% bonus magic resistance':
                        modifierSpanClass = 'mr'
                        break
                    case '% total magic resistance':
                        modifierSpanClass = 'mr'
                        break
                }

                if (modifierSpanClass) {
                    abilityLeveling += `<span class=${modifierSpanClass}>`
                }

                if (!isFirstLevelingAttribute) {
                    abilityLeveling += ' (+ '
                }

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

                abilityLeveling += `${levelingAttribute['units'][0]}`

                if (!isFirstLevelingAttribute) {
                    abilityLeveling += ')'
                }

                if (modifierSpanClass) {
                    abilityLeveling += `</span>`
                }

                isFirstLevelingAttribute = false
            }

            abilityLeveling += '<br>'
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

    let abilityNonNullProperties = ', '

    // add every non null property in importantChampionData
    for (let nonNullProperty of Object.keys(importantChampionData[randomChampion][abilityPrefix][0][4])) {
        // oh, and put the non-null property key in an understandable
        // English form first.
        // make the first letter capital. the process involves getting the
        // first character, then transforming it into uppercase. Then add
        // the rest of the letters. It makes sense.
        let nonNullPropertyFirstLetterUppercase = nonNullProperty.charAt(0).toUpperCase() + nonNullProperty.slice(1)

        // then, for every uppercase letter other than the first, make it a
        // space plus the lowercase version of the uppercase letter.
        let understandablePropertyName = nonNullPropertyFirstLetterUppercase[0]

        for (let letter of nonNullPropertyFirstLetterUppercase.slice(1)) {
            if (letter.toLowerCase() === letter) { // it's lowercase
                understandablePropertyName += letter
            } else { // it's uppercase
                understandablePropertyName += ' ' + letter.toLowerCase()
            }
        }

        abilityNonNullProperties += `${understandablePropertyName}: ${importantChampionData[randomChampion][abilityPrefix][0][4][nonNullProperty]}, `
    }

    abilityNonNullProperties = abilityNonNullProperties.substring(0, abilityNonNullProperties.length - 2)

    abilityNonNullProperties += '<br><br>'

    abilityInfo.html(`${
        abilityName + abilityCooldown + abilityNonNullProperties +
        abilityDescriptions + '<br><br>' + abilityLeveling + '<br><hr><br>'
    }`)
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
        selectedAbility = 'P'
        printAbilityDetails('P')
    } if (['Q', '2', 'q'].includes(key)) { // then research Q
        selectedAbility = 'Q'
        printAbilityDetails('Q')
    } if (['W', '3', 'w'].includes(key)) { // then research W
        selectedAbility = 'W'
        printAbilityDetails('W')
    } if (['E', '4', 'e'].includes(key)) { // then research E
        selectedAbility = 'E'
        printAbilityDetails('E')
    } if (['R', '5', 'r'].includes(key)) { // then research R
        selectedAbility = 'R'
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