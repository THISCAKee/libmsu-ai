const SHEET_NAME = "Logs";

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function doGet(e) {
  try {
    const expectedSecret =
      PropertiesService.getScriptProperties().getProperty("ADMIN_DATA_SECRET");
    const receivedSecret = e && e.parameter ? e.parameter.secret : "";
    const action = e && e.parameter ? e.parameter.action : "";

    if (!expectedSecret || receivedSecret !== expectedSecret || action !== "readLogs") {
      return jsonResponse({ success: false, error: "Unauthorized" });
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) {
      return jsonResponse({ success: true, rows: [] });
    }

    const values = sheet
      .getRange(2, 1, sheet.getLastRow() - 1, 10)
      .getDisplayValues();
    const rows = values.map(function (columns) {
      return {
        timestamp: columns[0],
        name: columns[1],
        role: columns[2],
        studentId: columns[3],
        year: columns[4],
        faculty: columns[5],
        major: columns[6],
        department: columns[7],
        action: columns[8],
        platformName: columns[9],
      };
    });

    return jsonResponse({ success: true, rows: rows });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    // สร้างหัวตารางอัตโนมัติหากยังไม่มีข้อมูล
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "เวลา",
        "ชื่อ-นามสกุล",
        "สถานะ",
        "รหัสนิสิต",
        "ชั้นปี",
        "คณะ",
        "สาขาวิชา",
        "หน่วยงาน",
        "กิจกรรม",
        "AI ที่เลือก",
      ]);
    }

    // การเลือกแพลตฟอร์มแต่ละครั้งเป็นบันทึกการใช้งานหนึ่งรายการ
    // จึงเพิ่มแถวใหม่เสมอเพื่อรักษาเวลา ลำดับ และจำนวนครั้งที่เลือก
    sheet.appendRow([
      data.timestamp || "-",
      data.name || "-",
      data.role || "-",
      data.studentId || "-",
      data.year || "-",
      data.faculty || "-",
      data.major || "-",
      data.department || "-",
      data.action || "Click AI Platform",
      data.platformName || "-",
    ]);

    return jsonResponse({ success: true, mode: "append" });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}
