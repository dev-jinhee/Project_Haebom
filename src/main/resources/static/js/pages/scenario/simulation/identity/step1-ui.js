
/**
 * 주민등록증 재발급 UI
 * 저장 / 복원 / 검증은 step-1.js에서 처리
 */

import { inspectPhotoFile } from "./photo-validator.js";

export function initIdentityStepUi(root, { readOnly = false } = {}) {
	if (!root) return;

	// 요소 조회 함수
	const find = selector =>
		root.querySelector(selector) || document.querySelector(selector);

	const officeCode = find("#identityPickupOfficeCode");
	// ==============================
	// 1. IC칩 포함 여부
	// ==============================
	const chipRadios = root.querySelectorAll(
		'input[name="icChipIncluded"]'
	);

	const otherLabel = find("#identityOtherReasonOption");
	const otherRadio = otherLabel?.querySelector(
		'input[name="reissueReason"]'
	);

	function syncOtherReason() {
		const selected = root.querySelector(
			'input[name="icChipIncluded"]:checked'
		)?.value;

		const show = selected === "Y";

		if (!otherLabel || !otherRadio) return;

		otherLabel.hidden = !show;
		otherRadio.disabled = !show || readOnly;

		if (!show) otherRadio.checked = false;
	}

	chipRadios.forEach(radio => {
		radio.addEventListener("change", syncOtherReason);
	});

	syncOtherReason();
	root.syncIdentityOtherReason = syncOtherReason;


	// ==============================
	// 2. 수령기관 검색
	// ==============================

	const dialog = find("#identityOfficeDialog");
	const openBtn = find("#identitySearchOfficeBtn");
	const closeBtn = find("#identityOfficeCloseBtn");
	const searchBtn = find("#identityOfficeSearchBtn");
	const searchInput = find("#identityOfficeKeyword");
	const resultBody = find("#identityOfficeResults");
	const resultStatus = find("#identityOfficeResultStatus");
	const officeName = find("#identityPickupOffice");

	let requestId = 0;

	function setStatus(message) {
		if (resultStatus) {
			resultStatus.textContent = message;
		}
	}
	// 수령지역 검색 결과 출력
	function renderOffices(regions) {
		if (!resultBody) return;

		resultBody.replaceChildren();

		if (!Array.isArray(regions) || regions.length === 0) {
			const row = document.createElement("tr");
			const cell = document.createElement("td");

			cell.colSpan = 3;
			cell.className = "text-center text-muted";
			cell.textContent = "검색 결과가 없습니다.";

			row.appendChild(cell);
			resultBody.appendChild(row);

			setStatus("검색 결과가 없습니다.");
			return;
		}

		for (const region of regions) {
			// 실제 백엔드 DTO 필드명 사용
			const area = region.fullAddr?.trim();

			if (!area) continue;

			const row = document.createElement("tr");
			const nameCell = document.createElement("td");
			const areaCell = document.createElement("td");
			const actionCell = document.createElement("td");
			const choose = document.createElement("button");

			// 행정구역명만 표시
			nameCell.textContent = area;
			areaCell.textContent = region.regionName || "";

			choose.type = "button";
			choose.className = "btn btn-sm btn-outline-primary";
			choose.textContent = "선택";

			choose.addEventListener("click", () => {
				// 전체 행정구역명만 저장
				if (officeName) {
					// 화면에는 전체 행정구역 표시
					officeName.value = region.fullAddr;
				}

				// 실제 저장할 SGIS 코드
				if (officeCode) {
					officeCode.value = region.regionCode;
				}

				requestId++;

				dialog?.close();
				openBtn?.focus();
			});

			actionCell.appendChild(choose);
			row.append(nameCell, areaCell, actionCell);
			resultBody.appendChild(row);
		}

		setStatus(`${regions.length}개 지역이 검색되었습니다.`);
	}

	// INDEXING 상태를 확인하면서 검색
	async function searchOffices() {
		const keyword = searchInput?.value.trim() || "";

		if (keyword.length < 2) {
			setStatus("검색어를 2자 이상 입력해 주세요.");
			return;
		}

		const currentRequest = ++requestId;

		resultBody?.replaceChildren();
		setStatus("검색 중입니다.");

		if (searchBtn) searchBtn.disabled = true;

		try {
			while (currentRequest === requestId) {
				const response = await fetch(
					`/api/address/sgis/search?keyword=${encodeURIComponent(keyword)}`
				);

				if (!response.ok) {
					throw new Error(`검색 실패 (${response.status})`);
				}

				const data = await response.json();

				if (currentRequest !== requestId) return;

				if (data.status === "READY") {
					renderOffices(data.results || []);
					return;
				}
				if (data.status === "ERROR") {
					throw new Error("SGIS 행정구역 색인에 실패했습니다.");
				}

				if (data.status !== "INDEXING") {
					throw new Error("알 수 없는 검색 상태");
				}

				setStatus(
					"행정구역 데이터를 준비하고 있습니다. " +
					"첫 조회에는 시간이 걸릴 수 있습니다."
				);

				// 2초 후 다시 조회
				await new Promise(resolve => setTimeout(resolve, 2000));
			}
		} catch (error) {
			if (currentRequest !== requestId) return;

			console.error("수령기관 검색 오류:", error);
			setStatus("검색 중 오류가 발생했습니다.");
		} finally {
			if (currentRequest === requestId && searchBtn) {
				searchBtn.disabled = false;
			}
		}
	}

	if (readOnly) {
		if (openBtn) openBtn.disabled = true;
	} else {
		openBtn?.addEventListener("click", () => {
			if (!dialog) {
				console.error("수령기관 검색 모달을 찾을 수 없습니다.");
				return;
			}

			if (searchInput) searchInput.value = "";
			resultBody?.replaceChildren();

			setStatus("지역명을 입력하고 검색해 주세요.");

			if (!dialog.open) dialog.showModal();
			searchInput?.focus();
		});

		closeBtn?.addEventListener("click", () => {
			requestId++;
			if (searchBtn) searchBtn.disabled = false;
			dialog?.close();
		});

		dialog?.addEventListener("close", () => {
			requestId++;
			if (searchBtn) searchBtn.disabled = false;
		});

		searchBtn?.addEventListener("click", searchOffices);

		searchInput?.addEventListener("keydown", event => {
			if (event.key === "Enter") {
				event.preventDefault();
				searchOffices();
			}
		});
	}


	// ==============================
	// 4. 구비서류 전체 동의
	// ==============================
	const all = find("#identityConsentAll");

	const items = [
		...root.querySelectorAll('input[name="documentConsent"]')
	];

	if (!readOnly) {
		all?.addEventListener("change", () => {
			items.forEach(input => {
				input.checked = all.checked;
			});
		});

		items.forEach(input => {
			input.addEventListener("change", () => {
				if (all) {
					all.checked = items.length > 0 &&
						items.every(item => item.checked);
				}
			});
		});
	}

	if (all) {
		all.checked = items.length > 0 &&
			items.every(item => item.checked);
	}

	// ==============================
	// 5. 증명사진 미리보기
	// ==============================
	const photoConfirmations = root.querySelector(".identity-photo-confirmations");
	if (photoConfirmations) photoConfirmations.hidden = false;
	if (readOnly) {
		[
			"#identityPhotoRecentConfirmed",
			"#identityPhotoAppearanceConfirmed"
		].forEach(selector => {
			const input = root.querySelector(selector);

			if (input) {
				input.checked = true;
				input.disabled = true;
			}
		});
	}
	setupPhotoPreview(root, readOnly);
}
// ==============================
// 사진 검사 상태: root별 메모리 보관, DB 저장 대상 아님
// ==============================
const photoInspections = new WeakMap();
const photoRequestIds = new WeakMap();
const previewUrls = new WeakMap();

