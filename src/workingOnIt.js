//call workingOnIt whenever I need the loader 
//send along no status if it is a query to the database
//when query results return, call workingOnIt with a status argument
//thank you very much, Past Me for making this easy like Sunday morning :) 

function workingOnIt(status){
let workingTmp = HtmlService.createTemplateFromFile('loader_HTML');
workingTmp.workingContent = "";

let workingDiv = `<div id='loaderDiv' class='jsHide' style='text-align: center;'>
                  <h5>Working ... </h5>
                  <div style='width:80%; margin:25px auto;'>
                   <div class='preloader-wrapper small active'>
                          <div class='spinner-layer spinner-green-only'>
                              <div class='circle-clipper left'>
                                  <div class='circle'></div>
                              </div>
                              <div class='gap-patch'>
                                  <div class='circle'></div>
                              </div>
                              <div class='circle-clipper right'>
                                  <div class='circle'></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>`;
let openingDiv = "<div id='loading' class='center-align loading'><div class='working'>opening ...</div></div>";
let readyDiv = "<div id='ready' class='center-align ready'><div class='working'>ready</div></div>";
let successDiv = "<div id='ready' class='center-align ready'><div class='working'>success</div></div>";
let notFoundDiv = "<div id='noRMA' class='center-align ready'><a class='btn-floating btn-large grey pulse'></a><div class='working'>not found.</div></div>";
let scriptTag = "<script>window.close = function(){window.setTimeout(function(){google.script.host.close()},2500)};close();</script>";
let dialogTitle = " ";

if(!status){
workingTmp.workingContent = workingDiv;
workingTmp.scriptTag = " ";
}

if(status == "opening"){
workingTmp.workingContent = openingDiv;
workingTmp.scriptTag = scriptTag;
}

if(status == 'ready'){
workingTmp.workingContent = readyDiv;
workingTmp.scriptTag = scriptTag;
}

if(status == 'success'){
workingTmp.workingContent = successDiv;
workingTmp.scriptTag = scriptTag;
}

if(status == "notFound"){
workingTmp.workingContent = notFoundDiv;
workingTmp.scriptTag = scriptTag;
}

workingTmp = workingTmp.evaluate();
workingTmp.setWidth(300).setHeight(150);
SpreadsheetApp.getUi().showModalDialog(workingTmp, dialogTitle);
}