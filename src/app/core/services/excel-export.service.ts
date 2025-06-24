import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor() { }

  public exportAsExcelFile(jsonData: any[], excelFileName: string): void {
    // 1. Converte nosso array de objetos JSON para uma planilha do Excel
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);

    // 2. Cria um "livro" do Excel e adiciona nossa planilha a ele
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Dados': worksheet },
      SheetNames: ['Dados']
    };

    // 3. Gera o arquivo .xlsx e dispara o download no navegador
    XLSX.writeFile(workbook, `${excelFileName}_${new Date().getTime()}${EXCEL_EXTENSION}`);
  }
}
