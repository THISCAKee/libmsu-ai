const SHEET_NAME = "Logs";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

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

    const name = data.name;
    const role = data.role;
    const studentId = data.studentId || "-";
    const department = data.department || "-";
    const platformName = data.platformName || "-";

    const lastRow = sheet.getLastRow();
    let foundRowIndex = -1;

    if (lastRow > 1) {
      const dataRange = sheet.getRange(1, 1, lastRow, 10); // คอลัมน์ A ถึง J (10 คอลัมน์)
      const values = dataRange.getValues();

      // ค้นหาจากแถวล่างสุดขึ้นบน เพื่อหาแถวล่าสุดของคนนี้
      for (let i = lastRow - 1; i >= 1; i--) {
        const rowName = values[i][1]; // คอลัมน์ B (ชื่อ)
        const rowRole = values[i][2]; // คอลัมน์ C (สถานะ)
        const rowStudentId = values[i][3]; // คอลัมน์ D (รหัสนิสิต)
        const rowDept = values[i][7]; // คอลัมน์ H (หน่วยงาน)

        if (rowName === name && rowRole === role) {
          if (role === "นิสิต" && rowStudentId === studentId) {
            foundRowIndex = i + 1; // อิงตามหมายเลขแถวจริง (1-based index)
            break;
          } else if (role === "บุคลากร" && rowDept === department) {
            foundRowIndex = i + 1;
            break;
          }
        }
      }
    }

    // หากเคยเลือก AI ไปแล้ว (มีแถวเดิมอยู่แล้ว) ให้ทำการบันทึกชื่อ AI ต่อท้ายในช่องเดิม
    if (foundRowIndex !== -1) {
      const aiCell = sheet.getRange(foundRowIndex, 10); // ช่องคอลัมน์ J (AI ที่เลือก)
      const currentAiVal = aiCell.getValue().toString().trim();

      if (currentAiVal === "" || currentAiVal === "-") {
        aiCell.setValue(platformName);
      } else {
        // ดึงรายชื่อ AI ปัจจุบันมาตรวจสอบ เพื่อป้องกันชื่อ AI ซ้ำกันจากการคลิกซ้ำ
        const aiList = currentAiVal.split(",").map((item) => item.trim());
        if (aiList.indexOf(platformName) === -1) {
          aiCell.setValue(currentAiVal + ", " + platformName);
        }
      }

      // อัปเดตกิจกรรม (คอลัมน์ I)
      sheet
        .getRange(foundRowIndex, 9)
        .setValue(data.action || "Click AI Platform");

      return ContentService.createTextOutput(
        JSON.stringify({ success: true, mode: "update" }),
      ).setMimeType(ContentService.MimeType.JSON);
    } else {
      // หากคลิก AI ครั้งแรก (ยังไม่มีข้อมูลในชีต) ให้เพิ่มแถวใหม่พร้อมระบุ AI ตัวแรกที่เลือกทันที
      sheet.appendRow([
        data.timestamp || "-",
        name || "-",
        role || "-",
        studentId,
        data.year || "-",
        data.faculty || "-",
        data.major || "-",
        department,
        data.action || "Click AI Platform",
        platformName,
      ]);

      return ContentService.createTextOutput(
        JSON.stringify({ success: true, mode: "append" }),
      ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
