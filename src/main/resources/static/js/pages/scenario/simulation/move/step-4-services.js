// 전입신고 Step4 추가 서비스 5종: 조건부 표시·검증·저장·복원
// 실제 행정기관 신청은 수행하지 않습니다. 파일은 서버 업로드 연동 전까지 브라우저 메모리에만 보관합니다.
import { calculateAge } from "../utils/age.js";
import { uploadAttachment, deleteAttachment } from "../utils/attachment-api.js";

const SERVICE_CODES = ["LEASE_REPORT", "MAIL_FORWARD", "SCHOOL_ADDRESS", "UTILITY_ADDRESS", "WELFARE_BENEFIT"];
const $ = (root, selector) => root.querySelector(selector);
const selected = (root, code) => Boolean($(root, `input[name="additionalService"][value="${code}"]`)?.checked);
const checkedIds = (root, name) => [...root.querySelectorAll(`input[name="${name}"]:checked`)].map(input => Number(input.value));
const checked = (root, name) => Boolean($(root, `[name="${name}"]`)?.checked);
const val = (root, id) => $(root, `#${id}`)?.value?.trim() ?? "";
// 실제 파일 업로드 API 연동 전 단계: 선택한 파일은 브라우저 메모리에만 보관
const LEASE_MAX_FILE_BYTES = 2 * 1024 * 1024;
const LEASE_MAX_FILES = 2;
const LEASE_MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const leaseFilesByRoot = new WeakMap();
// S3 업로드가 완료된 첨부파일 정보
const uploadedLeaseAttachmentsByRoot = new WeakMap();
// 업로드 중복 실행 방지용 변수
const leaseUploadingByRoot = new WeakSet();
const LEASE_MIME_TYPES = {
	pdf: ["application/pdf"],
	jpg: ["image/jpeg"],
	jpeg: ["image/jpeg"],
	bmp: ["image/bmp", "image/x-ms-bmp"]
};

function addPersonCell(row, value) {
	const td = document.createElement("td");
	td.textContent = value ?? "-";
	row.appendChild(td);
}
function birthLabel(value) {
	const m = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
	return m ? `${m[1]}년 ${m[2]}월 ${m[3]}일` : "-";
}
function renderFamilyTable(root, tbodyId, name, families) {
	const tbody = $(root, `#${tbodyId}`);
	if (!tbody) return;
	tbody.replaceChildren();
	for (const family of families) {
		const row = document.createElement("tr");
		const cell = document.createElement("td");
		const input = document.createElement("input");
		input.type = "checkbox";
		input.className = "form-check-input";
		input.name = name;
		input.value = family.familyId;
		input.setAttribute("aria-label", `${family.familyName} 선택`);
		cell.appendChild(input);
		row.appendChild(cell);
		addPersonCell(row, family.originalRelationship === "CHILD" || family.relationship === "CHILD" ? "자녀" : family.originalRelationship === "SELF" ? "본인" : "가족");
		addPersonCell(row, family.familyName);
		addPersonCell(row, birthLabel(family.birthDate));
		addPersonCell(row, family.gender === "M" ? "남" : family.gender === "F" ? "여" : "-");
		tbody.appendChild(row);
	}
	const empty = $(root, `#${tbodyId}Empty`);
	if (empty) empty.classList.toggle("d-none", families.length > 0);
}
function updateSections(root) {
	for (const code of SERVICE_CODES) {
		const section = $(root, `[data-service-section="${code}"]`);
		if (section) section.classList.toggle("d-none", !selected(root, code));
	}
}
/*우편 서비스 신청 전화번호*/
function getPhoneGroup(root, groupId) {
	return [...root.querySelectorAll(`#${groupId} input`)]
		.map(input => input.value.trim())
		.join("-");
}

function setPhoneGroup(root, groupId, phone = "", defaultFirst = "") {
	const inputs = root.querySelectorAll(`#${groupId} input`);
	const parts = String(phone).split("-");

	inputs.forEach((input, index) => {
		input.value = parts[index] || (index === 0 ? defaultFirst : "");
	});
}

