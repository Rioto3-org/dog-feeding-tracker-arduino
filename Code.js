var SPREADSHEET_ID_PROPERTY = 'SPREADSHEET_ID';
var SHEET_NAME_PROPERTY = 'SHEET_NAME';
var DEFAULT_SHEET_NAME = 'logs';

function doGet(e) {
  var result = logTouchEvent_(e);
  var message = result.ok ? 'Hello world!' : 'Hello world! (log skipped)';

  return ContentService.createTextOutput(message).setMimeType(
    ContentService.MimeType.TEXT
  );
}

function logTouchEvent_(e) {
  try {
    var sheet = getLogSheet_();
    var params = (e && e.parameter) || {};

    sheet.appendRow([
      new Date(),
      'touch',
      params.token || '',
      getPathInfo_(e),
      getQueryString_(e),
    ]);

    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, message: String(error) };
  }
}

function getLogSheet_() {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty(SPREADSHEET_ID_PROPERTY);
  var sheetName = properties.getProperty(SHEET_NAME_PROPERTY) || DEFAULT_SHEET_NAME;

  if (!spreadsheetId) {
    throw new Error('Script property SPREADSHEET_ID is not set.');
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(['timestamp', 'event', 'token', 'pathInfo', 'queryString']);
  }

  return sheet;
}

function getPathInfo_(e) {
  if (!e) {
    return '';
  }

  return e.pathInfo || '';
}

function getQueryString_(e) {
  if (!e) {
    return '';
  }

  return e.queryString || '';
}
