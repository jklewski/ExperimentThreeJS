colorMap = function(name){
    var database = []
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        database = JSON.parse(this.responseText)
        }
    xhttp.open("GET", "./assets/ColorDataBase.json", false);
    xhttp.send();

    var ind = [];
    //get all names
    var allNames = [];
    for (let k = 0; k<database.length; k++) {
        allNames[k] = database[k].name[0]
        if (name == allNames[k]) {ind = k}
    }
    var nMonths = database[ind].R.length/2; //number of months
    var colorData = { "R": database[ind].R, "G": database[ind].G, "B": database[ind].B, "Name": database[ind].name}
    var colorNew = { "R": [], "G": [], "B": [] }
    for (let j = 0; j < nMonths; j++) {
        var lwR = colorData.R[(j * 2)]
        var ewR = colorData.R[(1 + j * 2)]
        var colorTemp = [];
        for (let i = 0; i < 256; i++) { //for unknown reason, I upsample the colordata by factor of 256. This is probably to get the max possible resolution of color, but quite unnecessary. 
            var diff = (ewR - lwR) / 255
            colorTemp[i] = lwR + diff * i
        }
        colorNew.R.push(...colorTemp)
    }
    for (let j = 0; j < nMonths; j++) {
        var lwR = colorData.G[(j * 2)]
        var ewR = colorData.G[(1 + j * 2)]
        var colorTemp = [];
        for (let i = 0; i < 256; i++) {
            var diff = (ewR - lwR) / 255
            colorTemp[i] = lwR + diff * i
        }
        colorNew.G.push(...colorTemp)
    }
    for (let j = 0; j < nMonths; j++) {
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
    return [wclr,allNames]
    }

function mapColor(imdata,imdataOriginalDose,time,res) {
    const width = res;
    const height = res;
    const size = width * height;
    var data = new Uint8Array(4 * size);
    var value = [];
    for (let i = 0; i < imdata.data.length; i += 4) {
    //calculate dose at pixel i
        value = (time/100) * (imdataOriginalDose[i]/255) * 20
        let idHigh = imdata.data[i] + 255 * Math.ceil(value)
        let idLow = imdata.data[i] + 255 * Math.floor(value)
        data[i] = ((wclr.R[idLow] + (wclr.R[idHigh] - wclr.R[idLow]) * (value - Math.floor(value)))/255)*255;
        data[i + 1] = ((wclr.G[idLow] + (wclr.G[idHigh] - wclr.G[idLow]) * (value - Math.floor(value)))/255)*255;
        data[i + 2] = ((wclr.B[idLow] + (wclr.B[idHigh] - wclr.B[idLow]) * (value - Math.floor(value)))/255)*255;
        data[i + 3] = 255
        if (imdata.data[i] < 5 && imdata.data[i+1] < 5 && imdata.data[i+2] < 5) {
            data[i] = 5
            data[i+1] = 5 
            data[i+2] = 5
        }
    }
    return data
}