export function getPhotoInspection(root) {
	return photoInspections.get(root) ?? {
		status: "empty", file: null, photoKey: null, report: null
	};
}

function nextPhotoRequest(root) {
	const next = (photoRequestIds.get(root) ?? 0) + 1;
	photoRequestIds.set(root, next);
	return next;
}

function isCurrentPhotoRequest(root, requestId) {
	return photoRequestIds.get(root) === requestId;
}

function clearPreviewUrl(root) {
	const url = previewUrls.get(root);
	if (url) URL.revokeObjectURL(url);
	previewUrls.delete(root);
}

function makeElement(tag, className, content) {
	const element = document.createElement(tag);
	if (className) element.className = className;
	if (content != null) element.textContent = content;
	return element;
}

function renderPhotoPanel(root, fileName, imageUrl = "") {
	const preview = root.querySelector("#identityPhotoPreview");
	if (!preview) return;

	preview.replaceChildren();
	const review = makeElement("div", "identity-photo-review");
	const imageBox = makeElement("div", "identity-photo-image");
	const title = makeElement("p", "identity-photo-file-name", `첨부 사진: ${fileName}`);
	imageBox.appendChild(title);

	if (imageUrl) {
		const image = makeElement("img");
		image.src = imageUrl;
		image.alt = "증명사진 미리보기";
		image.addEventListener("error", () => {
			image.replaceWith(makeElement("p", "identity-note", "사진 미리보기를 표시할 수 없습니다."));
		});
		imageBox.appendChild(image);
	}

	const checksBox = makeElement("div", "identity-photo-checks");
	checksBox.setAttribute("aria-live", "polite");
	review.append(imageBox, checksBox);
	preview.appendChild(review);
	updatePhotoPanel(root);
}

