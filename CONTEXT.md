# LIB AI Hub

LIB AI Hub is the library AI access context for registering a campus user, presenting approved AI platforms, and recording platform selections for service reporting.

## Language

**ผู้ใช้งาน**:
A person who enters the hub and chooses an AI platform. A **ผู้ใช้งาน** is either a **นิสิต** or **บุคลากร**.
_Avoid_: account, member, customer

**นิสิต**:
A student user identified by an 11-digit student ID and academic affiliation. A **นิสิต** has one **ชั้นปี**, one **คณะสังกัด**, and one **สาขาวิชา**.
_Avoid_: student account, learner

**บุคลากร**:
A staff user identified by name and workplace affiliation. A **บุคลากร** belongs to one **หน่วยงาน**.
_Avoid_: staff account, employee profile

**ข้อมูลผู้ใช้งาน**:
The self-reported identity and affiliation details collected before a user enters the hub. For a **นิสิต**, this includes name, student ID, year, faculty, and major; for **บุคลากร**, this includes name and department.
_Avoid_: login, authentication record, account data

**รหัสนิสิต**:
An 11-digit identifier for a **นิสิต**. It distinguishes students with the same name in usage records.
_Avoid_: user ID, account ID

**ชั้นปี**:
The academic year level selected by a **นิสิต**. It is a reporting attribute, not a permission level.
_Avoid_: grade, level

**คณะสังกัด**:
The faculty or college affiliation of a **นิสิต**. It is distinct from **หน่วยงาน**, which belongs to **บุคลากร**.
_Avoid_: department, workplace

**สาขาวิชา**:
The academic major or program of a **นิสิต** within their **คณะสังกัด**.
_Avoid_: department, unit

**หน่วยงาน**:
The workplace affiliation of a **บุคลากร**, such as an office, division, faculty, or internal organization.
_Avoid_: faculty, major

**แพลตฟอร์ม AI**:
An external AI service made available from the hub. A **แพลตฟอร์ม AI** has a name, category, destination URL, description, and optionally a plan label.
_Avoid_: tool, website, app

**หมวดหมู่แพลตฟอร์ม**:
The functional grouping used to browse **แพลตฟอร์ม AI**, such as Chat, Research, or Search.
_Avoid_: type, tag

**แผนการใช้งาน**:
The plan label shown for a **แพลตฟอร์ม AI**, such as Plus, Team, Advanced, Pro, or Premium.
_Avoid_: subscription, package

**การเลือกแพลตฟอร์ม**:
The event where a **ผู้ใช้งาน** opens a **แพลตฟอร์ม AI** from the hub. It is the primary usage action recorded for reporting.
_Avoid_: click, visit, launch

**บันทึกการใช้งาน**:
A reporting record of **การเลือกแพลตฟอร์ม**, tied to the **ข้อมูลผู้ใช้งาน**, selected platform, activity label, and recorded time.
_Avoid_: audit log, analytics event, tracking row

**เวลาใช้งาน**:
The recorded time for a **บันทึกการใช้งาน**, expressed as hour, minute, day, month, and year in Thailand time.
_Avoid_: timestamp, ISO date

## Flagged Ambiguities

**คณะ**:
Use **คณะสังกัด** only for a **นิสิต**. If a staff member belongs to a faculty as their workplace, record it as **หน่วยงาน**, not **คณะสังกัด**.

**department**:
In this context, avoid translating `department` as an academic department for students. Student academic program should be **สาขาวิชา**; staff workplace should be **หน่วยงาน**.

## Example Dialogue

Domain expert: นิสิตต้องกรอกอะไรบ้างก่อนใช้ระบบ?

Developer: นิสิตต้องกรอกข้อมูลผู้ใช้งาน ได้แก่ ชื่อ รหัสนิสิต 11 หลัก ชั้นปี คณะสังกัด และสาขาวิชา

Domain expert: แล้วบุคลากรต้องกรอกคณะไหม?

Developer: ถ้าบุคลากรทำงานอยู่ในคณะ ให้บันทึกคณะนั้นเป็นหน่วยงาน ไม่ใช้คำว่าคณะสังกัด เพราะคณะสังกัดเป็นคำของนิสิต

Domain expert: เมื่อผู้ใช้งานกด ChatGPT เรานับอะไร?

Developer: นั่นคือการเลือกแพลตฟอร์ม และจะสร้างบันทึกการใช้งานที่มีข้อมูลผู้ใช้งาน เวลาใช้งาน และแพลตฟอร์ม AI ที่เลือก

## Admin Reporting

The password-protected `/admin` dashboard reports annual usage from the
existing `Logs` Google Sheet. A **ผู้ใช้งานไม่ซ้ำ** is identified by
**รหัสนิสิต** for a **นิสิต** and by normalized full name for **บุคลากร**.
Monthly values deduplicate within each month; the annual value deduplicates
across the selected year. AI popularity counts every **การเลือกแพลตฟอร์ม**.

Configure the Next.js deployment with `ADMIN_PASSWORD`,
`ADMIN_SESSION_SECRET`, and `ADMIN_DATA_SECRET` in addition to the existing
`GOOGLE_SHEETS_SCRIPT_URL`. Use long random values for both secrets and do not
prefix them with `NEXT_PUBLIC_`.

After updating `google-apps-script/Code.gs`, add an Apps Script Property named
`ADMIN_DATA_SECRET` with the same value as the Next.js environment variable,
then deploy a new Web App version. The dashboard cannot read reports until the
new Apps Script deployment is active.
