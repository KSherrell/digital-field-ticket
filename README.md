# Digital Field Ticket example
## Description
This responsive web application captures field operations data and saves the data to a Google Sheets workbook for billing purposes. It also creates and emails a PDF of the field ticket.


## Features
- field ticket auto-fills the user email field and the date field 
- dependent drop-downs filter selection lists of locations based on company name 
    - also filters meter names based on selection location 
- add as many meter sections as needed per location
- all fields are required -- alert reminders for empty fields
- form data is written to the Sheets db for billing purposes
- the DFT Data workbook contains custom menu items for easy db maintenance
    - add missing field tickets
    - add new locations and meters to the db
    - create a PDF of a selected line item and email it

   
## Screenshots
View in screenshots folder 

## Project Tech
- Javascript
- jQuery
- Google App Script
- CLASP
- Visual Studio Code
- HTML 
- CSS
- Materialize.css
- Github
- Git, Windows command line
- Google Drive, Sheets, Gmail


## How to use this code

This code creates a Google Sheets application and utilizes App Script.

- copy the code in the SRC folder to your Sheets project
    - the Code.js file is the .GS file, all others are html files



