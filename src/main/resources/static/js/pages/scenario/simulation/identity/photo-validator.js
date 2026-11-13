/**
 * 해봄 | 주민등록증 재발급 사진 검사 (DB / API와 독립)
 * 주의: 350 x 450px, 비율 허용오차는 '해봄 학습용 기준'이며 정부24의 공식 픽셀 기준이 아님.
 */
export const PHOTO_RULES = Object.freeze({
	MAX_SIZE_BYTES: 5 * 1024 * 1024, // 기존 프로젝트 제한 유지
	MIN_WIDTH: 350,                 // 해봄 학습용 기준
	MIN_HEIGHT: 450,                // 해봄 학습용 기준
	TARGET_RATIO: 3.5 / 4.5,
	RATIO_TOLERANCE: 0.02          // 해봄 학습용 허용오차(절대 비율값)
});

function readImageDimensions(file) {
	return new Promise((resolve, reject) => {
		const objectUrl = URL.createObjectURL(file);
		const image = new Image();

		image.onload = () => {
			const result = { width: image.naturalWidth, height: image.naturalHeight };
			URL.revokeObjectURL(objectUrl);
			resolve(result);
		};
		image.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error("이미지를 읽을 수 없습니다."));
		};
		image.src = objectUrl;
	});
}

async function detectImageFormat(file) {
	const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
	const isJpeg = bytes.length >= 3 &&
		bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
	const isPng = bytes.length >= 8 &&
		bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e &&
		bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a &&
		bytes[6] === 0x1a && bytes[7] === 0x0a;
	return isJpeg ? "JPEG" : isPng ? "PNG" : null;
}

/** 반환값: { passed, checks, width, height, format } */
export async function inspectPhotoFile(file) {
	if (!(file instanceof Blob)) {
		throw new TypeError("검사할 이미지 파일이 없습니다.");
	}

	const fileName = typeof file.name === "string" ? file.name : "";
	const extension = /\.([a-z0-9]+)$/i.exec(fileName)?.[1]?.toLowerCase() ?? "";
	const validExtension = ["jpg", "jpeg", "png"].includes(extension);
	const signature = await detectImageFormat(file);
	const matchingExtension = signature === "JPEG"
		? ["jpg", "jpeg"].includes(extension)
		: signature === "PNG" && extension === "png";
	const validMime = !file.type || file.type === "application/octet-stream" ||
		file.type === (signature === "JPEG" ? "image/jpeg" : "image/png");
	const formatPassed = Boolean(validExtension && matchingExtension && validMime);
	const sizePassed = file.size > 0 && file.size <= PHOTO_RULES.MAX_SIZE_BYTES;

	let dimensions = null;
	if (signature && sizePassed) {
		try {
			dimensions = await readImageDimensions(file);
		} catch {
			// 확장자/시그니처가 맞더라도 손상된 이미지는 불합격
		}
	}

	const width = dimensions?.width ?? 0;
	const height = dimensions?.height ?? 0;
	const ratio = height > 0 ? width / height : 0;
	const resolutionPassed = width >= PHOTO_RULES.MIN_WIDTH &&
		height >= PHOTO_RULES.MIN_HEIGHT;
	const ratioPassed = height > 0 &&
		Math.abs(ratio - PHOTO_RULES.TARGET_RATIO) <= PHOTO_RULES.RATIO_TOLERANCE;

	const ratioDifference = height > 0
		? Math.abs(ratio - PHOTO_RULES.TARGET_RATIO)
		/ PHOTO_RULES.TARGET_RATIO * 100
		: 0;

	const ratioDirection = ratio < PHOTO_RULES.TARGET_RATIO
		? "세로 대비 가로가 좁습니다."
		: "세로 대비 가로가 넓습니다.";

	const ratioDetail = dimensions
		? ratioPassed
			? `가로:세로 ${width}:${height} / 권장 3.5:4.5 (학습용 기준 통과)`
			: `가로:세로 ${width}:${height} / 권장 3.5:4.5 · ${ratioDirection} (차이 약 ${ratioDifference.toFixed(1)}%)`
		: "사진의 가로·세로 비율을 확인할 수 없습니다.";

	const checks = [
		{
			key: "format", label: "파일 형식", passed: formatPassed,
			detail: formatPassed ? `${signature} 형식 확인` : "JPG, JPEG, PNG 파일만 허용하며 실제 파일 형식과 확장자가 일치해야 합니다."
		},
		{
			key: "size", label: "파일 용량", passed: sizePassed,
			detail: `${(file.size / 1024 / 1024).toFixed(2)}MB / 최대 5MB`
		},
		{
			key: "resolution", label: "이미지 해상도", passed: resolutionPassed,
			detail: dimensions
				? `${width} × ${height}px / 학습용 최소 ${PHOTO_RULES.MIN_WIDTH} × ${PHOTO_RULES.MIN_HEIGHT}px`
				: "이미지를 읽을 수 없거나 유효한 해상도가 없습니다."
		},

		{
			key: "ratio",
			label: "사진 비율",
			passed: ratioPassed,
			detail: ratioDetail
		}
	];
	return {
		passed: checks.every(check => check.passed),
		checks, width, height, format: signature
	};
}
