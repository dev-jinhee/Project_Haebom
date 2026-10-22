<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>문의 게시판 | 해봄</title>
    <!-- Bootstrap 5.3 & Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css" rel="stylesheet">
    <!-- 해봄 공통 & 페이지 전용 스타일시트 (통합 common.css 단 1개 사용) -->
    <link href="${pageContext.request.contextPath}/css/common.css" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/pages/inquiries.css" rel="stylesheet">
</head>
<body>

    <!-- 1. 공통 헤더 include -->
    <jsp:include page="/WEB-INF/views/common/header.jsp" />

    <!-- 2. 문의 게시판 본문 컨텐츠 영역 -->
    <main class="container subpage-container flex-grow-1">
        
        <!-- 상단 헤딩 & 브레드크럼 -->
        <div class="subpage-heading">
            <div class="breadcrumb-line">
                <a href="${pageContext.request.contextPath}/">홈</a>
                <i class="bi bi-chevron-right"></i>
                <span>문의 게시판</span>
            </div>
            <h1>무엇이 궁금하신가요?</h1>
            <p>서비스 이용과 시뮬레이션에 관한 질문을 남겨주세요.</p>
        </div>

        <!-- 내 문의 현황 요약 카드 & 문의 작성 버튼 -->
        <div class="inquiry-summary">
            <div>
                <i class="bi bi-chat-left-text"></i>
                <span>내 문의<strong data-inquiry-total>-건</strong></span>
            </div>
            <div>
                <i class="bi bi-hourglass-split"></i>
                <span>답변 대기<strong data-inquiry-waiting>-건</strong></span>
            </div>
            <div>
                <i class="bi bi-check-circle"></i>
                <span>답변 완료<strong data-inquiry-answered>-건</strong></span>
            </div>
            <button type="button" class="btn btn-primary rounded-pill" data-open-inquiry>
                <i class="bi bi-pencil-square me-1"></i>문의 작성
            </button>
        </div>

        <!-- 내 문의 내역 패널 -->
        <section class="content-panel mt-4" aria-labelledby="inquiryHistoryTitle">
            <div class="panel-heading">
                <div>
                    <h2 id="inquiryHistoryTitle">내 문의 내역</h2>
                </div>
                <div class="d-flex gap-2">
                    <!-- 상태 필터 -->
                    <select class="form-select form-select-sm" id="inquiryStatusFilter" aria-label="문의 상태 필터">
                        <option value="">전체 상태</option>
                        <option value="WAITING">답변 대기</option>
                        <option value="ANSWERED">답변 완료</option>
                    </select>
                    <!-- 검색창 -->
                    <div class="input-group input-group-sm inquiry-search">
                        <span class="input-group-text"><i class="bi bi-search"></i></span>
                        <input type="text" class="form-control" id="inquirySearchInput" placeholder="문의 검색" aria-label="문의 검색">
                    </div>
                </div>
            </div>

            <!-- 문의 목록 테이블 -->
            <div class="table-responsive">
                <table class="table align-middle inquiry-table">
                    <thead>
                        <tr>
                            <th scope="col" style="width: 70px;">번호</th>
                            <th scope="col">문의 내용</th>
                            <th scope="col" style="width: 150px;">분류</th>
                            <th scope="col" style="width: 120px;">등록일</th>
                            <th scope="col" style="width: 110px;">상태</th>
                        </tr>
                    </thead>
                    <tbody id="inquiryTableBody">
					    <tr>
					        <td colspan="5" class="text-center py-5 text-secondary">
					            <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
					            문의 내역을 불러오는 중입니다...
					        </td>
					    </tr>
					</tbody>
                </table>
            </div>

            <!-- 테이블 하단 (총 개수 및 페이지네이션) -->
            <div class="table-footer">
                <span>총 -건</span>
                <nav aria-label="문의 페이지">
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item active"><a class="page-link" href="#">1</a></li>
                        <li class="page-item disabled"><a class="page-link" href="#">다음</a></li>
                    </ul>
                </nav>
            </div>
        </section>

        <!-- 자주 묻는 질문 (FAQ) 아코디언 패널 -->
        <div class="faq-panel">
            <div>
                <h2>자주 묻는 질문</h2>
            </div>
            <details>
                <summary>시뮬레이션을 완료하면 실제 민원이 접수되나요?</summary>
                <p>아니요. 해봄은 학습 및 체험용 시뮬레이션 서비스로, 실제 공공기관이나 정부24 시스템에 데이터가 전송되지 않습니다. 안심하고 연습해 보세요.</p>
            </details>
            <details>
                <summary>작성한 문서나 개인정보가 서버에 저장되나요?</summary>
                <p>시뮬레이션 과정에서 입력하신 가상 정보는 연습 종료 시 안전하게 초기화되며, 실제 개인정보는 보관되지 않습니다.</p>
            </details>
            <details>
                <summary>답변은 보통 언제 등록되나요?</summary>
                <p>문의 접수 후 영업일 기준 1~2일 내에 관리자 답변이 등록됩니다. 등록된 답변은 본 페이지 '내 문의 내역'에서 언제든 확인하실 수 있습니다.</p>
            </details>
        </div>

    </main>

    <!-- [모달 1] 문의 작성 모달 (Bootstrap 5.3) -->
    <div class="modal fade" id="inquiryModal" tabindex="-1" aria-labelledby="inquiryModalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <form class="modal-content border-0 shadow-lg rounded-4 overflow-hidden" id="inquiryForm">
                <div class="modal-header pt-4 px-4 pb-2 border-bottom-0">
                    <h2 class="modal-title fs-5 fw-bold" id="inquiryModalTitle">문의 작성</h2>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="닫기"></button>
                </div>
                <div class="modal-body px-4 py-3">
                    <!-- 카테고리 선택 -->
                    <label class="form-label fw-semibold" for="inquiryCategory">문의 유형 <span class="text-danger">*</span></label>
                    <select id="inquiryCategory" name="qnaCategoryId" class="form-select mb-3" required>
                        <option value="1">회원·계정 문의</option>
                        <option value="2">시뮬레이션 문의</option>
                        <option value="3">오류·버그 신고</option>
                        <option value="4">기타 문의</option>
                    </select>

                    <!-- 제목 입력 -->
                    <label class="form-label fw-semibold" for="inquiryTitle">제목 <span class="text-danger">*</span></label>
                    <input type="text" id="inquiryTitle" name="qnaTitle" class="form-control mb-3" placeholder="문의 제목을 입력하세요" required>

                    <!-- 내용 입력 -->
                    <label class="form-label fw-semibold" for="inquiryBody">문의 내용 <span class="text-danger">*</span></label>
                    <textarea id="inquiryBody" name="qnaContent" class="form-control" rows="5" placeholder="궁금한 내용을 자세히 적어주세요" required></textarea>
                </div>
                <div class="modal-footer px-4 pb-4 pt-2 border-top-0 d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">취소</button>
                    <button type="submit" class="btn btn-primary rounded-pill px-4" id="inquirySubmitBtn">등록하기</button>
                </div>
            </form>
        </div>
    </div>

    <!-- [모달 2] 사용자 문의 상세 확인 모달 (문의 내용 + 관리자 답변 확인용) -->
    <div class="modal fade" id="inquiryViewModal" tabindex="-1" aria-labelledby="inquiryViewModalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div class="modal-header pt-4 px-4 pb-2 border-bottom-0">
                    <div>
                        <span class="badge text-bg-primary-subtle text-primary mb-1" id="inquiryViewCategory">시뮬레이션 문의</span>
                        <h2 class="modal-title fs-5 fw-bold" id="inquiryViewModalTitle">문의 제목</h2>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="닫기"></button>
                </div>
                <div class="modal-body px-4 py-3">
                    <div class="d-flex align-items-center gap-3 text-secondary small pb-3 border-bottom mb-3">
                        <span>등록일: <strong id="inquiryViewDate">2026.10.13</strong></span>
                        <span>답변 상태: <span class="badge rounded-pill text-bg-warning-subtle text-warning-emphasis" id="inquiryViewStatus">답변 대기</span></span>
                    </div>

                    <!-- 질문 본문 -->
                    <div class="mb-4">
                        <h3 class="h6 fw-bold text-dark mb-2"><i class="bi bi-question-circle-fill text-primary me-1"></i>내 문의 내용</h3>
                        <div class="p-3 bg-light rounded-3 text-secondary" id="inquiryViewContent" style="white-space: pre-line; line-height: 1.6;">
                            문의 내용이 여기에 표시됩니다.
                        </div>
                    </div>

                    <!-- 관리자 답변 영역 -->
                    <div id="inquiryAnswerSection">
                        <h3 class="h6 fw-bold text-dark mb-2"><i class="bi bi-reply-fill text-success me-1"></i>관리자 답변</h3>
                        <div class="d-flex flex-column gap-2" id="inquiryAnswerList">
                            <!-- 답변 목록이 여기에 동적으로 추가됩니다 -->
                        </div>
                    </div>
                </div>
                <div class="modal-footer px-4 pb-4 pt-2 border-top-0 d-flex justify-content-between">
				    <%-- 왼쪽: 수정 및 삭제 버튼 --%>
				    <div class="d-flex gap-2">
				        <button type="button" class="btn btn-outline-primary rounded-pill px-3" id="btnEditInquiry">
				            <i class="bi bi-pencil-square me-1"></i>수정
				        </button>
				        <button type="button" class="btn btn-outline-danger rounded-pill px-3" id="btnDeleteInquiry">
				            <i class="bi bi-trash3 me-1"></i>삭제
				        </button>
				    </div>
				    <%-- 오른쪽: 닫기 버튼 --%>
				    <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">닫기</button>
				</div>
            </div>
        </div>
    </div>

    <!-- 3. 공통 푸터 include (푸터 + 공통 모달 + 공통 JS 포함) -->
    <jsp:include page="/WEB-INF/views/common/footer.jsp" />

    <!-- 4. 문의 게시판 전용 스크립트 -->
    <script src="${pageContext.request.contextPath}/js/pages/inquiries.js"></script>

</body>
</html>
