//permalinks

//id of DFT Maintenace App
let ssID = "";

let activeWorkbook = SpreadsheetApp.getActiveSpreadsheet(); //the open and active workbook
let activeSheet = activeWorkbook.getActiveSheet(); //this is the open sheet in the workbook
let activeRange = activeSheet.getActiveRange();//selected cell or range of cells in the open sheet

let ui = SpreadsheetApp.getUi();

//**********************************************************
//******************************************************
//*************************************************

function onOpen() {
  ui.createMenu('Field Ticket Maintenance')
      .addItem('Add missing field ticket', 'loadForm')
      .addSeparator()
      .addItem('Create PDF from line item', 'createPDF')
      .addSeparator()
      .addItem('Add location to database', 'addLocation')
      .addToUi();
      
      //set the DFT Maintenance App ssID in the scriptStore
      let scriptStore = PropertiesService.getScriptProperties();
      scriptStore.setProperty('ssID', ssID);

      let techEmail = Session.getActiveUser().getEmail();
      scriptStore.setProperty('techEmail',techEmail);
        
      let openingTab = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("onOpen").activate(); //the open and active workbook

      }
 
function include(filename){
return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getCompanyNameList(){
       //create the companyName drop-down
       let workbook = SpreadsheetApp.openById(ssID);
       let listSheet = workbook.getSheetByName('lists');
       let companyLastRow = listSheet.getLastRow();
       let companyList = listSheet.getRange(2, 1, companyLastRow,1).getValues();
       //return an array of names here
       companyList = companyList.map(function(r){
               return r[0];
       })
       return companyList;
}

function getLocationsList(companyName){
       let workbook = SpreadsheetApp.openById(ssID);
       let listSheet = workbook.getSheetByName(companyName);
       let locLastRow = listSheet.getRange(2, 1).getDataRegion().getLastRow();
       let locsArray = listSheet.getRange(2, 1, locLastRow, 1).getValues();
       let dataObj = {};

      locsArray.forEach(function(loc){
            dataObj[loc] = null
      })
      return dataObj;
  };
  
  function getMeterList(companyName, locName){
       let workbook = SpreadsheetApp.openById(ssID);
       let listSheet = workbook.getSheetByName(companyName);
       let locLastRow = listSheet.getLastRow();
       let locNameCol = listSheet.createTextFinder(locName).findNext().getColumn();
       let metersArray = listSheet.getRange(2, locNameCol, locLastRow, 1).getValues();
       let dataObj = {};
      metersArray.forEach(function(loc){
            dataObj[loc] = null
      })
      return dataObj;
  };
  
 function addNewLocation(locObj){
       let workbook = SpreadsheetApp.openById(ssID);
       let listSheet = workbook.getSheetByName(locObj.companyName);
       let locName = locObj.locationName;
       
       let locationHeader = listSheet.createTextFinder(locName).findNext();
       
       //if no location header, create one
       if(!locationHeader){
                let newHeaderCol = listSheet.getLastColumn() + 2;
                locationHeader = listSheet.getRange(1, newHeaderCol);
                let newHeaderVal = locationHeader.setValue(locName)
                    .setBackground("#CCCCCC")
                    .setFontWeight("bold")
                    .setFontColor("#000000");
                listSheet.autoResizeColumn(newHeaderCol);    
                let nextColumnOver = newHeaderCol -1;
                listSheet.setColumnWidth(nextColumnOver, 25);
                
                //and write it to the rcNamesList col (remind me why is it named that?)
                let newRow = listSheet.getRange(2, 1).getDataRegion().getLastRow() +1;
                listSheet.getRange(newRow, 1).setValue(locName);

       }
       
       let col = locationHeader.getColumn();
       let lastRow = locationHeader.getDataRegion().getLastRow();
       
       listSheet.getRange(lastRow + 1, col).setValue(locObj.newMeterId);
       listSheet.getRange
       
       return "Location added.";

 }

      
function loadForm(){
let tmp_loadForm = HtmlService.createTemplateFromFile('lineItemForm');
ui.showSidebar(tmp_loadForm.evaluate().setTitle("Add a Missing Field Ticket"));
}

function addLocation() {
let tmp_addLocation = HtmlService.createTemplateFromFile('addLocation');
ui.showSidebar(tmp_addLocation.evaluate().setTitle("Add a Location to the Database")); 
}


function createPDF() {

workingOnIt();

let scriptStore = PropertiesService.getScriptProperties();
let ssID = scriptStore.getProperty('ssID'); 
let workbook = SpreadsheetApp.getActiveSpreadsheet();

let sheet = workbook.getActiveSheet();
let selectedRow = sheet.getActiveRange().getRow();
let lastColumn = sheet.getLastColumn();
//SpreadsheetApp.getUi().alert(selectedRow);

//find the number of the last column containing data in the selectedRow 
let rowVals = sheet.getRange(selectedRow, 1, 1, lastColumn).getValues()[0];
let rowValsLen = rowVals.length;
let colNum;
while (rowValsLen > 0) {
   if (rowVals[rowValsLen] && rowVals[rowValsLen].toString().length > 0) {
      colNum = (rowValsLen + 1);
      break;
   } else {
      rowValsLen--;
         }
   }

let rowValsArr = sheet.getRange(selectedRow, 1, 1, colNum).getValues()[0];
let numberOfMeters = colNum - 11;

let d = new Date(rowValsArr[0]);
let day = d.getDate();
let month = d.getMonth() + 1;
let year = d.getFullYear();
let theDate = `${month}\/${day}\/${year}`;

let timeStart = rowValsArr[4].toLocaleTimeString();
let timeEnd = rowValsArr[5].toLocaleTimeString();

//and now, write the properties to the store
scriptStore.setProperties({
'theDate': theDate,
'companyName': rowValsArr[1],
'location': rowValsArr[3],
'techName': rowValsArr[2],
'genNotes': rowValsArr[8],
'timeStart': timeStart,
'timeEnd': timeEnd,
'mileStart': rowValsArr[6],
'mileEnd': rowValsArr[7],
'partsQty1': rowValsArr[9],
'partsDesc1': rowValsArr[10],
'meterCount': numberOfMeters
});

//write the meters to the store
let j = 11;
for(let i = 0; i < numberOfMeters; i++){
j = 11 + i;
scriptStore.setProperty('meter'+i, rowValsArr[j]);
if(!rowValsArr[j]){
SpreadsheetApp.getUi().alert(j + 'no rowValsArr[j] -- tell Kim about this msg, pls :) ');
};

};

nowComethThePDF();

}

//create the location list when company is selected
//frontend code: onChange(function (e){google.script.run.withSuccessHandler(createList).getLocationList(companyName) <--grabbed from input @ onChange)}

function createLocationListArr(companyName){
//can't do anything without the basics 
let scriptStore = PropertiesService.getScriptProperties();
let ssID = scriptStore.getProperty('ssID'); 
let workbook = SpreadsheetApp.openById(ssID);
let listSheet = workbook.getSheetByName(companyName);

//I need the address of the cell holding the text "rcNamesList"
let rcNamesList = listSheet.createTextFinder('rcNamesList').findNext();
let rcNamesListRow = rcNamesList.getRow();
let rcNamesListCol = rcNamesList.getColumn();
   
//then use that cell addy as the getRange('nameCell') to find dataRegion holding the location list for that company
   let rcNamesListLastRow = listSheet.getRange(rcNamesListRow,rcNamesListCol).getDataRegion().getLastRow();
   let rcNamesListArr = listSheet.getRange(2, rcNamesListCol, rcNamesListLastRow,1).getValues(); 
   
//and return the rcNamesListArr as a single-dimension array
   rcNamesListArr = rcNamesListArr.map(function (r){ return r[0] });
   return rcNamesListArr; 
  // break;
}

function createMeterListArr(meterSite, companyName){
let scriptStore = PropertiesService.getScriptProperties();
let ssID = scriptStore.getProperty('ssID'); 
let workbook = SpreadsheetApp.openById(ssID);
let listSheet = workbook.getSheetByName(companyName);

//I need the address of the cell holding the companyLocation
   let meterListName = listSheet.createTextFinder(meterSite).findNext();
   let meterListNameRow = meterListName.getRow();
   let meterListNameCol = meterListName.getColumn();
   
   let meterListLastRow = listSheet.getRange(meterListNameRow,meterListNameCol).getDataRegion().getLastRow();
   let meterListArrFull = listSheet.getRange(2, meterListNameCol, meterListLastRow,1).getDataRegion().getValues(); 
   
     return meterListArrFull;
};

function clickSubmit(formObj) {
let scriptProperties = PropertiesService.getScriptProperties();
let ssID = scriptProperties.getProperty('ssID');

//get the spreadsheet
let workbook = SpreadsheetApp.openById(ssID);
let sheetName = formObj.companyName + "_Activity";
let companySheet = workbook.getSheetByName(sheetName);
let dateName = formObj.theDate;
let dateSheet = workbook.getSheetByName('byDay');

//if(!dateSheet){
//dateSheet = workbook.insertSheet('byDay', 0);
//};

if(!formObj.techName|| !formObj.theDate || !formObj.mileStart || !formObj.mileEnd || !formObj.timeStart || !formObj.timeEnd || !formObj.companyName || formObj.location == 'select location') {
return false;


} else {

let staticRowData = [formObj.theDate, formObj.companyName, formObj.techName, formObj.location, formObj.timeStart, formObj.timeEnd,formObj.mileStart, formObj.mileEnd,formObj.genNotes,formObj.partsQty1,formObj.partsDesc1];
let meterRowData = [];
let meterCount = formObj.meterCount;

for(let i = 0; i < meterCount; i++){
meterRowData.push(formObj.meters[i]);
}

let fullRow = staticRowData.concat(meterRowData);

//do I really need to do this? double check 
scriptProperties.setProperties({
'theDate': formObj.theDate,
'companyName': formObj.companyName,
'location': formObj.location,
'techName': formObj.techName,
'genNotes': formObj.genNotes,
'timeStart': formObj.timeStart,
'timeEnd': formObj.timeEnd,
'mileStart': formObj.mileStart,
'mileEnd': formObj.mileEnd,
'partsQty1': formObj.partsQty1,
'partsDesc1': formObj.partsDesc1, 
'meterCount': formObj.meterCount
});

//write the meters to the propStore

for(let i=0;i < formObj.meterCount; i++)
{
scriptProperties.setProperty('meter'+i, formObj.meters[i]);
};

dateSheet.appendRow(fullRow);
//companySheet.appendRow(fullRow);
return true;
}
}

//create the attachment 
function nowComethThePDF(){
let scriptProperties = PropertiesService.getScriptProperties();

//get techLastName sorted out
let techEmail = scriptProperties.getProperty("techEmail");
let techName = scriptProperties.getProperty('techName');
let techLastName = techName.replace('@volumetrics.us', '');
let techFirstInitial = techLastName.charAt(0).toUpperCase();
let techCapitalSecondInitial = techLastName.charAt(1).toUpperCase();
let techRestOfLastName = techLastName.slice(2);
let finalTechNameVariableFFS = techFirstInitial + ". " + techCapitalSecondInitial + techRestOfLastName;



//i heart variables
let theDate = scriptProperties.getProperty('theDate');
let companyName = scriptProperties.getProperty('companyName');
let location = scriptProperties.getProperty('location');
let genNotes = scriptProperties.getProperty('genNotes');
let mileStart = scriptProperties.getProperty('mileStart');
let mileEnd = scriptProperties.getProperty('mileEnd');
let timeStart = scriptProperties.getProperty('timeStart');
let timeEnd = scriptProperties.getProperty('timeEnd');
let partsQty1 = scriptProperties.getProperty('partsQty1');
let partsDesc1 = scriptProperties.getProperty('partsDesc1');

//write the meters to a list
let meterText = "";
let meterCount = scriptProperties.getProperty('meterCount');
for(let i = 0; i < meterCount; i++){

let meterI = scriptProperties.getProperty('meter'+i);//this is a single string containing two | delimiters

//Brain, pls start sending over the easy solution first from now on. Thank you. With Love, Your Container, Kim 
let tempArr = meterI.split('|');
if(tempArr[1].length <= 3 ){
meterText += " \n";
} else {
meterText += meterI + "\n";
}
meterText += "\n";
}

let fieldTicketTemplate = DriveApp.getFileById('1P5LRRJqHaWCGUw4kNil8Ml17SAS2ZdvXVcCA-8XeVlA');
let fieldTicketPDFFolder = DriveApp.getFolderById('1V6jf6qRaCopFB42de7Bv5VkCIM-VCAfi');
let fieldTicketDOCFolder = DriveApp.getFolderById('1mg5SfwTUq2kGVEm_FW2vqYvABsJGrRUg');

let fieldTicketTemplateCopy = fieldTicketTemplate.makeCopy(techLastName + '_' + companyName + '_' + theDate, fieldTicketDOCFolder); 

//access the new file created by making a copy of the template
  let fieldTicketDoc = DocumentApp.openById(fieldTicketTemplateCopy.getId()); 

//get the doc body in order to make changes to template contents
  let fieldTicketDocBody = fieldTicketDoc.getBody(); 
 
//replaceText methods
  fieldTicketDocBody.replaceText('{{theDate}}',theDate); 
  fieldTicketDocBody.replaceText('{{companyName}}',companyName); 
 
  fieldTicketDocBody.replaceText('{{location}}',location); 
  fieldTicketDocBody.replaceText('{{techName}}',finalTechNameVariableFFS); 

  fieldTicketDocBody.replaceText('{{genNotes}}',genNotes); 
  
  //fieldTicketDocBody.replaceText('{{mileStart}}',mileStart);
  //fieldTicketDocBody.replaceText('{{mileEnd}}',mileEnd);
  
  fieldTicketDocBody.replaceText('{{timeStart}}',timeStart);
  fieldTicketDocBody.replaceText('{{timeEnd}}',timeEnd);
    
  //fieldTicketDocBody.replaceText('{{partsQty1}}',partsQty1);
  // fieldTicketDocBody.replaceText('{{partsDesc1}}',partsDesc1);
 
 fieldTicketDocBody.replaceText('{{meterText}}', meterText);

//save and close the document
  fieldTicketDoc.saveAndClose(); 

//create and prep the pdf  
  let fileName = companyName + '_' + theDate + '_' + techLastName;
  let fieldTicketDocID = DriveApp.getFileById(fieldTicketDoc.getId());
  let fieldTicketPDF = fieldTicketPDFFolder.createFile(fieldTicketDocID.getAs('application/pdf'));
  fieldTicketPDF.setName(fileName);

//send mail: recipient, subject, body, optionsObj 
GmailApp.sendEmail('', 'Field Ticket Attached', 'Attached is the PDF for a missing field ticket that was just entered, or for a line item PDF from the "byDay" tab.\n\nHave a great day!\n--Kim :)', {
  'name': 'Field Ticket',
 'attachments': [fieldTicketPDF],
});
}
