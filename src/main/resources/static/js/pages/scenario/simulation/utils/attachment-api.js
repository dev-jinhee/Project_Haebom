
/**
 * 공통 첨부파일 API
 * - 시나리오에 관계없이 재사용
 * - 업로드 엔드포인트는 호출하는 단계에서 전달
 */

// ==============================
// 파일 업로드
// ==============================
export async function uploadAttachment({ url, file }) {

    if (!url || !file) {
        throw new Error("첨부파일 업로드 정보가 없습니다.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(url, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        throw new Error(
            `첨부파일 업로드 실패 (HTTP ${response.status})`
        );
    }

    const result = await response.json();

    if (!result.s3Key || !result.fileName) {
        throw new Error("첨부파일 업로드 응답이 올바르지 않습니다.");
    }

    return result;
}
