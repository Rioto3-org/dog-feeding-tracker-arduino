var SPREADSHEET_ID_PROPERTY = 'SPREADSHEET_ID';
var SHEET_NAME_PROPERTY = 'SHEET_NAME';
var LINE_CHANNEL_ACCESS_TOKEN_PROPERTY = 'LINE_CHANNEL_ACCESS_TOKEN';
var LINE_TO_PROPERTY = 'LINE_TO';
var DEFAULT_SHEET_NAME = 'logs';
var LOG_TIME_ZONE = 'Asia/Tokyo';
var LOG_TIMESTAMP_FORMAT = 'yyyy-MM-dd HH:mm:ss';
var LOG_DATE_FORMAT = 'yyyy-MM-dd';
var MORNING_SLOT = 'morning';
var EVENING_SLOT = 'evening';
var MORNING_UNLOCK_TIME = '06:30';
var EVENING_UNLOCK_TIME = '16:30';

function doGet(e) {
  var result = main(e);
  var message = result.message || 'Hello world!';

  return ContentService.createTextOutput(message).setMimeType(
    ContentService.MimeType.TEXT
  );
}

function main(e) {
  var currentDate = getCurrentDate_();
  var currentSlot = resolveCurrentSlot_();

  if (hasFedTodayForSlot_(currentDate, currentSlot)) {
    return {
      ok: true,
      message: buildAlreadyFedMessage_(currentSlot),
    };
  }

  var logResult = logTouchEvent_(e, currentDate, currentSlot);

  if (!logResult.ok) {
    return logResult;
  }

  try {
    sendLineMessage_(buildLineMessage_(logResult));
    return {
      ok: true,
      message: 'エサをくれてありがとう',
    };
  } catch (error) {
    console.error(error);
    return { ok: false, message: String(error) };
  }
}

function logTouchEvent_(e, currentDate, currentSlot) {
  try {
    var sheet = getLogSheet_();
    var params = (e && e.parameter) || {};
    var timestamp = getCurrentTimestamp_();
    var token = params.token || '';
    var pathInfo = getPathInfo_(e);
    var queryString = getQueryString_(e);

    sheet.appendRow([
      currentDate,
      currentSlot,
      timestamp,
      'touch',
      token,
      pathInfo,
      queryString,
    ]);

    return {
      ok: true,
      date: currentDate,
      slot: currentSlot,
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
    sheet.appendRow([
      'date',
      'slot',
      'timestamp',
      'event',
      'token',
      'pathInfo',
      'queryString',
    ]);
  }

  return sheet;
}

function hasFedTodayForSlot_(currentDate, currentSlot) {
  var sheet = getLogSheet_();
  var values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    return false;
  }

  for (var i = values.length - 1; i >= 1; i -= 1) {
    var row = values[i];

    if (String(row[0]) === currentDate && String(row[1]) === currentSlot) {
      return true;
    }
  }

  return false;
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

function getCurrentDate_() {
  return Utilities.formatDate(new Date(), LOG_TIME_ZONE, LOG_DATE_FORMAT);
}

function resolveCurrentSlot_() {
  var currentTime = Utilities.formatDate(new Date(), LOG_TIME_ZONE, 'HH:mm');

  if (
    currentTime >= MORNING_UNLOCK_TIME &&
    currentTime < EVENING_UNLOCK_TIME
  ) {
    return MORNING_SLOT;
  }

  return EVENING_SLOT;
}

function buildLineMessage_(logResult) {
  var lines = [
    '今日の' + getSlotLabel_(logResult.slot) + 'にエサもらいます',
    'Time: ' + logResult.timestamp,
  ];

  if (logResult.token) {
    lines.push('Token: ' + logResult.token);
  }

  return lines.join('\n');
}

function buildAlreadyFedMessage_(slot) {
  return '今日の' + getSlotLabel_(slot) + 'はすでに食べています';
}

function getSlotLabel_(slot) {
  return slot === MORNING_SLOT ? '朝' : '夜';
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
