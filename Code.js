var SPREADSHEET_ID_PROPERTY = 'SPREADSHEET_ID';
var SHEET_NAME_PROPERTY = 'SHEET_NAME';
var LINE_CHANNEL_ACCESS_TOKEN_PROPERTY = 'LINE_CHANNEL_ACCESS_TOKEN';
var LINE_TO_PROPERTY = 'LINE_TO';
var DEFAULT_SHEET_NAME = 'logs';
var LOG_TIME_ZONE = 'Asia/Tokyo';
var LOG_TIMESTAMP_FORMAT = 'yyyy-MM-dd HH:mm:ss';

function doGet(e) {
  var result = main(e);
  var message = result.ok ? 'Hello world!' : 'Hello world! (log skipped)';

  return ContentService.createTextOutput(message).setMimeType(
    ContentService.MimeType.TEXT
  );
}

function main(e) {
  var logResult = logTouchEvent_(e);

  if (!logResult.ok) {
    return logResult;
  }

  try {
    sendLineMessage_(buildLineMessage_(logResult));
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, message: String(error) };
  }
}

function logTouchEvent_(e) {
  try {
    var sheet = getLogSheet_();
    var params = (e && e.parameter) || {};
    var timestamp = getCurrentTimestamp_();
    var token = params.token || '';
    var pathInfo = getPathInfo_(e);
    var queryString = getQueryString_(e);

    sheet.appendRow([
      timestamp,
      'touch',
      token,
      pathInfo,
      queryString,
    ]);

    return {
      ok: true,
      timestamp: timestamp,
      token: token,
      pathInfo: pathInfo,
      queryString: queryString,
    };
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

function getCurrentTimestamp_() {
  return Utilities.formatDate(new Date(), LOG_TIME_ZONE, LOG_TIMESTAMP_FORMAT);
}

function buildLineMessage_(logResult) {
  var lines = ['Dog feeding touch detected', 'Time: ' + logResult.timestamp];

  if (logResult.token) {
    lines.push('Token: ' + logResult.token);
  }

  return lines.join('\n');
}

function sendLineMessage_(text) {
  var properties = PropertiesService.getScriptProperties();
  var channelAccessToken = properties.getProperty(
    LINE_CHANNEL_ACCESS_TOKEN_PROPERTY
  );
  var to = properties.getProperty(LINE_TO_PROPERTY);

  if (!channelAccessToken) {
    throw new Error('Script property LINE_CHANNEL_ACCESS_TOKEN is not set.');
  }

  if (!to) {
    throw new Error('Script property LINE_TO is not set.');
  }

  var response = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + channelAccessToken,
    },
    payload: JSON.stringify({
      to: to,
      messages: [
        {
          type: 'text',
          text: text,
        },
      ],
    }),
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() >= 300) {
    throw new Error(
      'LINE push failed: ' +
        response.getResponseCode() +
        ' ' +
        response.getContentText()
    );
  }
}
