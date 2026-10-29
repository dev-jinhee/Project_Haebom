package kr.co.oti.haebom.business.inquiry.service;

import java.util.List;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.business.inquiry.dto.MyPageCompletedScenarioDTO;
import kr.co.oti.haebom.business.inquiry.dto.MyPageInquiryItemDTO;
import kr.co.oti.haebom.business.inquiry.dto.MyPageProfileResponseDTO;
import kr.co.oti.haebom.business.inquiry.mapper.MyPageMapper;
import kr.co.oti.haebom.business.scenario.mapper.SimulationAnswerMapper;
import kr.co.oti.haebom.business.scenario.mapper.SimulationFamilyMapper;
import kr.co.oti.haebom.business.scenario.mapper.SimulationProgressMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MyPageService {
	
	private final MyPageMapper myPageMapper;
	private final SimulationAnswerMapper simulationAnswerMapper;
	private final SimulationFamilyMapper simulationFamilyMapper;
	private final SimulationProgressMapper simulationProgressMapper;
	private final PasswordEncoder passwordEncoder;
	private final MessageSource messageSource;
	
	public MyPageProfileResponseDTO getProfile(Integer memberId) {
		
		MyPageProfileResponseDTO profile = myPageMapper.selectProfileByMemberId(memberId);
		
		if (profile == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 정보를 찾을 수 없습니다.");
		}
		
		return profile;
	}
	
	@Transactional
	public void withdraw(Integer memberId) {
	    simulationAnswerMapper.deleteAnswerByMemberId(memberId);
	    simulationFamilyMapper.deleteFamilyByMemberId(memberId);
	    simulationProgressMapper.deleteProgressByMemberId(memberId);
	    
		int updateRows = myPageMapper.withdrawMemberById(memberId);
		
		if (updateRows != 1) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "탈퇴 처리할 수 있는 활성 회원을 찾기 못했습니다.");
		}
	}
	
	@Transactional
	public void changePassword(
	        Integer memberId,
	        String currentPassword,
	        String newPassword,
	        String passwordConfirm) {

	    if (currentPassword == null || currentPassword.isBlank()) {
	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST, "현재 비밀번호를 입력해 주세요.");
	    }

	    if (newPassword == null
	            || newPassword.length() < 8
	            || newPassword.length() > 20
	            || !newPassword.matches("^[^><_\"'-]+$")) {
	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST,
	                "새 비밀번호는 8~20자이며 사용할 수 없는 특수문자가 포함되어 있습니다.");
	    }

	    if (passwordConfirm == null || !newPassword.equals(passwordConfirm)) {
	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST, "새 비밀번호 확인이 일치하지 않습니다.");
	    }

	    String encodedCurrentPassword =
	            myPageMapper.selectActivePasswordByMemberId(memberId);

	    if (encodedCurrentPassword == null) {
	        throw new ResponseStatusException(
	                HttpStatus.NOT_FOUND, "활성 회원 정보를 찾을 수 없습니다.");
	    }

	    if (!passwordEncoder.matches(currentPassword, encodedCurrentPassword)) {
	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST, "현재 비밀번호가 올바르지 않습니다.");
	    }

	    String encodedNewPassword = passwordEncoder.encode(newPassword);
	    int updatedRows =
	            myPageMapper.updatePasswordByMemberId(memberId, encodedNewPassword);

	    if (updatedRows != 1) {
	        throw new ResponseStatusException(
	                HttpStatus.CONFLICT, "비밀번호를 변경하지 못했습니다. 다시 시도해 주세요.");
	    }
	}
	
	public List<MyPageInquiryItemDTO> getMyInquiries(Integer memberId) {
	    return myPageMapper.selectInquiriesByMemberId(memberId);
	}
	
	public List<MyPageCompletedScenarioDTO> getCompletedScenarios(Integer memberId) {
		
		List<MyPageCompletedScenarioDTO> records = myPageMapper.selectCompletedScenariosByMemberId(memberId);
		
		for (MyPageCompletedScenarioDTO record : records) {
			String label = messageSource.getMessage(
					"category." + record.getCategoryName(),
					null,
					record.getCategoryName(),
					LocaleContextHolder.getLocale());
			
			record.setCategoryLabel(label);
		}
		
		return records;
	}
}
