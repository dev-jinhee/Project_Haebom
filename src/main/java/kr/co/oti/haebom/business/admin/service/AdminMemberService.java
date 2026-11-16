package kr.co.oti.haebom.business.admin.service;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.business.admin.dto.AdminMemberDTO;
import kr.co.oti.haebom.business.admin.dto.AdminMemberProgressDTO;
import kr.co.oti.haebom.business.admin.mapper.AdminMemberMapper;
import kr.co.oti.haebom.business.scenario.mapper.SimulationAnswerMapper;
import kr.co.oti.haebom.business.scenario.mapper.SimulationFamilyMapper;
import kr.co.oti.haebom.business.scenario.mapper.SimulationProgressMapper;
import kr.co.oti.haebom.system.component.POI;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminMemberService {
	
	private static final Set<String> ALLOWED_MEMBER_STATUSES = Set.of("ACTIVE", "SUSPENDED", "WITHDRAWN");

	private final AdminMemberMapper adminMemberMapper;
	private final AdminDashboardService adminDashboardService;
	private final SimulationAnswerMapper simulationAnswerMapper;
	private final SimulationFamilyMapper simulationFamilyMapper;
	private final SimulationProgressMapper simulationProgressMapper;
	private final POI poi; 
	
	// 1. 전체 회원 목록 조회 (읽기 전용)
	public List<AdminMemberDTO> getMemberList() {
		return adminMemberMapper.selectMemberList();
	}
	
	// 2. 회원 상태 변경 (탈퇴 회원은 변경 불가 / 탈퇴 전환 시 개인정보·연습 기록 파기)
	@Transactional
	public void updateMemberStatus(Integer memberId, String memberStatus, int currentAdminId) {
		if (currentAdminId <= 0) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "관리자 인증 정보가 유효하지 않습니다.");
		}
		if (memberId == null || memberId <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 회원 번호가 아닙니다.");
		}
		if (memberStatus == null || memberStatus.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "변경할 회원 상태를 입력해주세요.");
		}
		String normalizedStatus = memberStatus.trim().toUpperCase(Locale.ROOT);
		if (!ALLOWED_MEMBER_STATUSES.contains(normalizedStatus)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "허용되지 않은 회원 상태입니다.");
		}

		String currentStatus = adminMemberMapper.selectMemberStatusById(memberId);
		if (currentStatus == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않거나 변경할 수 없는 회원입니다.");
		}
		if ("WITHDRAWN".equalsIgnoreCase(currentStatus)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 탈퇴한 회원의 상태는 변경할 수 없습니다.");
		}

		int updatedRows;
		if ("WITHDRAWN".equals(normalizedStatus)) {
			// 직접 탈퇴(MyPageService.withdraw)와 동일하게 연습 데이터 + 개인정보 파기
			simulationAnswerMapper.deleteAnswerByMemberId(memberId);
			simulationFamilyMapper.deleteFamilyByMemberId(memberId);
			simulationProgressMapper.deleteProgressByMemberId(memberId);
			updatedRows = adminMemberMapper.withdrawMemberById(memberId);
		} else {
			updatedRows = adminMemberMapper.updateMemberStatus(memberId, normalizedStatus);
		}

		if (updatedRows != 1) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 탈퇴했거나 상태를 변경할 수 없는 회원입니다.");
		}
		adminDashboardService.recordActivity(currentAdminId, "MEMBER", "UPDATE", memberId);
	}
	
	// 3. 특정 회원의 시뮬레이션 진행/완료 내역 조회
	public List<AdminMemberProgressDTO> getMemberProgressList(int memberId) {
		return adminMemberMapper.selectMemberProgressList(memberId);
	}
	
	// 4. 회원 목록 대용량 CSV 스트리밍 다운로드 (OOM 방지 및 대규모 데이터 최적화)
	public void downloadMemberListCsv(HttpServletResponse response) throws IOException {
		// 1) DB에서 전체 회원 조회 (관리자 제외)
		List<AdminMemberDTO> memberList = adminMemberMapper.selectMemberList().stream()
			.filter(m -> !"ADMIN".equals(m.getRole())).collect(Collectors.toList());

		// 2) 파일명 생성 (예: 해봄_회원목록_20261116.csv)
		String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
		String fileName = "해봄_회원목록_" + dateStr + ".csv";
		String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replaceAll("\\+", "%20");

		response.setContentType("text/csv; charset=UTF-8");
		response.setHeader("Content-Disposition", "attachment; filename=\"" + encodedFileName + "\"; filename*=UTF-8''" + encodedFileName);

		// 3) UTF-8 BOM (\uFEFF) 및 스트리밍 출력 (Excel 한글 깨짐 방지)
		try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(response.getOutputStream(), StandardCharsets.UTF_8))) {
			writer.write('\uFEFF');

			// CSV 헤더
			writer.println("순번,회원 번호,이름,아이디,이메일,계정 상태,가입일시");

			int seq = 1;
			for (AdminMemberDTO m : memberList) {
				String statusText = "알 수 없음";
				if ("ACTIVE".equalsIgnoreCase(m.getMemberStatus())) statusText = "정상";
				else if ("SUSPENDED".equalsIgnoreCase(m.getMemberStatus())) statusText = "이용 정지";
				else if ("WITHDRAWN".equalsIgnoreCase(m.getMemberStatus())) statusText = "탈퇴";

				writer.printf("%d,%d,%s,%s,%s,%s,%s%n",
					seq++,
					m.getMemberId(),
					escapeCsv(m.getMemberName()),
					escapeCsv(m.getLoginId()),
					escapeCsv(m.getEmail()),
					statusText,
					escapeCsv(m.getCreatedAt() != null ? m.getCreatedAt().toString() : "-")
				);
			}
			writer.flush();
		}
	}

	// 기존 엑셀 다운로드 호환 메서드 (CSV 스트리밍으로 연결)
	public void downloadMemberListExcel(HttpServletResponse response) throws IOException {
		downloadMemberListCsv(response);
	}

	private String escapeCsv(String value) {
		if (value == null || value.isBlank()) return "-";
		if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
			return "\"" + value.replace("\"", "\"\"") + "\"";
		}
		return value;
	}
}
