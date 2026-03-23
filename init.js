var DEFAULT_LINE_CHANNEL_ACCESS_TOKEN = '';
var DEFAULT_LINE_TO = '';

function initializeLineScriptProperties() {
  var properties = PropertiesService.getScriptProperties();

  properties.setProperties({
    LINE_CHANNEL_ACCESS_TOKEN: DEFAULT_LINE_CHANNEL_ACCESS_TOKEN,
    LINE_TO: DEFAULT_LINE_TO,
  });
}