function updatePhotoPanel(root) {
	const box = root.querySelector("#identityPhotoPreview .identity-photo-checks");
	if (!box) return;

	const state = getPhotoInspection(root);
	box.replaceChildren();
	box.appendChild(makeElement("p", "identity-photo-checks-title", "증명사진 검사 결과"));

	if (state.status === "checking") {
		box.appendChild(makeElement("p", "identity-photo-status", "사진의 형식, 용량, 해상도와 비율을 검사하고 있습니다."));
		return;
	}
	if (state.status === "failed" && !state.report) {
		box.appendChild(makeElement("p", "identity-photo-status is-fail", state.error || "검사할 수 없는 사진입니다. 다시 선택해 주세요."));
		return;
	}

	for (const check of state.report?.checks ?? []) {
		const item = makeElement("div", `identity-photo-check ${check.passed ? "is-pass" : "is-fail"}`);
		const symbol = check.passed ? "✓" : "✕";
		item.append(
			makeElement("span", "identity-photo-check-label", `${symbol} ${check.label}`),
			makeElement("span", "identity-photo-check-detail", check.detail)
		);
		box.appendChild(item);
	}

	const passed = state.status === "passed";
	box.appendChild(makeElement(
		"p", `identity-photo-status ${passed ? "is-pass" : "is-fail"}`,
		passed ? "자동 검사 통과 · 아래 촬영 조건도 확인해 주세요." :
			"자동 검사 미통과 · 사진을 다시 선택해 주세요."
	));
}

