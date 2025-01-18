let crops = ["Arugula", "Broccoli", "Bok Choy", "Chives", "Cilantro", "Dandelions", "Kale", "Lettuce", "Mint", "Mustard Greens", "Parsley", "Spinach"];
let cropLengths = [13, 18, 9, 14, 12, 12, 18, 9, 21, 20, 8, 9];
let cropSpacings = [8, 18, 8, 9, 7, 8, 18, 12, 21, 15, 10, 5];
let numOfWeeks = [4, 12, 4, 5, 6, 12, 4, 5, 6, 5, 5, 6];
let tbsp = [0.733, 2.07, 1.13, 1.4, 1, 0.93, 1.33, 0.67, 1.47, 1.2, 0.87, 1.4];
let sunlight = [13, 13, 15, 15, 13, 16, 16, 15, 15, 15, 15, 12];
let plantCosts = [13, 4.49, 2.62, 0.75, 6.45, 6.79, 6, 8.98, 8.60, 0.66, 5.49, 4];
//global variables 
let globalWidth;
let globalLength;
let globalNumOfRowsStacked;
let globalNumOfFloors;
let globalWeeks;
function createFloors(){
    numOfFloors = document.getElementById("numOfFloors").value
    globalNumOfFloors = numOfFloors
    const elementsToRemove = document.querySelectorAll(".crops")
    elementsToRemove.forEach(elementsToRemove => {
        elementsToRemove.remove();
    });
    let width = document.getElementById("width").value;
    width = Math.round(12*width);
    let length = document.getElementById("length").value;
    length = Math.round(12*length);
    let ceilingHeight = document.getElementById("height").value;
    let weeks = document.getElementById("numOfWeeks").value;
    weeks = Number(weeks);
    globalWeeks = weeks;
    ceilingHeight = Number(ceilingHeight);
    if (width === 0 || length === 0 || ceilingHeight === 0 || width/12<10 || length/12<10 || ceilingHeight < 6 || !Number.isInteger(weeks)) {
        alert("Invalid width/length/ceiling height/weeks value(s)");
        return;
    }
    let numOfRowsStacked = Math.floor(ceilingHeight/2);
    globalNumOfRowsStacked = numOfRowsStacked;
    if (width<length){
        let temp = width;
        width = length;
        length = temp;
    }
    globalWidth = width;
    globalLength = length;
    for (let i = 1; i <= numOfFloors; i++){
        let div = document.createElement("div")
        div.className = "crops";
        div.innerHTML = 
        `<label for="cropChoice${i}">Floor ${i}</label>
        <div class="flex-container">
        <select id="cropChoice${i}">
            <option>Arugula</option>
            <option>Broccoli</option>
            <option>Bok Choy</option>
            <option>Chives</option>
            <option>Cilantro</option>
            <option>Dandelions</option>
            <option>Kale</option>
            <option>Lettuce</option>
            <option>Mint</option>
            <option>Mustard Greens</option>
            <option>Parsley</option>
            <option>Spinach</option>
            </select>
        </div>
        `;
        document.body.appendChild(div);
    }
    let fSubmit = document.createElement("input");
    fSubmit.setAttribute("type", "submit");
    fSubmit.setAttribute("onClick", "calculate()");
    fSubmit.setAttribute("value", "Calculate");
    fSubmit.setAttribute("id", "submit");
    fSubmit.setAttribute("class", "crops");
    document.body.appendChild(fSubmit);
}
function reservoirDimensions(volume){
    volume = Math.round(volume*231);
    let minSA = Infinity;
    let minDimensions = [];
    for(let length = 1; length <= Math.cbrt(volume); length++){
        if (volume%length === 0){
            let areaLeft = Math.round(volume/length);
            for(let width = 1; width <= Math.sqrt(areaLeft); width++){
                if (areaLeft%width === 0){
                    let height = Math.round(areaLeft/width);
                    let SA = 2*(length*width) + 2*(width*height) + 2*(length*height);
                    if (SA<minSA){
                        minSA = SA;
                        minDimensions = [length, width, height];
                    }
                }
            }
        }
    }
    //Divide by 144 bc its in square inches and to convert to feet u must divide by inches squared meaning 12*12 = 144
    return Math.round(minSA/144);
}

