import { Injectable } from '@nestjs/common';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

@Injectable()
export class GoogleSheetService {
  private doc: GoogleSpreadsheet;

  constructor(
    private readonly spreadsheetId?: string,
    private readonly sheetName?: string,
  ) {}

  async initialize(): Promise<void> {
    try {
      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SHEET_EMAIL,
        key: process.env.GOOGLE_SHEET_PRIVATE_KEY.split(String.raw`\n`).join('\n'), // Xử lý xuống dòng
        // apiKey: process.env.GOOGLE_SHEET_API_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.file'],
      });

      if (this.spreadsheetId) {
        // Sử dụng Google Sheet hiện có
        this.doc = new GoogleSpreadsheet(this.spreadsheetId, serviceAccountAuth);

        await this.doc.loadInfo(); // Tải thông tin bảng
      } else if (this.sheetName) {
        // Tạo Google Sheet mới nếu không có `spreadsheetId`
        this.doc = await GoogleSpreadsheet.createNewSpreadsheetDocument(serviceAccountAuth, { title: this.sheetName });
        // this.doc.setPublicAccessLevel('commenter');
        await this.doc.share(process.env.GMAIL_SHARE_SHEET, {
          role: 'writer',
        });
        console.log(`New spreadsheet created with ID: ${this.doc.spreadsheetId}`);
      } else {
        throw new Error('Either spreadsheetId or sheetName must be provided.');
      }
    } catch (error) {
      console.log('🚀 ~ GoogleSheetService ~ initialize ~ error:', error);
    }
  }

  // Thiết lập header cho sheet
  async initializeSheetHeaders(headers: string[], sheetIndex = 0): Promise<void> {
    try {
      await this.doc.loadInfo();
      let sheet = this.doc.sheetsByIndex[sheetIndex];
      if (!sheet) {
        sheet = await this.doc.addSheet();
      }
      await sheet.setHeaderRow(headers);
    } catch (error) {
      console.error('Error while initializing sheet headers:', error.message);
      throw error;
    }
  }

  // Thêm một dòng mới vào sheet
  async appendRow(sheetIndex = 0, rowData: Record<string, any>): Promise<void> {
    await this.doc.loadInfo();
    let sheet = this.doc.sheetsByIndex[sheetIndex];
    if (!sheet) {
      sheet = await this.doc.addSheet();
    }

    // Lấy danh sách header sau khi đảm bảo đã có header
    const headers = sheet.headerValues;

    // Xây dựng đối tượng dữ liệu khớp với header
    const formattedRow = headers.reduce((obj, header) => {
      obj[header] = rowData[header] ?? ''; // Gán giá trị hoặc để trống nếu không có
      return obj;
    }, {});

    await sheet.addRow(formattedRow);
  }

  // Add rows
  async appendRows(sheetIndex: number, rows: any[][]) {
    await this.doc.loadInfo();
    const sheet = this.doc.sheetsByIndex[sheetIndex];

    if (!sheet) {
      throw new Error(`Sheet with index ${sheetIndex} not found`);
    }

    // Thêm nhiều hàng trong một lần
    await sheet.addRows(rows);
  }

  // Lấy dữ liệu từ sheet
  async getSheetData(sheetIndex = 0): Promise<any[]> {
    await this.doc.loadInfo();
    const sheet = this.doc.sheetsByIndex[sheetIndex];
    return await sheet.getRows();
  }

  // Cập nhật một dòng dựa trên index
  async updateRow(sheetIndex = 0, rowIndex: number, rowData: any): Promise<void> {
    await this.doc.loadInfo();
    const sheet = this.doc.sheetsByIndex[sheetIndex];
    const rows = await sheet.getRows();
    const row = rows[rowIndex];
    Object.assign(row, rowData);
    await row.save();
  }

  // Xóa một dòng dựa trên index
  async deleteRow(sheetIndex = 0, rowIndex: number): Promise<void> {
    await this.doc.loadInfo();
    const sheet = this.doc.sheetsByIndex[sheetIndex];
    const rows = await sheet.getRows();
    const row = rows[rowIndex];
    await row.delete();
  }

  async getLinkSheet() {
    await this.doc.loadInfo();
    return `https://docs.google.com/spreadsheets/d/${this.doc.spreadsheetId}/edit`;
  }
}
