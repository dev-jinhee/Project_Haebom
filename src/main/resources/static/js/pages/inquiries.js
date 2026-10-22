(() => {
  const toast = window.Haebom ? window.Haebom.toast : null;

  // 모달 열기 유틸
  const openModal = (selector) => {
    const node = document.querySelector(selector);
    if (node && window.bootstrap) {
      bootstrap.Modal.getOrCreateInstance(node).show();
    }
  };
  
  // 모달 닫기 유틸
  const closeModal = (selector) => {
    const node = document.querySelector(selector);
    if (node && window.bootstrap) {
      const modalInstance = bootstrap.Modal.getInstance(node);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  };

  // HTML 특수문자 치환 (보안용)
  const escapeHtml = (str) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // 페이징 제어 변수들 (10씩!)
  const PAGE_SIZE = 10; // 한 페이지당 보여줄 문의글 개수
  let currentPage = 1; // 현재 보고 있는 페이지 번호
  let inquiryListCache = []; // 서버에서 받아온 전체 문의글 배열
  let currentViewQnaId = null; // 현재 상세 모달에서 보고 있는 문의글 ID 저장용
  let editingQnaId = null; // 수정 중인 문의글 ID (null이면 새 글 작성 모드)

  // 1. 진짜 DB 데이터 가져오기 (GET /api/inquiries)
  const loadInquiries = async () => {
    try {
      const response = await fetch('/api/inquiries');
      if (!response.ok) throw new Error('목록 조회 실패');
      
      const list = await response.json();
      inquiryListCache = list;

      // 진짜 데이터로 요약 바 3개 숫자 계산하기! (사진 속 영역)
      const totalCount = list.length;
      const waitingCount = list.filter(item => item.qnaStatus === 'WAITING').length;
      const answeredCount = list.filter(item => item.qnaStatus === 'ANSWERED').length;

      // 화면에 숫자 반영하기
      const totalEl = document.querySelector('[data-inquiry-total]');
      const waitingEl = document.querySelector('[data-inquiry-waiting]');
      const answeredEl = document.querySelector('[data-inquiry-answered]');
      const footerSpanEl = document.querySelector('.table-footer span');

      if (totalEl) totalEl.textContent = `${totalCount}건`;
      if (waitingEl) waitingEl.textContent = `${waitingCount}건`;
      if (answeredEl) answeredEl.textContent = `${answeredCount}건`;
      if (footerSpanEl) footerSpanEl.textContent = `총 ${totalCount}건`;

      // 첫 페이지(1페이지) 10개만 테이블에 그리기!
      renderTableForCurrentPage();

    } catch (error) {
      console.error('문의 목록을 불러오지 못했습니다:', error);
    }
  };

  // 2. 현재 페이지 10 개만 테이블에 쏙 렌더링하기!
    const renderTableForCurrentPage = () => {
    const tbody = document.getElementById('inquiryTableBody');
    if (!tbody) return;

    // 데이터가 0건일 때: 빈 화면 안내
    if (!inquiryListCache || inquiryListCache.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-5 text-secondary">
            <i class="bi bi-inbox fs-1 d-block mb-2 text-muted"></i>
            등록된 문의 내역이 없습니다.
          </td>
        </tr>
      `;
      renderPaginationButtons(0);
      return;
    }
    
    // 10개씩 자르기!!
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const pagedList = inquiryListCache.slice(startIndex, endIndex);

    const categoryNames = {
      1: '회원·계정 문의',
      2: '시뮬레이션 문의',
      3: '오류·버그 신고',
      4: '기타 문의'
    };

    // 데이터가 있을 때: 진짜 DB 글 목록 10개씩!!
    tbody.innerHTML = pagedList.map(qna => {
      const categoryText = qna.qnaCategoryName || categoryNames[qna.qnaCategoryId] || `카테고리 ${qna.qnaCategoryId}`;
      const dateText = qna.qnaCreatedAt ? String(qna.qnaCreatedAt).substring(0, 10).replace(/-/g, '.') : '';
      const isAnswered = qna.qnaStatus === 'ANSWERED';
      const statusBadge = isAnswered
        ? '<span class="badge rounded-pill text-bg-success-subtle text-success">답변 완료</span>'
        : '<span class="badge rounded-pill text-bg-warning-subtle text-warning-emphasis">답변 대기</span>';

      return `
        <tr>
          <td>${String(qna.qnaId).padStart(2, '0')}</td>
          <td>
            <a href="#" class="inquiry-item-link text-decoration-none fw-medium text-dark" data-inquiry-id="${qna.qnaId}">
              ${escapeHtml(qna.qnaTitle)}
            </a>
          </td>
          <td>${categoryText}</td>
          <td>${dateText}</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');
    
    // 하단 [이전] [1] [2] [다음] 버튼 동적 생성!
    renderPaginationButtons(inquiryListCache.length);
  };
  
  // 3. 하단 페이지 버튼 [이전] [1] [2] [다음] 동적 생성 실전?!
  const renderPaginationButtons = (totalItems) => {
	const paginationEl = document.querySelector('.pagination');
	if (!paginationEl) return;
	
	// 총 페이지 수 계산 (예: 15개 글 -> 2페이지)
	const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;
	
	let html = '';
	
	// [이전] 버튼 (1페이지면 비활성화)
	const prevDisabled = currentPage === 1 ? 'disabled' : '';
	html += `
		<li class="page-item ${prevDisabled}">
			<a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="이전 페이지">이전</a>
		</li>	
	`;
	
	// [1], [2], [3] ... 숫자 버튼 생성
	for (let p = 1; p <= totalPages; p++) {
		const activeClass = p === currentPage ? 'active' : '';
		html += `
			<li class="page-item ${activeClass}">
				<a class="page-link" href="#" data-page="${p}">${p}</a>
			</li>
		`;
	}
	
	// [다음] 버튼 (마지막 페이지면 비활성화)
	const nextDisabled = currentPage === totalPages ? 'disabled' : '';
	html += `
		<li class="page-item ${nextDisabled}">
			<a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="다음 페이지">다음</a>
		</li>
	`;
	
	paginationEl.innerHTML = html;
  };
  
  // 4. 페이징 버튼 클릭 시 페이지 이동 이벤트
  document.querySelector('.pagination')?.addEventListener('click', (e) => {
	const link = e.target.closest('a[data-page]');
	if (!link) return;
	e.preventDefault();
	
	const targetPage = parseInt(link.dataset.page,10);
	const totalPages = Math.ceil(inquiryListCache.length / PAGE_SIZE) || 1;
	
	// 유효한 페이지 번호일 때만 페이지 교체!
	if (targetPage >= 1 && targetPage <= totalPages && targetPage !== currentPage){
		currentPage = targetPage;
		renderTableForCurrentPage(); // 새 페이지 10개 다시 렌더!
	}
  });

  // 5. 새 문의 작성 모달 열기 (작성 모드로 초기화)
  document.querySelector('[data-open-inquiry]')?.addEventListener('click', () => {
    editingQnaId = null;
    document.getElementById('inquiryForm')?.reset();
    const modalTitle = document.getElementById('inquiryModalTitle');
    const submitBtn = document.getElementById('inquirySubmitBtn');
    if (modalTitle) modalTitle.textContent = '문의 작성';
    if (submitBtn) submitBtn.textContent = '등록하기';
    openModal('#inquiryModal');
  });

  // 관리자 답변 목록 불러오기 (사용자 화면용)
  const loadUserInquiryAnswers = async (qnaId) => {
    const listEl = document.getElementById('inquiryAnswerList');
    if (!listEl) return;
    listEl.innerHTML = '<div class="p-3 text-secondary small bg-light rounded-3">답변을 불러오는 중입니다...</div>';

    try {
      const res = await fetch(`/api/inquiries/${qnaId}/answers`);
      if (!res.ok) throw new Error('답변 목록 로드 실패');
      const answers = await res.json();

      if (!answers || answers.length === 0) {
        listEl.innerHTML = '<div class="p-3 text-secondary small bg-light rounded-3">등록된 답변이 없습니다.</div>';
        return;
      }

      listEl.innerHTML = answers.map(a => {
        const dateStr = a.qnaAnswerCreatedAt ? String(a.qnaAnswerCreatedAt).replace('T', ' ').substring(0, 19) : '';
        const responder = a.responderName || a.responderLoginId || '관리자';
        return `
          <div class="p-3 rounded-3" style="background-color: #f0fdf4; border: 1px solid #bbf7d0;">
            <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-success-subtle">
              <span class="fw-bold text-success-emphasis small">
                <i class="bi bi-shield-check me-1"></i>해봄 운영팀 (${escapeHtml(responder)})
              </span>
              <small class="text-secondary">${dateStr}</small>
            </div>
            <p class="mb-0 text-dark small" style="white-space: pre-line; line-height: 1.6;">
              ${escapeHtml(a.qnaAnswerContent)}
            </p>
          </div>
        `;
      }).join('');
    } catch (e) {
      console.error(e);
      listEl.innerHTML = '<div class="p-3 text-danger small bg-light rounded-3">답변을 불러오지 못했습니다.</div>';
    }
  };

  // 6. 문의 내역 클릭 시 상세 모달 열기 (진짜 데이터 바인딩)
  document.getElementById('inquiryTableBody')?.addEventListener('click', (e) => {
    const link = e.target.closest('.inquiry-item-link');
    if (!link) return;
    e.preventDefault();

    const id = link.dataset.inquiryId;
    const data = inquiryListCache.find(item => String(item.qnaId) === String(id));
    if (!data) return;

	// 현재 모달에서 보고 있는 글 번호 저장!
    currentViewQnaId = data.qnaId;
    
    document.getElementById('inquiryViewModalTitle').textContent = data.qnaTitle;
    document.getElementById('inquiryViewCategory').textContent = data.qnaCategoryName || `카테고리 ${data.qnaCategoryId}`;
    document.getElementById('inquiryViewDate').textContent = data.qnaCreatedAt ? String(data.qnaCreatedAt).substring(0, 10).replace(/-/g, '.') : '';
    document.getElementById('inquiryViewContent').textContent = data.qnaContent;

    const statusBadge = document.getElementById('inquiryViewStatus');
    const answerSection = document.getElementById('inquiryAnswerSection');

    const editBtn = document.getElementById('btnEditInquiry');
    if (data.qnaStatus === 'ANSWERED') {
      statusBadge.className = 'badge rounded-pill text-bg-success-subtle text-success';
      statusBadge.textContent = '답변 완료';
      if (answerSection) {
        answerSection.style.display = 'block';
        loadUserInquiryAnswers(data.qnaId);
      }
      if (editBtn) editBtn.style.display = 'none'; // 답변 완료된 글은 수정 불가
    } else {
      statusBadge.className = 'badge rounded-pill text-bg-warning-subtle text-warning-emphasis';
      statusBadge.textContent = '답변 대기';
      if (answerSection) answerSection.style.display = 'none';
      if (editBtn) editBtn.style.display = 'inline-block'; // 답변 대기 글만 수정 가능
    }

    openModal('#inquiryViewModal');
  });

  // 페이지 열리자마자 바로 DB 데이터 불러오기! 🚀
  loadInquiries();
  
  // 7. 문의 작성/수정 모달에서 [등록하기/수정하기] 눌렀을 때 DB로 전송!
  const inquiryForm = document.getElementById('inquiryForm');
  if (inquiryForm){
	inquiryForm.addEventListener('submit', async (e) => {
		e.preventDefault(); // 새로고침 방지
		
		const formData = {
			qnaCategoryId: parseInt(document.getElementById('inquiryCategory').value, 10),
			qnaTitle: document.getElementById('inquiryTitle').value.trim(),
			qnaContent: document.getElementById('inquiryBody').value.trim()
		};
		
		if (!formData.qnaTitle || !formData.qnaContent) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
      }
      
      const isEdit = !!editingQnaId;
      const url = isEdit ? `/api/inquiries/${editingQnaId}` : '/api/inquiries';
      const method = isEdit ? 'PUT' : 'POST';
      
      try {
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        if (!response.ok) {
          throw new Error(isEdit ? '문의 수정에 실패했습니다.' : '문의 등록에 실패했습니다.');
        }
        alert(isEdit ? '문의가 성공적으로 수정되었습니다!' : '문의가 성공적으로 등록되었습니다!');
        
        // 폼 초기화 및 모달 닫기
        inquiryForm.reset();
        editingQnaId = null;
        document.getElementById('inquiryModalTitle').textContent = '문의 작성';
        const submitBtn = document.getElementById('inquirySubmitBtn');
        if (submitBtn) submitBtn.textContent = '등록하기';
        
        closeModal('#inquiryModal');
        // 목록 다시 불러와서 즉시 갱신! 🚀
        loadInquiries();
      } catch (error) {
        console.error('요청 실패:', error);
        alert(isEdit ? '수정 중 오류가 발생했습니다.' : '등록 중 오류가 발생했습니다.');
      }
	});
  }
  
    // 8. 상세 모달에서 [수정] 버튼 눌렀을 때
  document.getElementById('btnEditInquiry')?.addEventListener('click', () => {
    if (!currentViewQnaId) return;

    const data = inquiryListCache.find(item => String(item.qnaId) === String(currentViewQnaId));
    if (!data) return;

    // 상세 모달 닫기
    closeModal('#inquiryViewModal');

    // 수정 모드로 설정
    editingQnaId = data.qnaId;

    // 기존 데이터 폼에 채우기
    document.getElementById('inquiryCategory').value = data.qnaCategoryId;
    document.getElementById('inquiryTitle').value = data.qnaTitle;
    document.getElementById('inquiryBody').value = data.qnaContent;

    // 모달 타이틀과 버튼 텍스트를 "수정"으로 변경
    const modalTitle = document.getElementById('inquiryModalTitle');
    const submitBtn = document.getElementById('inquirySubmitBtn');
    if (modalTitle) modalTitle.textContent = '문의 수정';
    if (submitBtn) submitBtn.textContent = '수정하기';

    // 작성/수정 모달 열기!
    openModal('#inquiryModal');
  });

  // 9. 상세 모달에서 [삭제] 버튼 눌렀을 때
  document.getElementById('btnDeleteInquiry')?.addEventListener('click', async () => {
    if (!currentViewQnaId) return;

    if (!confirm('정말 이 문의글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/inquiries/${currentViewQnaId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('삭제 실패');
      }

      alert('문의글이 삭제되었습니다.');
      closeModal('#inquiryViewModal'); // 상세 모달 닫기
      loadInquiries(); // 목록 & 숫자 카운트 즉시 갱신! 🚀

    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  });

})();