function calculate(){
    let cropChoices = [];
    for (let v = 1; v<=globalNumOfFloors; v++){
        let cropToInsert = document.getElementById(`cropChoice${v}`).value;
        cropChoices.push(cropToInsert);
    }
    const elementsToRemove = document.querySelectorAll(".crops")
    elementsToRemove.forEach(elementsToRemove => {
        elementsToRemove.remove();
    });
    let runningTotal = 0;
    let runningRevenue = 0;
    let runningProfit = 0;
    //Create Floors
    for(let i = 0; i < globalNumOfFloors; i++){
        let floorCost = 0;
        let cropChoice = cropChoices[i];
        let index = crops.indexOf(cropChoice);
        let cropLength = cropLengths[index];
        let cropSpacing = cropSpacings[index];
        let newWidth = globalWidth-12;
        let reqTBSPS = tbsp[index];
        let numOfCrops = Math.floor(newWidth/(cropLength+cropSpacing));
        let numOfRows = Math.floor(globalLength/41);
        // 6 channels in each row s9 6x4 + 1 inch inbetween each so 29 + 12 for a foot between each row 
        let costOfPVC = 4.83*(newWidth/12)*numOfRows*6;
        runningTotal+= costOfPVC;
        floorCost += costOfPVC;
        let gallonsOfWater = numOfCrops*0.75*numOfRows*6*globalNumOfRowsStacked;
        //0.75 gallons per crop 
        let minSA = reservoirDimensions(gallonsOfWater);
        let costOfReservoir = minSA*12.97;
        runningTotal+=costOfReservoir
        floorCost+=costOfReservoir;
        let factor = factorOfWeeks(gallonsOfWater);
        //multiplying by 7 converts to days and multiplying by 150 is for watts it uses per hour. 
        let numOfTbsp = Math.round((factor)/10)*10*reqTBSPS;
        let costOfNutrientSolution = Math.ceil((numOfTbsp/27))*18.99;
        runningTotal+=costOfNutrientSolution;
        floorCost+=costOfNutrientSolution;
        //27 table spoons in 1 bag
        let amountOfLampsPerRow = Math.ceil((29*newWidth) / (900));
        //square inches 2.5 ft by 2.5 ft is 30 inches by 30 inches which is 900 square inches
        let amountOfLamps = Math.floor(amountOfLampsPerRow*numOfRows)*globalNumOfRowsStacked;
        let costOfElectricity = sunlight[index]*globalWeeks*7*0.03*amountOfLamps;
        runningTotal+=costOfElectricity;
        floorCost+=costOfElectricity;
        let costOfLamps = amountOfLamps*87.99;
        runningTotal+=costOfLamps;
        floorCost+=costOfLamps;
        let costOfPumps = 44.95*globalNumOfRowsStacked;
        runningTotal+=costOfPumps;
        floorCost+=costOfPumps;
        let plantCost = plantCosts[index];
        let numofHarvests = Math.ceil(globalWeeks/numOfWeeks[index]);
        let revenueOfFloor = plantCost*numOfCrops*numOfRows*globalNumOfRowsStacked*6*numofHarvests;
        runningRevenue+=revenueOfFloor;
        let profitOfFloor = revenueOfFloor-floorCost;
        runningProfit+=profitOfFloor
        //display
        let div2 = document.createElement("div");
        div2.setAttribute("class", "crops");
        div2.classList.add("results");
        div2.innerHTML = `
        <h1>Floor ${i+1}</h1>
        <p>Crop: ${cropChoice}</p>
        <p>Rows: ${numOfRows}</p>
        <p>Lamps per Row: ${amountOfLampsPerRow}</p>
        <p>Total Lamps: ${amountOfLamps}</p>
        <p>Cost of Lamps: $${costOfLamps.toFixed(2)}</p>
        <p>Cost of Lamp Electricity: $${costOfElectricity.toFixed(2)}</p>
        <p>Cost of Reservoir Material: $${costOfReservoir.toFixed(2)}</p>
        <p>Cost of Nutrient Solution: $${costOfNutrientSolution.toFixed(2)}</p>
        <p>Cost of PVC Pipe: $${costOfPVC.toFixed(2)}</p>
        <p>Cost of Water Pumps: $${costOfPumps.toFixed(2)}</p>
        <p>Total Floor Cost: $${floorCost.toFixed(2)}</p>
        <p>Total Floor Revenue: $${revenueOfFloor.toFixed(2)}</p>
        <p>Total Profit: $${profitOfFloor.toFixed(2)}</p>
        `;
        document.body.appendChild(div2);
    }
    let div3 = document.createElement("div");
    div3.setAttribute("class", "crops");
    div3.classList.add("results");
    div3.innerHTML=`
    <h1>Total</h1>
    <p>Total Cost: $${runningTotal.toFixed(2)}</p>
    <p>Total Revenue: $${runningRevenue.toFixed(2)}</p>
    <p>Total Profit: $${runningProfit.toFixed(2)}</p>
    `
    document.body.appendChild(div3);
}
function factorOfWeeks(volume){
    let multiple = (globalWeeks/2)/2.5;
    let factor = multiple*volume;
    return factor;
}
