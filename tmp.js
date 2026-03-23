// function doPost(e) {
//   var body = parseWebhookBody_(e);
//   var event = getFirstEvent_(body);
//   var groupIds = extractGroupIds_(body);
//   var receivedText = getReceivedText_(event);
//
//   console.log(
//     JSON.stringify({
//       groupIds: groupIds,
//       receivedText: receivedText,
//       body: body,
//     })
//   );
//
//   replyGroupIds_(event, groupIds, receivedText);
//
//   return ContentService.createTextOutput('ok').setMimeType(
//     ContentService.MimeType.TEXT
//   );
// }
//
// function parseWebhookBody_(e) {
//   if (!e || !e.postData || !e.postData.contents) {
//     return {};
//   }
//
//   return JSON.parse(e.postData.contents);
// }
//
// function getFirstEvent_(body) {
//   var events = (body && body.events) || [];
//   return events.length > 0 ? events[0] : null;
// }
//
// function extractGroupIds_(body) {
//   var events = (body && body.events) || [];
//   var groupIds = [];
//
//   events.forEach(function (event) {
//     var source = event.source || {};
//
//     if (source.type === 'group' && source.groupId) {
//       groupIds.push(source.groupId);
//     }
//   });
//
//   return groupIds;
// }
//
// function getReceivedText_(event) {
//   if (!event || !event.message || event.message.type !== 'text') {
//     return '';
//   }
//
//   return event.message.text || '';
// }
//
// function replyGroupIds_(event, groupIds, receivedText) {
//   if (!event || !event.replyToken) {
//     return;
//   }
//
//   var properties = PropertiesService.getScriptProperties();
//   var channelAccessToken = properties.getProperty('LINE_CHANNEL_ACCESS_TOKEN');
//
//   if (!channelAccessToken) {
//     throw new Error('Script property LINE_CHANNEL_ACCESS_TOKEN is not set.');
//   }
//
//   var lines = [];
//
//   if (receivedText) {
//     lines.push('received: ' + receivedText);
//   }
//
//   lines.push('groupIds: ' + (groupIds.length > 0 ? groupIds.join(', ') : 'none'));
//
//   var response = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
//     method: 'post',
//     contentType: 'application/json',
//     headers: {
//       Authorization: 'Bearer ' + channelAccessToken,
//     },
//     payload: JSON.stringify({
//       replyToken: event.replyToken,
//       messages: [
//         {
//           type: 'text',
//           text: lines.join('\n'),
//         },
//       ],
//     }),
//     muteHttpExceptions: true,
//   });
//
//   if (response.getResponseCode() >= 300) {
//     throw new Error(
//       'LINE reply failed: ' +
//         response.getResponseCode() +
//         ' ' +
//         response.getContentText()
//     );
//   }
// }
