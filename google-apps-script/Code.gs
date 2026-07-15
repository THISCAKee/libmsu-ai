const SHEET_NAME = "Logs";

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

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, mode: "append" }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
