package kr.co.oti.haebom.service;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import kr.co.oti.haebom.domain.SimulationFamily;
import kr.co.oti.haebom.dto.MoveFamilyMemberDTO;
import kr.co.oti.haebom.dto.MovePreparationRequestDTO;
import kr.co.oti.haebom.dto.SimulationProgressDTO;
import kr.co.oti.haebom.mapper.SimulationFamilyMapper;
import kr.co.oti.haebom.mapper.SimulationProgressMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MoveSimulationServiceImpl implements MoveSimulationService {
	private final SimulationFamilyMapper familyMapper;
	private final SimulationProgressMapper progressMapper;

	// 가족 구성원 정보 검증
	private void validateFamilyMembers(MovePreparationRequestDTO requestdto) {

		// 1. 가족 구성원 존재 여부
		if (requestdto == null || requestdto.getFamilyMembers() == null || requestdto.getFamilyMembers().isEmpty()) {
			throw new IllegalArgumentException("가족 구성원을 입력해주세요.");
		}

		List<MoveFamilyMemberDTO> members = requestdto.getFamilyMembers();

		// 2. 신청인 수 확인
		long applicantCount = members.stream()
				.filter(member -> member != null && Boolean.TRUE.equals(member.getIsApplicant())).count();

		if (applicantCount != 1) {
			throw new IllegalArgumentException("신청인은 반드시 한 명이어야 합니다.");
		}

		// 3. 최초 세대주 수 확인
		long headCount = members.stream()
				.filter(member -> member != null && Boolean.TRUE.equals(member.getIsOriginalHead())).count();

		if (headCount != 1) {
			throw new IllegalArgumentException("세대주는 반드시 한 명이어야 합니다.");
		}
		// 4. 세대주 여부와 관계 일치 확인
		for (MoveFamilyMemberDTO member : members) {

		    if (member == null) {
		        throw new IllegalArgumentException("가족 정보가 올바르지 않습니다.");
		    }

		    boolean isHead = Boolean.TRUE.equals(member.getIsOriginalHead());
		    boolean isSelf = "SELF".equals(member.getOriginalRelationship());

		    if (isHead != isSelf) {
		        throw new IllegalArgumentException(
		                "세대주는 세대주와의 관계가 '본인'이어야 합니다."
		        );
		    }
		}
	}

	// 전입신고 0단계 가족 정보 저장 및 1단계 이동
	@Override
	@Transactional
	public void startMoveSimulation(Integer progressId, Integer memberId, MovePreparationRequestDTO requestdto) {
		// 1. 가족 정보 검증
		validateFamilyMembers(requestdto);
		// 2. 본인의 진행 이력 조회
		SimulationProgressDTO progress = progressMapper.selectProgressByIdAndMemberId(progressId, memberId);

		if (progress == null) {
			throw new IllegalArgumentException("진행 정보를 찾을 수 없습니다.");
		}
		// 3. 전입신고 0단계인지 확인하고 다음 단계 ID 조회
		Integer nextStepId = progressMapper.selectNextStepId(progress.getScenarioId(), progress.getStepId());

		if (nextStepId == null) {
			throw new IllegalArgumentException("다음 단계가 존재하지 않습니다.");
		}
		// 4. 가족 구성원 저장
		for (MoveFamilyMemberDTO member : requestdto.getFamilyMembers()) {

			SimulationFamily family = SimulationFamily.builder().progressId(progressId)
					.familyName(member.getFamilyName()).birthDate(member.getBirthDate()).gender(member.getGender())
					.isApplicant(member.getIsApplicant()).isOriginalHead(member.getIsOriginalHead())
					.originalRelationship(member.getOriginalRelationship()).build();

			familyMapper.insertFamily(family);
		}
		// 5. 기존 진행 이력을 0단계 → 1단계로 변경
		int updated = progressMapper.updateProgressStep(progressId, memberId, progress.getStepId(), nextStepId);
		if (updated != 1) {
			throw new IllegalStateException("단계 변경에 실패했습니다.");
		}
	}

}
