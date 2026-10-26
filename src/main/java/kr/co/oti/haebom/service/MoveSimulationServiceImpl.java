package kr.co.oti.haebom.service;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.domain.SimulationFamily;
import kr.co.oti.haebom.dto.MoveFamilyMemberDTO;
import kr.co.oti.haebom.dto.MoveFamilyRequestDTO;
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
				throw new IllegalArgumentException("세대주는 세대주와의 관계가 '본인'이어야 합니다.");
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

	// 신청인 정보 조회
	@Override
	public SimulationFamily getApplicant(Integer progressId, Integer memberId) {
		// 로그인 사용자의 진행 사항이 맞는지
		SimulationProgressDTO progress = progressMapper.selectProgressByIdAndMemberId(progressId, memberId);
		if (progress == null) {
			throw new IllegalArgumentException("진행 정보를 찾을 수 없습니다.");
		}
		// 신청인 정보 조회
		SimulationFamily applicant = familyMapper.selectApplicant(progressId);

		if (applicant == null) {
			throw new IllegalArgumentException("신청인 정보를 찾을 수 없습니다.");
		}

		return applicant;
	}

	// 신청인 전화번호 수정
	@Override
	public void updateApplicantPhone(Integer progressId, Integer memberId, String phoneNum) {
		// 수정 가능한 진행사항인지 확인
		SimulationProgressDTO progress = progressMapper.selectProgressByIdAndMemberId(progressId, memberId);
		if (progress == null) {
			throw new IllegalArgumentException("진행 정보를 찾을 수 없습니다.");
		}
		if ("COMPLETED".equals(progress.getProgressStatus())) {
			throw new IllegalArgumentException("이미 완료된 진행이라 수정 불가능합니다.");
		}
		// 전화번호 확인
		if (phoneNum == null || !phoneNum.matches("^010-\\d{4}-\\d{4}$")) {
			throw new IllegalArgumentException("올바른 휴대전화번호를 입력해주세요.");
		}
		// 전화번호 수정
		int updatedCount = familyMapper.updateApplicantPhone(progressId, phoneNum);
		if (updatedCount == 0) {
			throw new IllegalStateException("신청인 휴대전화번호 수정에 실패했습니다.");
		}
	}

	// 가족 조회
	@Override
	public List<SimulationFamily> getFamily(Integer progressId, Integer memberId, String moveStatus) {
		// 로그인 사용자의 진행 사항이 맞는지
		SimulationProgressDTO progress = progressMapper.selectProgressByIdAndMemberId(progressId, memberId);
		if (progress == null) {
			throw new IllegalArgumentException("진행 정보를 찾을 수 없습니다.");
		}
		List<SimulationFamily> families = familyMapper.selectFamily(progressId);

		if (families == null) {
			throw new IllegalArgumentException("가족을 찾을 수 없습니다.");
		}

		// 필터가 없으면 전체 가족 반환
		if (moveStatus == null) {
			return families;
		}

		// 상태값 정규화
		String status = moveStatus.trim().toUpperCase(Locale.ROOT);

		// 허용된 상태값 검증
		if (!"MOVE".equals(status) && !"REMAIN".equals(status)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바르지 않은 이사 상태입니다.");
		}

		// 선택한 상태에 해당하는 가족만 반환
		return families.stream().filter(family -> status.equals(family.getMoveStatus())).collect(Collectors.toList());
	}

	// 이사가는 가족정보 및 새 세대주 정보 변경
	@Transactional
	@Override
	public void updateFamilyMove(Integer progressId, Integer memberId, MoveFamilyRequestDTO requestDTO) {

		// 1. 진행정보 소유자 확인
		SimulationProgressDTO progress = progressMapper.selectProgressByIdAndMemberId(progressId, memberId);

		if (progress == null) {
			throw new IllegalArgumentException("진행 정보를 찾을 수 없습니다.");
		}

		if ("COMPLETED".equals(progress.getProgressStatus())) {
			throw new IllegalStateException("완료된 시뮬레이션은 수정할 수 없습니다.");
		}

		// 2. DB에 등록된 가족 조회
		List<SimulationFamily> families = familyMapper.selectFamily(progressId);

		if (families.isEmpty()) {
			throw new IllegalArgumentException("가족정보가 없습니다.");
		}

		if (requestDTO == null || requestDTO.getFamilyMembers() == null) {
			throw new IllegalArgumentException("가족 이사정보가 없습니다.");
		}

		// 3. 요청 가족 목록 검증
		Map<Integer, MoveFamilyRequestDTO.FamilyMember> requested = new HashMap<>();

		for (MoveFamilyRequestDTO.FamilyMember member : requestDTO.getFamilyMembers()) {

			if (member == null || member.getFamilyId() == null) {
				throw new IllegalArgumentException("가족 ID가 올바르지 않습니다.");
			}

			if (!"MOVE".equals(member.getMoveStatus()) && !"REMAIN".equals(member.getMoveStatus())) {
				throw new IllegalArgumentException("이사 상태가 올바르지 않습니다.");
			}

			if (requested.put(member.getFamilyId(), member) != null) {
				throw new IllegalArgumentException("중복된 가족정보가 있습니다.");
			}
		}

		if (requested.size() != families.size()) {
			throw new IllegalArgumentException("전체 가족정보를 전달해야 합니다.");
		}

		for (SimulationFamily family : families) {
			if (!requested.containsKey(family.getFamilyId())) {
				throw new IllegalArgumentException("등록되지 않은 가족정보가 포함되어 있습니다.");
			}
		}

		// 4. 신청인과 기존 세대주 확인
		SimulationFamily applicant = families.stream().filter(SimulationFamily::getIsApplicant).findFirst()
				.orElseThrow(() -> new IllegalArgumentException("신청인이 없습니다."));

		SimulationFamily originalHead = families.stream().filter(SimulationFamily::getIsOriginalHead).findFirst()
				.orElseThrow(() -> new IllegalArgumentException("기존 세대주가 없습니다."));

		// 신청인은 반드시 MOVE
		if (!"MOVE".equals(requested.get(applicant.getFamilyId()).getMoveStatus())) {
			throw new IllegalArgumentException("신청인은 반드시 이사 대상이어야 합니다.");
		}

		// 5. 새 세대주가 필요한지 판단
		boolean originalHeadMoves = "MOVE".equals(requested.get(originalHead.getFamilyId()).getMoveStatus());

		boolean hasRemaining = requested.values().stream().anyMatch(member -> "REMAIN".equals(member.getMoveStatus()));

		boolean needsNewHead = originalHeadMoves && hasRemaining;

		Integer newHeadId = requestDTO.getRemainingHeadFamilyId();

		if (needsNewHead) {

			// 새 세대주는 남는 가족 중에서 선택해야 함
			if (newHeadId == null || !requested.containsKey(newHeadId)
					|| !"REMAIN".equals(requested.get(newHeadId).getMoveStatus())) {
				throw new IllegalArgumentException("남는 가족 중 새로운 세대주를 선택해야 합니다.");
			}

			// 새 세대주 연락처 검증
			String phone = requestDTO.getRemainingHeadPhoneNum();

			if (phone == null || !phone.matches("^010-\\d{4}-\\d{4}$")) {
				throw new IllegalArgumentException("새 세대주의 휴대전화번호가 올바르지 않습니다.");
			}

		} else if (newHeadId != null || requestDTO.getRemainingHeadPhoneNum() != null) {
			throw new IllegalArgumentException("새 세대주를 지정할 필요가 없습니다.");
		}

		// 6. 모든 가족의 현재 정보를 다시 계산하여 저장
		Set<String> relationCodes = Set.of("SELF", "SPOUSE", "CHILD", "FATHER", "MOTHER", "PARENT", "OTHER");

		for (SimulationFamily family : families) {

			MoveFamilyRequestDTO.FamilyMember member = requested.get(family.getFamilyId());

			boolean isMoving = "MOVE".equals(member.getMoveStatus());

			String relationship;
			boolean isHouseholdHead;

			if (!needsNewHead) {
				// 새 세대주가 필요 없다면 원본 정보로 복원
				relationship = family.getOriginalRelationship();
				isHouseholdHead = family.getIsOriginalHead();

			} else if (isMoving) {
				// 이사하는 가족은 이 단계에서 원본 관계를 유지
				relationship = family.getOriginalRelationship();
				isHouseholdHead = false;

			} else if (family.getFamilyId().equals(newHeadId)) {
				// 남는 가족 중 새 세대주
				relationship = "SELF";
				isHouseholdHead = true;

			} else {
				// 남는 다른 가족은 새 세대주와의 관계를 사용
				relationship = member.getRelationship();
				isHouseholdHead = false;

				if (!relationCodes.contains(relationship) || "SELF".equals(relationship)) {
					throw new IllegalArgumentException("남는 가족의 세대주와의 관계가 올바르지 않습니다.");
				}
			}

			// 프론트에서 보낸 관계와 세대주 여부도 검증
			if (!Objects.equals(relationship, member.getRelationship())
					|| !Objects.equals(isHouseholdHead, member.getIsHouseholdHead())) {
				throw new IllegalArgumentException("가족의 세대주 정보가 올바르지 않습니다.");
			}

			familyMapper.updateFamilyMoveState(progressId, family.getFamilyId(), member.getMoveStatus(), relationship,
					isHouseholdHead);
		}

		// 7. 새 세대주 연락처 업데이트
		if (needsNewHead) {
			familyMapper.updateFamilyPhone(progressId, newHeadId, requestDTO.getRemainingHeadPhoneNum());
		}

	}

	@Transactional
	@Override
	public void updateCurrentFamily(Integer progressId, Integer memberId, MoveFamilyRequestDTO requestDTO) {

		// 진행정보 소유자 검증
		SimulationProgressDTO progress = progressMapper.selectProgressByIdAndMemberId(progressId, memberId);

		if (progress == null) {
			throw new IllegalArgumentException("진행 정보를 찾을 수 없습니다.");
		}

		if ("COMPLETED".equals(progress.getProgressStatus())) {
			throw new IllegalStateException("완료된 시뮬레이션은 수정할 수 없습니다.");
		}

		if (requestDTO == null || requestDTO.getFamilyMembers() == null || requestDTO.getFamilyMembers().isEmpty()) {
			throw new IllegalArgumentException("저장할 가족정보가 없습니다.");
		}

		// 가족별 UPDATE
		for (MoveFamilyRequestDTO.FamilyMember member : requestDTO.getFamilyMembers()) {

			int updated = familyMapper.updateMovingFamilyHousehold(progressId, member);

			if (updated != 1) {
				throw new IllegalArgumentException("이사 대상이 아닌 가족이 포함되어 있습니다.");
			}
		}
	}

}
