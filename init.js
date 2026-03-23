var DEFAULT_LINE_CHANNEL_ACCESS_TOKEN = '';
var DEFAULT_LINE_TO = '';
var SPREADSHEET_ID_PROPERTY = 'SPREADSHEET_ID';
var SCHEDULE_MASTER_SHEET_NAME = 'schedule_master';
var DEFAULT_UNLOCK_BEFORE_MINUTES = 30;

function initializeLineScriptProperties() {
  var properties = PropertiesService.getScriptProperties();

  properties.setProperties({
    LINE_CHANNEL_ACCESS_TOKEN: DEFAULT_LINE_CHANNEL_ACCESS_TOKEN,
    LINE_TO: DEFAULT_LINE_TO,
  });
}

function initializeScheduleMasterSheet() {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty(SPREADSHEET_ID_PROPERTY);

  if (!spreadsheetId) {
    throw new Error('Script property SPREADSHEET_ID is not set.');
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(SCHEDULE_MASTER_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SCHEDULE_MASTER_SHEET_NAME);
  } else {
    sheet.clearContents();
  }

  sheet.getRange(1, 1, 3, 4).setValues([
    ['slot_name', 'scheduled_time', 'unlock_before_minutes', 'enabled'],
    ['morning', '07:00', DEFAULT_UNLOCK_BEFORE_MINUTES, true],
    ['evening', '17:00', DEFAULT_UNLOCK_BEFORE_MINUTES, true],
  ]);
}
