# dog-feeding-tracker-arduino

Dog feeding tracker built with Google Apps Script, Google Spreadsheet, and LINE Messaging API.

## Overview

This project records dog feeding events from a simple HTTP trigger and sends a LINE notification to a group.

Current flow:

1. An NFC tag opens the deployed Apps Script Web App URL
2. GAS determines whether the current request is for the morning or evening feeding slot
3. GAS checks the latest row in the `logs` sheet
4. If the latest row already matches today's same slot, the request is blocked
5. Otherwise, GAS appends a new log row and sends a LINE message

## Feeding Rules

- Feeding slots:
  - `morning`: `07:00`
  - `evening`: `17:00`
- Unlock timing:
  - `morning` is treated as open from `06:30` until before `16:30`
  - `evening` is treated as open for all other times
- Duplicate protection:
  - The latest log row is checked
  - If its `date` and `slot` match the current request, the request is treated as already completed

## Files

- [Code.js](/Users/dyethesky/tmp/dog-feeding-tracker-arduino/Code.js)
  Main GAS logic for request handling, duplicate blocking, spreadsheet logging, and LINE push notification.
- [init.js](/Users/dyethesky/tmp/dog-feeding-tracker-arduino/init.js)
  Helper functions for initializing script properties and the schedule master sheet.
- [tmp.js](/Users/dyethesky/tmp/dog-feeding-tracker-arduino/tmp.js)
  Temporary helper file. The contents are currently commented out and not in active use.
- [appsscript.json](/Users/dyethesky/tmp/dog-feeding-tracker-arduino/appsscript.json)
  Apps Script manifest.

## Script Properties

The following Script Properties are required:

- `SPREADSHEET_ID`
- `SHEET_NAME`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_TO`

Recommended value:

- `SHEET_NAME=logs`

## Spreadsheet Structure

### logs

The `logs` sheet is expected to use this column order:

1. `date`
2. `slot`
3. `timestamp`
4. `event`
5. `token`
6. `pathInfo`
7. `queryString`

Example rows:

- `2026-03-23, morning, 2026-03-23 10:49:22, touch, ...`
- `2026-03-23, evening, 2026-03-23 17:03:10, touch, ...`

### schedule_master

The `schedule_master` sheet is used as a simple schedule definition table.

Default rows:

- `morning, 07:00, 30, true`
- `evening, 17:00, 30, true`

You can create it by running `initializeScheduleMasterSheet()` in Apps Script.

## API Behavior

### Success case

- Spreadsheet: append a new row to `logs`
- LINE: send `今日の朝/夜にエサもらいます`
- HTTP response: `エサをくれてありがとう`

### Duplicate case

- Spreadsheet: do not append
- LINE: do not send
- HTTP response: `今日の朝/夜はすでに食べています`

## Helper Functions

- `testMain()`
  Manual test helper for running the main logic from the Apps Script editor.
- `initializeLineScriptProperties()`
  Stores LINE-related script properties.
- `initializeScheduleMasterSheet()`
  Creates or resets the `schedule_master` sheet with default rows.

## Notes

- The project no longer uses Arduino.
- The current implementation is centered on Google Apps Script.
- If you change the Web App logic, remember that `clasp push` updates HEAD, but a deployed Web App may still require redeployment depending on which deployment URL you use.
