package kr.co.oti.haebom.system.component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

@Component
public class POI {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /*
     * 엑셀 파일 생성 및 브라우저 다운로드 스트림 전송
     * 
     * @param response      HttpServletResponse 응답 객체
     * @param fileName      다운로드될 파일명 (확장자 제외, 예: "해봄_회원목록")
     * @param sheetName     엑셀 시트 이름 (예: "회원목록")
     * @param headers       헤더 목록 (예: ["순번", "회원번호", "이름", ...])
     * @param rows          데이터 행 목록 (각 행의 셀 데이터 목록)
     * @throws IOException  파일 입출력 예외
     */
    public void exportExcel(HttpServletResponse response, String fileName, String sheetName,
                            List<String> headers, List<List<Object>> rows) throws IOException {

        // 1. 워크북 생성 (try-with-resources로 사용 후 자동 메모리 해제)
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(sheetName);

            // 2. 스타일 생성
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);

            // 3. 헤더 행 생성
            Row headerRow = sheet.createRow(0);
            headerRow.setHeightInPoints(26);

            for (int i = 0; i < headers.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers.get(i));
                cell.setCellStyle(headerStyle);
            }

            // 4. 데이터 행 생성
            int rowNum = 1;
            if (rows != null) {
                for (List<Object> rowData : rows) {
                    Row row = sheet.createRow(rowNum++);
                    row.setHeightInPoints(20);

                    for (int colNum = 0; colNum < rowData.size(); colNum++) {
                        Cell cell = row.createCell(colNum);
                        Object value = rowData.get(colNum);
                        setCellValue(cell, value);
                        cell.setCellStyle(dataStyle);
                    }
                }
            }

            // 5. 컬럼 너비 자동 조정 (글자가 잘리지 않도록 여백 추가)
            for (int i = 0; i < headers.size(); i++) {
                sheet.autoSizeColumn(i);
                int currentWidth = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, Math.max(currentWidth + 1200, 3000));
            }

            // 6. 브라우저 한글 파일명 깨짐 방지 인코딩 및 응답 헤더 설정
            String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replaceAll("\\+", "%20");

            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + encodedFileName + ".xlsx\"; filename*=UTF-8''" + encodedFileName + ".xlsx");

            // 7. 브라우저로 엑셀 데이터 전송
            workbook.write(response.getOutputStream());
            response.flushBuffer();
        }
    }

    // 헤더 셀 스타일 설정 (로얄블루 배경 + 흰색 볼드 폰트 + 가운데 정렬)
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        // 배경색
        style.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        // 글꼴
        Font font = workbook.createFont();
        font.setFontName("맑은 고딕");
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);

        // 정렬
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        // 테두리
        setBorders(style);

        return style;
    }

    // 데이터 셀 스타일 설정 (맑은 고딕 10pt + 가운데 정렬 + 테두리)
    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();

        Font font = workbook.createFont();
        font.setFontName("맑은 고딕");
        font.setFontHeightInPoints((short) 10);
        style.setFont(font);

        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        setBorders(style);

        return style;
    }

    // 셀 테두리 선 설정
    private void setBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    // 데이터 타입별 셀 값 안전 바인딩
    private void setCellValue(Cell cell, Object value) {
        if (value == null) {
            cell.setCellValue("-");
        } else if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else if (value instanceof LocalDateTime) {
            cell.setCellValue(((LocalDateTime) value).format(DATE_TIME_FORMATTER));
        } else if (value instanceof LocalDate) {
            cell.setCellValue(((LocalDate) value).format(DATE_FORMATTER));
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value ? "Y" : "N");
        } else {
            cell.setCellValue(String.valueOf(value));
        }
    }
}