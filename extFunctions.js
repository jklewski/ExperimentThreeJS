colorMap = function(){
    var colorData = { "R": [251, 255, 214, 255, 192, 240, 172, 228, 154, 218, 138, 209, 123, 202, 110, 197, 99, 193, 90, 192, 82, 192, 77, 194, 72, 197], "G": [221, 253, 162, 218, 151, 211, 140, 205, 130, 200, 120, 196, 111, 193, 102, 190, 93, 188, 85, 187, 77, 186, 70, 186, 63, 187], "B": [176, 224, 112, 194, 112, 193, 111, 192, 109, 191, 106, 190, 103, 189, 98, 188, 93, 187, 87, 186, 79, 184, 71, 183, 62, 181], "Name": "Spruce" }
    var colorNew = { "R": [], "G": [], "B": [] }
    for (let j = 0; j < 12; j++) {
        var lwR = colorData.R[(j * 2)]
        var ewR = colorData.R[(1 + j * 2)]
        var colorTemp = [];
        for (let i = 0; i < 256; i++) {
            var diff = (ewR - lwR) / 255
            colorTemp[i] = lwR + diff * i
        }
        colorNew.R.push(...colorTemp)
    }
    for (let j = 0; j < 12; j++) {
        var lwR = colorData.G[(j * 2)]
        var ewR = colorData.G[(1 + j * 2)]
        var colorTemp = [];
        for (let i = 0; i < 256; i++) {
            var diff = (ewR - lwR) / 255
            colorTemp[i] = lwR + diff * i
        }
        colorNew.G.push(...colorTemp)
    }
    for (let j = 0; j < 12; j++) {
        var lwR = colorData.B[(j * 2)]
        var ewR = colorData.B[(1 + j * 2)]
        var colorTemp = [];
        for (let i = 0; i < 256; i++) {
            var diff = (ewR - lwR) / 255
            colorTemp[i] = lwR + diff * i
        }
        colorNew.B.push(...colorTemp)
    }
    var wclr = colorNew;
    return wclr
    }