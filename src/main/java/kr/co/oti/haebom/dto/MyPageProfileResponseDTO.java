package kr.co.oti.haebom.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MyPageProfileResponseDTO {

	private String memberName;
	private String loginId;
	private String email;
	private LocalDate birthDate;
	private String gender;
	private LocalDateTime createdAt;
}