// ==============================
// 임대차계약서 실제 파일 선택 UI (S3 업로드 API 연결 전)
// ==============================
function formatLeaseFileSize(bytes) {
	if (bytes < 1024) return `${bytes} Byte`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getLeaseFiles(root) {
	return leaseFilesByRoot.get(root) ?? [];
}

// 이후 S3 업로드 API가 완성되면 FormData 생성에 사용할 예정.
export function getPendingLeaseFiles(root) {
	return [...getLeaseFiles(root)];
}

// S3 업로드가 완료된 파일 정보 반환
export function getUploadedLeaseAttachments(root) {
	return [...(uploadedLeaseAttachmentsByRoot.get(root) ?? [])];
}

function renderLeaseFiles(root, readOnly = false) {
	const tbody = $(root, "#leaseFileList");
	const summary = $(root, "#leaseFileSummary");
	const removeAll = $(root, "#removeAllLeaseFilesBtn");
	if (!tbody || !summary || !removeAll) return;

	const uploadedFiles = getUploadedLeaseAttachments(root);

	const files = [
		...uploadedFiles.map(file => ({
			name: file.fileName,
			size: file.fileSize,
			isUploaded: true,
			s3Key: file.s3Key
		})),
		...getLeaseFiles(root).map(file => ({
			name: file.name,
			size: file.size,
			isUploaded: false,
			originalFile: file
		}))
	];
	tbody.replaceChildren();

	if (files.length === 0) {
		const row = document.createElement("tr");
		row.id = "leaseFileEmptyRow";
		const cell = document.createElement("td");
		cell.colSpan = 3;
		cell.className = "text-center text-secondary py-4";
		const icon = document.createElement("span");
		icon.className = "material-symbols-outlined d-block mb-2";
		icon.setAttribute("aria-hidden", "true");
		icon.textContent = "upload_file";
		const message = document.createElement("span");
		message.className = "small";
		message.textContent = "첨부된 파일이 없습니다.";
		cell.append(icon, message);
		row.appendChild(cell);
		tbody.appendChild(row);
	}
	else {
		files.forEach(file => {
			const row = document.createElement("tr");

			const nameCell = document.createElement("td");
			nameCell.className = "ps-3 text-break";
			nameCell.textContent = file.name;

			const sizeCell = document.createElement("td");
			sizeCell.className = "text-end text-nowrap";
			sizeCell.textContent = formatLeaseFileSize(file.size);

			const actionCell = document.createElement("td");
			actionCell.className = "text-center";


			if (file.isUploaded) {
				const fileId = file.s3Key.split("/").pop();
				const progressId = root.dataset.leaseProgressId;
				const url = `/api/simulation/move/${progressId}/lease-files/${encodeURIComponent(fileId)}`;

				// 다운로드
				const download = document.createElement("a");
				download.className = "btn btn-outline-primary btn-sm";
				download.textContent = "다운로드";
				download.href = url;
				actionCell.appendChild(download);

				// 신청 완료 전에는 업로드된 파일도 삭제 가능
				if (!readOnly) {
					const remove = document.createElement("button");
					remove.type = "button";
					remove.className = "btn btn-outline-secondary btn-sm ms-2";
					remove.textContent = "삭제";

					remove.addEventListener("click", async () => {
						remove.disabled = true;

						try {
							await deleteAttachment(url);

							uploadedLeaseAttachmentsByRoot.set(
								root,
								getUploadedLeaseAttachments(root)
									.filter(item => item.s3Key !== file.s3Key)
							);

							renderLeaseFiles(root, readOnly);

						} catch (error) {
							console.error(error);
							alert("첨부파일 삭제에 실패했습니다.");
							remove.disabled = false;
						}
					});

					actionCell.appendChild(remove);
				}

			} else if (!readOnly) {
				const remove = document.createElement("button");

				remove.type = "button";
				remove.className = "btn btn-outline-secondary btn-sm";
				remove.textContent = "삭제";

				remove.addEventListener("click", () => {
					leaseFilesByRoot.set(
						root,
						getLeaseFiles(root).filter(item => item !== file.originalFile)
					);
					renderLeaseFiles(root, readOnly);
				});

				actionCell.appendChild(remove);
			}


			row.append(nameCell, sizeCell, actionCell);
			tbody.appendChild(row);
		});
	}


	const total = files.reduce((sum, file) => sum + file.size, 0);
	summary.textContent = `${files.length}개 · ${formatLeaseFileSize(total)} / 최대 2개 · 4MB`;
	removeAll.disabled =
		readOnly || files.length === 0 || uploadedFiles.length > 0;
}

// ==============================
// 임대차계약서 S3 업로드
// ==============================
export async function uploadPendingLeaseFiles(root, progressId) {
	// 임대차계약서 서비스를 선택하지 않았다면 업로드하지 않음
	if (!selected(root, "LEASE_REPORT")) {
		return;
	}
	// 업로드 대기 중인 파일
	const pendingFiles = getPendingLeaseFiles(root);

	// 첨부파일이 없다면 업로드 생략
	if (pendingFiles.length === 0) {
		return;
	}
	if (!progressId) {
		throw new Error("시뮬레이션 진행 ID가 없습니다.");
	}

	// 중복 업로드 요청 방지
	if (leaseUploadingByRoot.has(root)) {
		throw new Error("첨부파일 업로드가 이미 진행 중입니다.");
	}

	leaseUploadingByRoot.add(root);
	try {
		const url =
			`/api/simulation/move/${progressId}/lease-files`;

		for (const file of pendingFiles) {

			// 실제 S3 업로드 API 호출
			const result = await uploadAttachment({
				url,
				file
			});

			// 업로드 성공한 파일 정보 저장
			const uploaded = getUploadedLeaseAttachments(root);

			uploadedLeaseAttachmentsByRoot.set(root, [
				...uploaded,
				result
			]);

			// 성공한 파일만 대기 목록에서 제거
			leaseFilesByRoot.set(
				root,
				getLeaseFiles(root).filter(item => item !== file)
			);

		}

		// 업로드 상태 화면 갱신
		renderLeaseFiles(root);

	} finally {
		// 성공한 파일이 하나라도 있다면 목록 갱신
		renderLeaseFiles(root);

		// 업로드 중 상태 해제
		leaseUploadingByRoot.delete(root);
	}
}

function addLeaseFiles(root, newFiles) {
	const current = getLeaseFiles(root);
	if (
		getUploadedLeaseAttachments(root).length
		+ current.length
		+ newFiles.length > LEASE_MAX_FILES
	) {
		alert("첨부파일은 최대 2개까지만 등록할 수 있습니다.");
		return;
	}

	for (const file of newFiles) {
		const ext = file.name.split(".").pop()?.toLowerCase();
		const allowed = LEASE_MIME_TYPES[ext];
		if (!allowed || (file.type && !allowed.includes(file.type))) {
			alert("JPG, JPEG, BMP, PDF 파일만 첨부할 수 있습니다.");
			return;
		}
		if (file.size === 0 || file.size > LEASE_MAX_FILE_BYTES) {
			alert(`파일당 최대 2MB까지 첨부할 수 있습니다: ${file.name}`);
			return;
		}
		if (current.some(old => old.name === file.name && old.size === file.size && old.lastModified === file.lastModified)) {
			alert(`이미 선택된 파일입니다: ${file.name}`);
			return;
		}
	}

	const total =
		[...current, ...newFiles]
			.reduce((sum, file) => sum + file.size, 0)
		+ getUploadedLeaseAttachments(root)
			.reduce((sum, file) => sum + file.fileSize, 0);
	if (total > LEASE_MAX_TOTAL_BYTES) {
		alert("전체 첨부파일 용량은 4MB를 초과할 수 없습니다.");
		return;
	}

	leaseFilesByRoot.set(root, [...current, ...newFiles]);
	renderLeaseFiles(root);
}

// ==============================
// 임대차계약서 S3 삭제
// ==============================
export async function deleteUploadedLeaseFiles(root, progressId) {
	const files = getUploadedLeaseAttachments(root);

	for (const file of files) {
		const fileId = file.s3Key.split("/").pop();
		const url = `/api/simulation/move/${progressId}/lease-files/${encodeURIComponent(fileId)}`;

		try {
			await deleteAttachment(url);

			uploadedLeaseAttachmentsByRoot.set(
				root,
				getUploadedLeaseAttachments(root)
					.filter(item => item.s3Key !== file.s3Key)
			);
		} catch (error) {
			console.error("첨부파일 삭제 실패:", error);
		}
	}

	renderLeaseFiles(root);
}

export function initServices(root, movingFamilies, { readOnly = false, applicantPhone, progressId } = {}) {
	root.dataset.leaseProgressId = progressId;

	const fileInput = $(root, "#leaseFileInput");
	const removeAll = $(root, "#removeAllLeaseFilesBtn");
	const addLabel = $(root, "#addLeaseFileBtn");
	leaseFilesByRoot.set(root, []);
	uploadedLeaseAttachmentsByRoot.set(root, []);
	renderLeaseFiles(root, readOnly);

	if (!readOnly) {
		fileInput?.addEventListener("change", () => {
			const selectedFiles = [...(fileInput.files ?? [])];
			fileInput.value = ""; // 동일 파일 재선택 허용
			if (selectedFiles.length > 0) addLeaseFiles(root, selectedFiles);
		});
		removeAll?.addEventListener("click", () => {
			leaseFilesByRoot.set(root, []);
			if (fileInput) fileInput.value = "";
			renderLeaseFiles(root);
		});
	} else {
		if (fileInput) fileInput.disabled = true;
		if (removeAll) removeAll.disabled = true;
		addLabel?.classList.add("d-none");
	}

	const schoolCandidates = movingFamilies.filter(family => {
		const age = calculateAge(family.birthDate);
		const relation = family.originalRelationship ?? family.relationship;
		return relation === "CHILD" && age !== null && age >= 6 && age <= 13;
	});
	renderFamilyTable(root, "schoolAssignmentTableBody", "schoolFamilyId", schoolCandidates);
	renderFamilyTable(root, "mailFamilyTableBody", "mailFamilyId", movingFamilies);
	$(root, "#schoolCandidateNotice")?.classList.toggle("d-none", schoolCandidates.length > 0);
	root.querySelectorAll('input[name="additionalService"]').forEach(input => {
		if (!readOnly) input.addEventListener("change", () => updateSections(root));
	});
	const sameCheck = $(root, '[name="mailSameAsApplicant"]');

	if (!readOnly) {
		sameCheck?.addEventListener("change", () => {
			setPhoneGroup(
				root,
				"mailForwardPhoneGroup",
				sameCheck.checked ? applicantPhone : "",
				"010"
			);
		});
	}
	updateSections(root);
}
export function getServiceDetails(root) {
	// 체크 해제한 서비스의 하위 입력은 저장하지 않음
	const result = {};
	if (selected(root, "LEASE_REPORT")) {
		result.LEASE_REPORT = {
			reportRequested: checked(root, "leaseReportRequested"),
			attachments: getUploadedLeaseAttachments(root)
		};
	}
	if (selected(root, "MAIL_FORWARD")) {
		result.MAIL_FORWARD = {
			landlinePhone: getPhoneGroup(root, "mailForwardLandlineGroup")
				.replace(/^-+$/, ""),
			phone: getPhoneGroup(root, "mailForwardPhoneGroup"),
			sameAsApplicant: checked(root, "mailSameAsApplicant"),
			familyIds: checkedIds(root, "mailFamilyId")
		};
	}
	if (selected(root, "SCHOOL_ADDRESS")) {
		result.SCHOOL_ADDRESS = { familyIds: checkedIds(root, "schoolFamilyId") };
	}
	if (selected(root, "UTILITY_ADDRESS")) {
		result.UTILITY_ADDRESS = { noticeAgreed: checked(root, "electricNoticeConsent") };
	}
	if (selected(root, "WELFARE_BENEFIT")) {
		result.WELFARE_BENEFIT = { noticeAgreed: checked(root, "welfareNoticeConsent") };
	}
	return result;
}

export function restoreServices(root, details = {}) {
	for (const code of SERVICE_CODES) {
		const item = details?.[code] || {};
		if (code === "LEASE_REPORT") {
			const check = $(root, '[name="leaseReportRequested"]');

			if (check) check.checked = Boolean(item.reportRequested);

			// DB에 저장된 첨부파일 정보 복원
			const attachments = Array.isArray(item.attachments)
				? item.attachments
				: [];

			uploadedLeaseAttachmentsByRoot.set(root, attachments);

			// 첨부파일 목록 화면 갱신
			renderLeaseFiles(
				root,
				Boolean($(root, "#leaseFileInput")?.disabled)
			);

			// 이전 가상 첨부 데이터 처리
			if (item.mockDocumentAttached === true && attachments.length === 0) {
				const message = $(root, "#leaseFileEmptyRow .small");

				if (message) {
					message.textContent =
						"이전 가상 첨부 기록입니다. 실제 파일을 다시 첨부해 주세요.";
				}
			}
		}
		if (code === "MAIL_FORWARD") {
			setPhoneGroup(root, "mailForwardLandlineGroup", item.landlinePhone || "");
			setPhoneGroup(root, "mailForwardPhoneGroup", item.phone || "", "010");

			const sameCheck = $(root, '[name="mailSameAsApplicant"]');
			if (sameCheck) sameCheck.checked = Boolean(item.sameAsApplicant);

			root.querySelectorAll('[name="mailFamilyId"]').forEach(input => {
				input.checked = (item.familyIds || [])
					.some(id => String(id) === input.value);
			});
		}
		if (code === "SCHOOL_ADDRESS") {
			root.querySelectorAll('[name="schoolFamilyId"]').forEach(input => {
				input.checked = (item.familyIds || []).some(id => String(id) === input.value);
			});
		}
		if (code === "UTILITY_ADDRESS" || code === "WELFARE_BENEFIT") {
			const name = code === "UTILITY_ADDRESS" ? "electricNoticeConsent" : "welfareNoticeConsent";
			const check = $(root, `[name="${name}"]`);
			if (check) check.checked = Boolean(item.noticeAgreed);
		}
	}
	updateSections(root);
}
export function validateServices(root) {

	if (selected(root, "MAIL_FORWARD")) {
		if (!/^010-\d{4}-\d{4}$/.test(
			getPhoneGroup(root, "mailForwardPhoneGroup")
		)) {
			alert("우편물 주소 이전 서비스의 휴대전화번호를 입력해 주세요.");
			root.querySelector("#mailForwardPhoneGroup input")?.focus();
			return false;
		}
		if (!checkedIds(root, "mailFamilyId").length) {
			alert("우편물 주소 이전 서비스 신청 대상자를 한 명 이상 선택해 주세요.");
			(root.querySelector('input[name="mailFamilyId"]:not(:disabled)')
				?? root.querySelector('input[name="additionalService"][value="MAIL_FORWARD"]'))?.focus();
			return false;
		}
		const landline = getPhoneGroup(root, "mailForwardLandlineGroup")
			.replace(/^-+$/, "");

		if (landline && !/^\d{2,3}-\d{3,4}-\d{4}$/.test(landline)) {
			alert("신청인 전화번호를 올바르게 입력해 주세요.");
			root.querySelector("#mailForwardLandlineGroup input")?.focus();
			return false;
		}
	}
	if (selected(root, "SCHOOL_ADDRESS") && !checkedIds(root, "schoolFamilyId").length) {
		alert("초등학교 배정정보 신청 대상 아동을 선택해 주세요. 대상자가 없다면 서비스를 해제해 주세요.");
		(root.querySelector('input[name="schoolFamilyId"]:not(:disabled)')
			?? root.querySelector('input[name="additionalService"][value="SCHOOL_ADDRESS"]'))?.focus();
		return false;
	}
	if (selected(root, "UTILITY_ADDRESS") && !checked(root, "electricNoticeConsent")) {
		alert("전기사용자 명의변경 유의사항을 확인해 주세요.");
		root.querySelector('[name="electricNoticeConsent"]:not(:disabled)')?.focus();
		return false;
	}
	if (selected(root, "WELFARE_BENEFIT") && !checked(root, "welfareNoticeConsent")) {
		alert("요금감면 일괄신청 유의사항을 확인해 주세요.");
		root.querySelector('[name="welfareNoticeConsent"]:not(:disabled)')?.focus();
		return false;
	}
	return true;
}
