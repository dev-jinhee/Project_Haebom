
/**
 * 주민등록증 재발급 UI
 * 저장 / 복원 / 검증은 step-1.js에서 처리
 */

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
	function clearResults() {
		resultBody?.replaceChildren();
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

				console.log("[SGIS 검색 응답]", data);

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
	// 3. 검색 이벤트
	// ==============================
	if (!readOnly) {
		openBtn?.addEventListener("click", () => {
			if (!dialog) {
				console.error("수령기관 모달을 찾을 수 없습니다.");
				return;
			}

			if (searchInput) searchInput.value = "";
			clearResults();

			setStatus("지역명을 입력하고 검색해 주세요.");

			if (!dialog.open) dialog.showModal();

			searchInput?.focus();
		});

		closeBtn?.addEventListener("click", () => {
			dialog?.close();
		});

		searchBtn?.addEventListener("click", searchOffices);

		searchInput?.addEventListener("keydown", event => {
			if (event.key === "Enter") {
				event.preventDefault();
				searchOffices();
			}
		});
	} else if (openBtn) {
		openBtn.disabled = true;
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
	setupPhotoPreview(root, readOnly);
}
// ==============================
// S3 증명사진 미리보기 복원
// ==============================
export function renderSavedPhotoPreview(root, photo, progressId) {

	const preview = root.querySelector("#identityPhotoPreview");

	if (!preview || !photo?.s3Key || !progressId) return;

	// 서버가 생성한 파일 ID만 허용
	const fileId = photo.s3Key.split("/").pop();

	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png)$/i.test(fileId)) {
		console.error("올바르지 않은 증명사진 ID:", fileId);
		return;
	}

	const url =
		`/api/simulation/identity/${progressId}/photo/` +
		encodeURIComponent(fileId);

	preview.replaceChildren();

	const note = document.createElement("p");
	note.textContent = `첨부된 파일: ${photo.fileName || fileId}`;

	const img = document.createElement("img");
	img.src = url;
	img.alt = "첨부된 증명사진";
	img.style.cssText =
		"max-width:160px;max-height:200px;" +
		"object-fit:contain;display:block;";

	img.addEventListener("error", () => {
		preview.replaceChildren();

		const error = document.createElement("p");
		error.textContent = "증명사진을 불러오지 못했습니다.";

		preview.appendChild(error);
	});

	preview.append(note, img);
}
// ==============================
// 증명사진 미리보기
// ==============================
function setupPhotoPreview(root, readOnly) {
	const input = root.querySelector("#identityPhotoInput");
	const preview = root.querySelector("#identityPhotoPreview");

	if (!input || !preview || readOnly) return;

	let currentUrl = null;

	input.addEventListener("change", () => {
		if (currentUrl) {
			URL.revokeObjectURL(currentUrl);
		}

		currentUrl = null;
		preview.replaceChildren();

		const file = input.files?.[0];
		if (!file) return;

		const note = document.createElement("p");
		note.textContent = `선택한 파일: ${file.name}`;
		preview.appendChild(note);

		if (file.type.startsWith("image/")) {
			currentUrl = URL.createObjectURL(file);

			const img = document.createElement("img");
			img.src = currentUrl;
			img.alt = "선택한 증명사진 미리보기";
			img.style.cssText =
				"max-width:160px;max-height:200px;" +
				"object-fit:contain;display:block;";

			preview.appendChild(img);
		}
	});
}
