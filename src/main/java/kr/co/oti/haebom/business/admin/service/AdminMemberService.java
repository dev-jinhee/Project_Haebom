package kr.co.oti.haebom.business.admin.service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.oti.haebom.business.admin.dto.AdminMemberDTO;
import kr.co.oti.haebom.business.admin.dto.AdminMemberProgressDTO;
import kr.co.oti.haebom.business.admin.mapper.AdminMemberMapper;
import kr.co.oti.haebom.system.component.POI;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminMemberService {
	
	private final AdminMemberMapper adminMemberMapper;
	private final AdminDashboardService adminDashboardService;
	private final POI poi; 
	
	// 1. 전체 회원 목록 조회 (읽기 전용)
	public List<AdminMemberDTO> getMemberList() {
		return adminMemberMapper.selectMemberList();
	}
	
	// 2. 회원 상태 변경 (DB 수정이므로 @Transactional 적용)
	@Transactional
	public void updateMemberStatus(int memberId, String memberStatus) {
		adminMemberMapper.updateMemberStatus(memberId, memberStatus);
		adminDashboardService.recordActivity(1, "MEMBER", "UPDATE", memberId);
	}
	
	// 3. 특정 회원의 시뮬레이션 진행/완료 내역 조회
	public List<AdminMemberProgressDTO> getMemberProgressList(int memberId) {
		return adminMemberMapper.selectMemberProgressList(memberId);
	}
	
	// 4. 회원 목록 엑셀 다운로드 (DB 연동 + POI)
	public void downloadMemberListExcel(HttpServletResponse response) throws IOException {
		
		// 1) DB에서 전체 회원 조회 (관리자 제외)
		List<AdminMemberDTO>memberList = adminMemberMapper.selectMemberList().stream()
			.filter(m -> !"ADMIN".equals(m.getRole())).collect(Collectors.toList());
		
		// 2) 엑셀 헤더 컬럼 정의
		List<String> headers = Arrays.asList("순번", "회원 번호", "이름", "아이디", "이메일", "계정 상태", "가입일시");
		
		// 3) 행 데이터 구성
		List<List<Object>> rows = new ArrayList<>();
		int seq = 1;
		for (AdminMemberDTO m : memberList) {
			String statusText = "알 수 없음";
			if ("ACTIVE".equalsIgnoreCase(m.getMemberStatus())) statusText = "정상";
			else if ("SUSPENDED".equalsIgnoreCase(m.getMemberStatus())) statusText = "이용 정지";
			else if ("WITHDRAWN".equalsIgnoreCase(m.getMemberStatus())) statusText = "탈퇴";
			
			List<Object> row = Arrays.asList(
				seq++, 
				m.getMemberId(), 
				m.getMemberName() != null ? m.getMemberName() : "-", 
				m.getLoginId() != null ? m.getLoginId() : "-", 
				m.getEmail() != null ? m.getEmail() : "-", 
				statusText, 
				m.getCreatedAt()
			);
			rows.add(row);
		}
		
		// 4) 파일명 생성 (예: 해봄_회원목록_20261104)
		String dateStr = 
				LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
		String fileName = "해봄_회원목록_" + dateStr;
		
		// 5) POI 컴포넌트 호출하여 엑셀 생성 및 다운로드 스트림 전송
		poi.exportExcel(response, fileName, "회원목록", headers, rows);
	}
}