// ==============================
// S3에 기존 업로드된 사진 복원 + 재검증
// ==============================
export async function renderSavedPhotoPreview(root, photo, progressId, { preserveValidation = false } = {}) {
	const preview = root.querySelector("#identityPhotoPreview");
	if (!preview || !photo?.s3Key || !progressId) return;

	const requestId = nextPhotoRequest(root);
	clearPreviewUrl(root);

	const fileId = photo.s3Key.split("/").pop();
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png)$/i.test(fileId)) {
		photoInspections.set(root, {
			status: "failed", file: null, photoKey: photo.s3Key, report: null,
			error: "저장된 사진 ID가 올바르지 않습니다. 사진을 다시 첨부해 주세요."
		});
		renderPhotoPanel(root, photo.fileName || fileId);
		return;
	}

	const url = `/api/simulation/identity/${encodeURIComponent(progressId)}/photo/${encodeURIComponent(fileId)}`;
	const previous = getPhotoInspection(root);

	/* 완료 후 다시보기에서 저장된 파일명 표시 */
	const fileInput = root.querySelector("#identityPhotoInput");
	const isCompleted = document.body.classList.contains("is-completed");

	if (fileInput && isCompleted && photo?.s3Key) {
		// 원래 파일 선택창 숨김
		fileInput.classList.add("d-none");

		// 중복 생성 방지
		fileInput.parentElement
			.querySelector(".identity-photo-file-readonly")
			?.remove();

		const display = document.createElement("div");
		display.className = "identity-photo-file-readonly";

		const label = document.createElement("span");
		label.className = "file-label";
		label.textContent = "첨부 완료";

		const name = document.createElement("span");
		name.className = "file-name";
		name.textContent = photo.fileName || fileId;

		display.append(label, name);
		fileInput.insertAdjacentElement("afterend", display);
	}



	// 새 파일을 방금 검증해서 업로드한 경우 검사 결과를 그대로 유지
	if (preserveValidation && previous.status === "passed") {
		photoInspections.set(root, {
			status: "passed", file: null, photoKey: photo.s3Key, report: previous.report
		});
		renderPhotoPanel(root, photo.fileName || fileId, url);
		return;
	}

	photoInspections.set(root, {
		status: "checking", file: null, photoKey: photo.s3Key, report: null
	});
	renderPhotoPanel(root, photo.fileName || fileId, url);

	try {
		// 기존 미리보기 GET API로 파일을 읽고 검증한다. 검증 결과는 서버/DB로 보내지 않음.
		const response = await fetch(url, { credentials: "same-origin" });
		if (!response.ok) throw new Error(`사진 조회 실패 (${response.status})`);

		const blob = await response.blob();

		// MIME 타입에 포함된 charset 제거
		const contentType = blob.type.split(";")[0].trim().toLowerCase();

		const file = new File(
			[blob],
			photo.fileName || fileId,
			{ type: contentType }
		);

		const report = await inspectPhotoFile(file);

		if (!isCurrentPhotoRequest(root, requestId)) return;

		photoInspections.set(root, {
			status: report.passed ? "passed" : "failed",
			file: null, photoKey: photo.s3Key, report
		});
		updatePhotoPanel(root);
	} catch (error) {
		if (!isCurrentPhotoRequest(root, requestId)) return;
		photoInspections.set(root, {
			status: "failed", file: null, photoKey: photo.s3Key, report: null,
			error: "저장된 증명사진을 확인할 수 없습니다. 다시 첨부해 주세요."
		});
		console.error("저장된 증명사진 검사 실패:", error);
		updatePhotoPanel(root);
	}
}

// ==============================
// 새 증명사진 미리보기 + 자동 검사
// ==============================
function setupPhotoPreview(root, readOnly) {
	const input = root.querySelector("#identityPhotoInput");
	const preview = root.querySelector("#identityPhotoPreview");
	if (!input || !preview || readOnly) return;

	photoInspections.set(root, {
		status: "empty", file: null, photoKey: null, report: null
	});

	input.addEventListener("change", async () => {
		const requestId = nextPhotoRequest(root);
		clearPreviewUrl(root);
		preview.replaceChildren();

		const file = input.files?.[0];
		if (!file) {
			photoInspections.set(root, {
				status: "empty", file: null, photoKey: null, report: null
			});
			return;
		}

		const isImage = file.type.startsWith("image/") || /\.(jpe?g|png)$/i.test(file.name);
		const url = isImage ? URL.createObjectURL(file) : "";
		if (url) previewUrls.set(root, url);
		photoInspections.set(root, {
			status: "checking", file, photoKey: null, report: null
		});
		renderPhotoPanel(root, file.name, url);

		try {
			const report = await inspectPhotoFile(file);
			if (!isCurrentPhotoRequest(root, requestId)) return;
			photoInspections.set(root, {
				status: report.passed ? "passed" : "failed",
				file, photoKey: null, report
			});
			updatePhotoPanel(root);
		} catch (error) {
			if (!isCurrentPhotoRequest(root, requestId)) return;
			photoInspections.set(root, {
				status: "failed", file, photoKey: null, report: null,
				error: "파일을 검사할 수 없습니다. 다시 선택해 주세요."
			});
			console.error("증명사진 검사 실패:", error);
			updatePhotoPanel(root);
		}
	});
}
