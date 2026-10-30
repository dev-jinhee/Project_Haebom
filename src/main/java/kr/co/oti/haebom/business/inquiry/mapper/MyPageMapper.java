package kr.co.oti.haebom.business.inquiry.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import kr.co.oti.haebom.business.inquiry.dto.MyPageCompletedScenarioDTO;
import kr.co.oti.haebom.business.inquiry.dto.MyPageInquiryItemDTO;
import kr.co.oti.haebom.business.inquiry.dto.MyPageProfileResponseDTO;

@Mapper
public interface MyPageMapper {
	
	MyPageProfileResponseDTO selectProfileByMemberId(@Param("memberId") Integer memberId);
	
	@Update("""
		UPDATE member
		SET login_id = NULL,
			password = NULL,
			email = NULL,
			member_name = NULL,
			birth_date = NULL,
			gender = NULL,
			member_status = 'WITHDRAWN',
			withdrawn_at = CURRENT_TIMESTAMP
		WHERE member_id = #{memberId}
		AND member_status = 'ACTIVE'
		AND role = 'USER'
		""")
	int withdrawMemberById(@Param("memberId") Integer memberId);
	
	@Select("""
		SELECT password
		FROM member
		WHERE member_id = #{memberId}
		AND member_status = 'ACTIVE'
		""")
	String selectActivePasswordByMemberId(@Param("memberId") Integer memberId);
	
	@Update("""
		UPDATE member
		SET password = #{encodedPassword}
		WHERE member_id = #{memberId}
		AND member_status = 'ACTIVE'
		""")
	int updatePasswordByMemberId(@Param("memberId") Integer memberId, @Param("encodedPassword") String encodedPassword);
	
	@Select("""
		SELECT
			q.qna_id AS qnaId,
			q.qna_title AS qnaTitle,
			qc.qna_category_name AS qnaCategoryName,
			q.qna_status AS qnaStatus,
			q.qna_created_at AS qnaCreatedAt
		FROM qna q
		JOIN qna_category qc ON qc.qna_category_id = q.qna_category_id
		WHERE q.member_id = #{memberId}
		AND q.is_deleted = 0
		ORDER BY q.qna_id DESC
		    """)
	List<MyPageInquiryItemDTO> selectInquiriesByMemberId(@Param("memberId") Integer memberId);
	
	@Select("""
		SELECT
	        sp.progress_id,
	        sp.scenario_id,
	        s.scenario_title,
	        c.category_name,
	        sp.completed_at
	    FROM simulation_progress sp
	    JOIN scenario s ON s.scenario_id = sp.scenario_id
	    JOIN category c ON c.category_id = s.category_id
	    WHERE sp.member_id = #{memberId}
		AND sp.progress_status = 'COMPLETED'
	    ORDER BY sp.completed_at DESC, sp.progress_id DESC
	    """)
	List<MyPageCompletedScenarioDTO> selectCompletedScenariosByMemberId(@Param("memberId") Integer memberId);
}
