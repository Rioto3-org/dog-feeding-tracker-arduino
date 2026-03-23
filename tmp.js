function doPost(e) {
  var body = parseWebhookBody_(e);
  var groupIds = extractGroupIds_(body);

  console.log(
    JSON.stringify({
      groupIds: groupIds,
      body: body,
    })
  );

  return ContentService.createTextOutput('ok').setMimeType(
    ContentService.MimeType.TEXT
  );
}

function parseWebhookBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  return JSON.parse(e.postData.contents);
}

function extractGroupIds_(body) {
  var events = (body && body.events) || [];
  var groupIds = [];

  events.forEach(function (event) {
    var source = event.source || {};

    if (source.type === 'group' && source.groupId) {
      groupIds.push(source.groupId);
    }
  });

  return groupIds;
}
