package kr.co.oti.haebom.business.admin.mapper;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface AdminMfaMapper {
    
	@Select("SELECT secret_ciphertext FROM admin_mfa WHERE member_id = #{memberId}")
    String selectSecretByMemberId(@Param("memberId") Integer memberId);

    @Insert("""
        INSERT INTO admin_mfa (member_id, secret_ciphertext, enabled_at)
        VALUES (#{memberId}, #{secretCiphertext}, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE
            secret_ciphertext = VALUES(secret_ciphertext),
            enabled_at = CURRENT_TIMESTAMP
        """)
    int upsertSecret(@Param("memberId") Integer memberId,
                     @Param("secretCiphertext") String secretCiphertext);

    @Delete("DELETE FROM admin_mfa WHERE member_id = #{memberId}")
    int deleteByMemberId(@Param("memberId") Integer memberId);
}
