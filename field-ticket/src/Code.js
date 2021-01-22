//the Field Tickets Data workbook
// let ssID = ';

//the TESTING spreadsheet
//let ssID = "";
 

function doGet(){

PropertiesService.getScriptProperties().setProperty('ssID',ssID);

 let tmp = HtmlService.createTemplateFromFile('fieldTicketForm');
 //I really need that email, guys
 let techEmail = Session.getActiveUser().getEmail();
 tmp.techEmail = techEmail;
 PropertiesService.getScriptProperties().setProperty('techEmail',techEmail);
 
//create the companyName drop-down
 let workbook = SpreadsheetApp.openById(ssID);
 let listSheet = workbook.getSheetByName('lists');
//I'm so glad I know myself so well -- check out the hardcode below. 
 let companyLastRow = listSheet.getRange('$A$1').getDataRegion().getLastRow();
 let companyList = listSheet.getRange(2, 1, companyLastRow,1).getValues();
 tmp.companyList = companyList;
 
 return tmp.evaluate().addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename){
return HtmlService.createHtmlOutputFromFile(filename).getContent();

}

//create the location list when company is selected
//frontend code: onChange(function (e){google.script.run.withSuccessHandler(createList).getLocationList(companyName) <--grabbed from input @ onChange)}

function createLocationListArr(companyName){
//can't do anything without the basics 
let ssID = PropertiesService.getScriptProperties().getProperty('ssID');
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
let ssID = PropertiesService.getScriptProperties().getProperty('ssID');
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

//get the spreadsheet
let ssID = PropertiesService.getScriptProperties().getProperty('ssID');
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

let scriptProperties = PropertiesService.getScriptProperties();
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

//companySheet.appendRow(fullRow);
dateSheet.appendRow(fullRow);

return true;
}
}

//create the attachment 
function nowComethThePDF(){
let scriptProperties = PropertiesService.getScriptProperties();
let ssID = scriptProperties.getProperty('ssID');


//get techLastName sorted out
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

//Brain, pls start thinking of the easy solution first from now on. Thank you. With Love, Your Container, Kim 
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
let fieldTicketDocName = techLastName + '_' + companyName + '_' + theDate;

let fieldTicketTemplateCopy = fieldTicketTemplate.makeCopy(fieldTicketDocName, fieldTicketDOCFolder); 

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

//prep the pdf  
  let fileName = companyName + '_' + theDate + '_' + techLastName;
  let fieldTicketDocID = DriveApp.getFileById(fieldTicketDoc.getId());
  let fieldTicketPDF = fieldTicketPDFFolder.createFile(fieldTicketDocID.getAs('application/pdf'));
  
  //assign ownership to 
  fieldTicketPDF.setName(fileName).setOwner("");//need an email address here

 //have the owner delete that newly created file, instant folder maintenance
 fieldTicketDOCFolder.getFilesByName(fieldTicketDocName).next().setTrashed(true);
 
 let techEmail = scriptProperties.getProperty('techEmail');

//send mail: recipient, subject, body, options
GmailApp.sendEmail(techEmail, 'Field Ticket Attached', '', {
  'name': 'Field Ticket',
 'attachments': [fieldTicketPDF],
});


}


