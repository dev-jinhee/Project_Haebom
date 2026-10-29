(() => {
  const toast = window.Haebom ? window.Haebom.toast : null;

  // 인증 정보 (inquiries.jsp의 main 태그 dataset에서 획득)
  const mainEl = document.querySelector('main.subpage-container');
  const loginUserId = mainEl?.dataset.loginUserId ? parseInt(mainEl.dataset.loginUserId, 10) : null;
  const isLoggedIn = mainEl?.dataset.isLoggedIn === 'true';
  const isAdmin = mainEl?.dataset.isAdmin === 'true';

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

  // 페이징 및 상태 제어 변수들
  const PAGE_SIZE = 10;
  let currentPage = 1;
  let inquiryListCache = []; // 서버에서 받아온 원본 전체 문의 목록
  let currentTab = 'all'; // 'all' (전체 문의) | 'my' (내 문의 내역)
  let currentStatusFilter = ''; // '' (전체) | 'WAITING' | 'ANSWERED'
  let currentSearchKeyword = '';
  let currentViewQnaId = null; // 현재 상세 모달에서 보고 있는 문의글 ID
  let editingQnaId = null; // 수정 중인 문의글 ID (null이면 새 글 작성 모드)

  // 1. 현재 탭, 상태 필터, 검색어 조건에 맞춘 필터링 목록 구하기
  const getFilteredList = () => {
    let list = inquiryListCache;

    // 1) 탭 필터 (전체 vs 내 문의)
    if (currentTab === 'my') {
      if (!isLoggedIn || !loginUserId) return [];
      list = list.filter(item => item.memberId === loginUserId);
    }

    // 2) 상태 필터 (WAITING / ANSWERED)
    if (currentStatusFilter) {
      list = list.filter(item => item.qnaStatus === currentStatusFilter);
    }

    // 3) 검색어 필터 (제목 또는 내용)
    if (currentSearchKeyword) {
      const kw = currentSearchKeyword.toLowerCase();
      list = list.filter(item => 
        (item.qnaTitle && item.qnaTitle.toLowerCase().includes(kw)) ||
        (item.qnaContent && item.qnaContent.toLowerCase().includes(kw))
      );
    }

    return list;
  };

  // 2. 상단 요약 바 및 탭 뱃지 카운트 갱신
  const updateSummaryCounters = () => {
    // 탭 뱃지 개수 업데이트
    const allCount = inquiryListCache.length;
    const myCount = (isLoggedIn && loginUserId)
      ? inquiryListCache.filter(item => item.memberId === loginUserId).length
      : 0;

    const badgeAll = document.getElementById('badgeAllCount');
    const badgeMy = document.getElementById('badgeMyCount');
    if (badgeAll) badgeAll.textContent = allCount;
    if (badgeMy) badgeMy.textContent = myCount;

    // 배너 뷰 전환: 전체 문의 탭 = 안내 배너, 내 문의 탭 = 나의 문의 진행 현황 통계
    const bannerInfo = document.getElementById('inquiryBannerInfo');
    const bannerStats = document.getElementById('inquiryBannerStats');

    if (currentTab === 'all') {
      if (bannerInfo) {
        bannerInfo.classList.remove('d-none');
        bannerInfo.classList.add('d-flex');
      }
      if (bannerStats) {
        bannerStats.classList.add('d-none');
        bannerStats.classList.remove('d-flex');
      }
    } else {
      if (bannerInfo) {
        bannerInfo.classList.add('d-none');
        bannerInfo.classList.remove('d-flex');
      }
      if (bannerStats) {
        bannerStats.classList.remove('d-none');
        bannerStats.classList.add('d-flex');
      }
    }

    // 내 문의 현황 수치 업데이트 (내 문의 탭용)
    const myList = (isLoggedIn && loginUserId)
      ? inquiryListCache.filter(item => item.memberId === loginUserId)
      : [];

    const totalEl = document.querySelector('[data-inquiry-total]');
    const waitingEl = document.querySelector('[data-inquiry-waiting]');
    const answeredEl = document.querySelector('[data-inquiry-answered]');

    if (!isLoggedIn) {
      if (totalEl) totalEl.textContent = '-건';
      if (waitingEl) waitingEl.textContent = '-건';
      if (answeredEl) answeredEl.textContent = '-건';
    } else {
      const total = myList.length;
      const waiting = myList.filter(i => i.qnaStatus === 'WAITING').length;
      const answered = myList.filter(i => i.qnaStatus === 'ANSWERED').length;

      if (totalEl) totalEl.textContent = `${total}건`;
      if (waitingEl) waitingEl.textContent = `${waiting}건`;
      if (answeredEl) answeredEl.textContent = `${answered}건`;
    }
  };

  // 3. 서버 DB 데이터 불러오기 (GET /api/inquiries)
  const loadInquiries = async () => {
    try {
      const response = await fetch('/api/inquiries');
      if (!response.ok) throw new Error('목록 조회 실패');
      
      const list = await response.json();
      inquiryListCache = list;

      updateSummaryCounters();
      renderTableForCurrentPage();

    } catch (error) {
      console.error('문의 목록을 불러오지 못했습니다:', error);
    }
  };

  // 4. 현재 페이지 10개만 테이블에 렌더링
  const renderTableForCurrentPage = () => {
    const tbody = document.getElementById('inquiryTableBody');
    if (!tbody) return;

    // 만약 '내 문의' 탭인데 비로그인 상태일 때
    if (currentTab === 'my' && !isLoggedIn) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-5">
            <i class="bi bi-shield-lock fs-1 text-secondary d-block mb-2"></i>
            <h6 class="fw-bold text-dark mb-1">로그인이 필요한 서비스입니다</h6>
            <p class="text-muted small mb-3">내가 작성한 문의 내역을 확인하시려면 먼저 로그인해 주세요.</p>
            <a href="/login" class="btn btn-primary btn-sm rounded-pill px-4">로그인하기</a>
          </td>
        </tr>
      `;
      renderPaginationButtons(0);
      const footerSpanEl = document.querySelector('.table-footer span');
      if (footerSpanEl) footerSpanEl.textContent = '총 0건';
      return;
    }

    const filtered = getFilteredList();

    const footerSpanEl = document.querySelector('.table-footer span');
    if (footerSpanEl) footerSpanEl.textContent = `총 ${filtered.length}건`;

    // 데이터가 0건일 때 안내 화면
    if (filtered.length === 0) {
      const emptyActionBtn = isAdmin
        ? '<a href="/admin#inquiries" class="btn btn-outline-primary btn-sm rounded-pill px-4"><i class="bi bi-shield-lock-fill me-1"></i>관리자 문의 관리로 이동</a>'
        : '<button type="button" class="btn btn-outline-primary btn-sm rounded-pill px-4" data-open-inquiry>문의 작성하기</button>';

      const emptyHtml = (currentTab === 'my')
        ? `
          <i class="bi bi-chat-square-text fs-1 text-muted d-block mb-2"></i>
          <div class="fw-bold text-dark mb-1">작성하신 문의 내역이 없습니다</div>
          <p class="text-muted small mb-3">궁금한 점이 있으시다면 언제든 편하게 문의를 남겨주세요.</p>
          ${emptyActionBtn}
        `
        : `
          <i class="bi bi-inbox fs-1 d-block mb-2 text-muted"></i>
          일치하는 문의 내역이 없습니다.
        `;

      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-5 text-secondary">
            ${emptyHtml}
          </td>
        </tr>
      `;
      renderPaginationButtons(0);
      return;
    }

    // 10개씩 페이징 자르기
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const pagedList = filtered.slice(startIndex, endIndex);

    const categoryNames = {
      1: '회원·계정 문의',
      2: '시뮬레이션 문의',
      3: '오류·버그 신고',
      4: '기타 문의'
    };

    tbody.innerHTML = pagedList.map(qna => {
      const categoryText = qna.qnaCategoryName || categoryNames[qna.qnaCategoryId] || `카테고리 ${qna.qnaCategoryId}`;
      const dateText = qna.qnaCreatedAt ? String(qna.qnaCreatedAt).substring(0, 10).replace(/-/g, '.') : '';
      const isAnswered = qna.qnaStatus === 'ANSWERED';
      const statusBadge = isAnswered
        ? '<span class="badge rounded-pill text-bg-success-subtle text-success">답변 완료</span>'
        : '<span class="badge rounded-pill text-bg-warning-subtle text-warning-emphasis">답변 대기</span>';

      const isMine = (isLoggedIn && loginUserId && qna.memberId === loginUserId);
      const isAccessible = isMine || isAdmin;
      const isSecret = Boolean(qna.isSecret);

      // 비밀글 아이콘 및 뱃지
      const secretIcon = isSecret ? '<i class="bi bi-lock-fill text-secondary me-1" title="비밀글"></i>' : '';
      const secretBadge = (isSecret && isMine)
        ? '<span class="badge rounded-pill bg-secondary-subtle text-secondary ms-1" style="font-size: .65rem;">비밀글</span>'
        : '';

      // 전체 문의 탭에서 본인 글인 경우 예쁜 [내 글] 뱃지 부착
      const isMineBadge = (isMine && currentTab === 'all')
        ? '<span class="badge rounded-pill bg-primary-subtle text-primary ms-1" style="font-size: .65rem;">내 글</span>'
        : '';

      return `
        <tr>
          <td>${String(qna.qnaId).padStart(2, '0')}</td>
          <td>
            <a href="#" class="inquiry-item-link text-decoration-none fw-medium ${isSecret && !isAccessible ? 'text-secondary opacity-75' : 'text-dark'}" data-inquiry-id="${qna.qnaId}">
              ${secretIcon}${escapeHtml(qna.qnaTitle)} ${isMineBadge} ${secretBadge}
            </a>
          </td>
          <td>${categoryText}</td>
          <td>${dateText}</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');

    renderPaginationButtons(filtered.length);
  };
  
  // 5. 하단 페이지 버튼 [이전] [1] [2] [다음] 동적 생성
  const renderPaginationButtons = (totalItems) => {
    const paginationEl = document.querySelector('.pagination');
    if (!paginationEl) return;
    
    const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;
    let html = '';
    
    // [이전] 버튼
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    html += `
      <li class="page-item ${prevDisabled}">
        <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="이전 페이지">이전</a>
      </li>	
    `;
    
    // 숫자 버튼
    for (let p = 1; p <= totalPages; p++) {
      const activeClass = p === currentPage ? 'active' : '';
      html += `
        <li class="page-item ${activeClass}">
          <a class="page-link" href="#" data-page="${p}">${p}</a>
        </li>
      `;
    }
    
    // [다음] 버튼
    const nextDisabled = (currentPage === totalPages || totalItems === 0) ? 'disabled' : '';
    html += `
      <li class="page-item ${nextDisabled}">
        <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="다음 페이지">다음</a>
      </li>
    `;
    
    paginationEl.innerHTML = html;
  };
  
  // 6. 페이징 버튼 클릭 시 페이지 이동 이벤트
  document.querySelector('.pagination')?.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-page]');
    if (!link) return;
    e.preventDefault();
    
    const targetPage = parseInt(link.dataset.page, 10);
    const filtered = getFilteredList();
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
    
    if (targetPage >= 1 && targetPage <= totalPages && targetPage !== currentPage) {
      currentPage = targetPage;
      renderTableForCurrentPage();
    }
  });

  // 7. 탭 전환 버튼 클릭 이벤트 (전체 문의 vs 내 문의 내역)
  document.querySelectorAll('[data-inquiry-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.inquiryTab;
      if (tab === currentTab) return;

      currentTab = tab;
      currentPage = 1;

      // 탭 액티브 상태 변경
      document.querySelectorAll('[data-inquiry-tab]').forEach(b => {
        const isActive = b.dataset.inquiryTab === currentTab;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      updateSummaryCounters();
      renderTableForCurrentPage();
    });
  });

  // 8. 상태 필터 셀렉트박스 변경 이벤트
  document.getElementById('inquiryStatusFilter')?.addEventListener('change', (e) => {
    currentStatusFilter = e.target.value;
    currentPage = 1;
    renderTableForCurrentPage();
  });

  // 9. 검색어 실시간 입력 이벤트 (디바운스 200ms)
  let searchTimer = null;
  document.getElementById('inquirySearchInput')?.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentSearchKeyword = e.target.value.trim();
      currentPage = 1;
      renderTableForCurrentPage();
    }, 200);
  });

  // 10. 새 문의 작성 모달 열기
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-inquiry]');
    if (!btn) return;

    // 🚨 비로그인 유저 검증: 로그인 필요 알림 후 로그인 화면으로 이동!
    if (!isLoggedIn) {
      const loginConfirmMsg = '문의 작성은 로그인 후 이용하실 수 있습니다.\n로그인 페이지로 이동하시겠습니까?';
      const goToLogin = () => {
        window.location.href = '/login?redirect=' + encodeURIComponent('/inquiries');
      };

      if (typeof haebomConfirm === 'function') {
        haebomConfirm(loginConfirmMsg, goToLogin, null, '로그인 필요');
      } else if (confirm(loginConfirmMsg)) {
        goToLogin();
      }
      return;
    }

    // 🚨 관리자 유저 검증: 관리자는 직접 문의 작성 대신 관리자 페이지로 유도!
    if (isAdmin) {
      const adminGuideMsg = '관리자 계정은 문의글을 직접 작성하지 않습니다.\n관리자 페이지의 [문의 게시판]으로 이동하시겠습니까?';
      const goToAdmin = () => {
        window.location.href = '/admin#inquiries';
      };

      if (typeof haebomConfirm === 'function') {
        haebomConfirm(adminGuideMsg, goToAdmin, null, '관리자 안내');
      } else if (confirm(adminGuideMsg)) {
        goToAdmin();
      }
      return;
    }

    editingQnaId = null;
    document.getElementById('inquiryForm')?.reset();
    const secretToggle = document.getElementById('inquiryIsSecret');
    if (secretToggle) secretToggle.checked = false;

    const modalTitle = document.getElementById('inquiryModalTitle');
    const submitBtn = document.getElementById('inquirySubmitBtn');
    if (modalTitle) modalTitle.textContent = '문의 작성';
    if (submitBtn) submitBtn.textContent = '등록하기';
    openModal('#inquiryModal');
  });

  // 11. 관리자 답변 목록 불러오기 (사용자 화면용)
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

  // 12. 문의 내역 클릭 시 상세 모달 열기 (권한에 따라 수정/삭제 버튼 제어)
  document.getElementById('inquiryTableBody')?.addEventListener('click', (e) => {
    const link = e.target.closest('.inquiry-item-link');
    if (!link) return;
    e.preventDefault();

    const id = link.dataset.inquiryId;
    const data = inquiryListCache.find(item => String(item.qnaId) === String(id));
    if (!data) return;

    currentViewQnaId = data.qnaId;
    
    // 🔒 비밀글 접근 제어: 본인 글이나 관리자가 아닌 경우 상세 모달 열기 차단!
    const isMyPost = (isLoggedIn && loginUserId && (data.memberId === loginUserId));
    if (data.isSecret && !isMyPost && !isAdmin) {
      if (window.Haebom && typeof window.Haebom.toast === 'function') {
        window.Haebom.toast('🔒 비밀글은 작성자와 관리자만 열람할 수 있습니다.');
      } else if (typeof haebomAlert === 'function') {
        haebomAlert('비밀글은 작성자와 관리자만 열람할 수 있습니다.', '비밀글 안내', null, 'warn');
      } else {
        alert('비밀글은 작성자와 관리자만 열람할 수 있습니다.');
      }
      return;
    }

    document.getElementById('inquiryViewModalTitle').textContent = data.qnaTitle;
    document.getElementById('inquiryViewCategory').textContent = data.qnaCategoryName || `카테고리 ${data.qnaCategoryId}`;
    document.getElementById('inquiryViewDate').textContent = data.qnaCreatedAt ? String(data.qnaCreatedAt).substring(0, 10).replace(/-/g, '.') : '';
    document.getElementById('inquiryViewContent').textContent = data.qnaContent;

    const statusBadge = document.getElementById('inquiryViewStatus');
    const answerSection = document.getElementById('inquiryAnswerSection');

    if (data.qnaStatus === 'ANSWERED') {
      statusBadge.className = 'badge rounded-pill text-bg-success-subtle text-success';
      statusBadge.textContent = '답변 완료';
      if (answerSection) {
        answerSection.style.display = 'block';
        loadUserInquiryAnswers(data.qnaId);
      }
    } else {
      statusBadge.className = 'badge rounded-pill text-bg-warning-subtle text-warning-emphasis';
      statusBadge.textContent = '답변 대기';
      if (answerSection) answerSection.style.display = 'none';
    }

    // ⭐ 권한 제어: 내가 작성한 글인지 검증! (비로그인이나 타인 글이면 수정/삭제 숨김)
    const editBtn = document.getElementById('btnEditInquiry');
    const deleteBtn = document.getElementById('btnDeleteInquiry');

    if (isMyPost) {
      if (deleteBtn) deleteBtn.style.display = 'inline-block';
      if (editBtn) {
        // 답변 완료된 글은 수정 불가, 답변 대기일 때만 수정 가능
        editBtn.style.display = (data.qnaStatus === 'ANSWERED' ? 'none' : 'inline-block');
      }
    } else {
      // 남의 글이면 수정/삭제 버튼 완전 숨김!
      if (deleteBtn) deleteBtn.style.display = 'none';
      if (editBtn) editBtn.style.display = 'none';
    }

    openModal('#inquiryViewModal');
  });

  // 페이지 열리자마자 바로 DB 데이터 불러오기! 🚀
  loadInquiries();
  
  // 13. 문의 작성/수정 모달에서 [등록하기/수정하기] 눌렀을 때 DB로 전송
  const inquiryForm = document.getElementById('inquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        qnaCategoryId: parseInt(document.getElementById('inquiryCategory').value, 10),
        qnaTitle: document.getElementById('inquiryTitle').value.trim(),
        qnaContent: document.getElementById('inquiryBody').value.trim(),
        isSecret: document.getElementById('inquiryIsSecret')?.checked || false
      };
      
      const notify = (msg) => {
        if (window.Haebom && typeof window.Haebom.toast === 'function') {
          window.Haebom.toast(msg);
        } else if (typeof haebomAlert === 'function') {
          haebomAlert(msg);
        } else {
          alert(msg);
        }
      };

      if (!formData.qnaTitle || !formData.qnaContent) {
        if (typeof haebomWarn === 'function') {
          haebomWarn('제목과 내용을 모두 입력해주세요.', !formData.qnaTitle ? '#inquiryTitle' : '#inquiryBody');
        } else {
          notify('제목과 내용을 모두 입력해주세요.');
        }
        return;
      }
      
      const isEdit = !!editingQnaId;
      const url = isEdit ? `/api/inquiries/${editingQnaId}` : '/api/inquiries';
      const method = isEdit ? 'PUT' : 'POST';
      
      try {
		const params = new URLSearchParams(formData);
		
        const response = await fetch(url, {
          method: method,
          body: params
        });
        if (!response.ok) {
          throw new Error(isEdit ? '문의 수정에 실패했습니다.' : '문의 등록에 실패했습니다.');
        }
        notify(isEdit ? '문의가 성공적으로 수정되었습니다!' : '문의가 성공적으로 등록되었습니다!');
        
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
        notify(isEdit ? '수정 중 오류가 발생했습니다.' : '등록 중 오류가 발생했습니다.');
      }
    });
  }
  
  // 14. 상세 모달에서 [수정] 버튼 눌렀을 때
  document.getElementById('btnEditInquiry')?.addEventListener('click', () => {
    if (!currentViewQnaId) return;

    const data = inquiryListCache.find(item => String(item.qnaId) === String(currentViewQnaId));
    if (!data) return;

    closeModal('#inquiryViewModal');

    editingQnaId = data.qnaId;

    document.getElementById('inquiryCategory').value = data.qnaCategoryId;
    document.getElementById('inquiryTitle').value = data.qnaTitle;
    document.getElementById('inquiryBody').value = data.qnaContent;
    const secretToggle = document.getElementById('inquiryIsSecret');
    if (secretToggle) secretToggle.checked = Boolean(data.isSecret);

    const modalTitle = document.getElementById('inquiryModalTitle');
    const submitBtn = document.getElementById('inquirySubmitBtn');
    if (modalTitle) modalTitle.textContent = '문의 수정';
    if (submitBtn) submitBtn.textContent = '수정하기';

    openModal('#inquiryModal');
  });

  // 15. 상세 모달에서 [삭제] 버튼 눌렀을 때 (공통 haebomConfirm 모달 적용)
  document.getElementById('btnDeleteInquiry')?.addEventListener('click', () => {
    if (!currentViewQnaId) return;

    const notify = (msg) => {
      if (window.Haebom && typeof window.Haebom.toast === 'function') {
        window.Haebom.toast(msg);
      } else if (typeof haebomAlert === 'function') {
        haebomAlert(msg);
      } else {
        alert(msg);
      }
    };

    const doDelete = async () => {
      try {
        const response = await fetch(`/api/inquiries/${currentViewQnaId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('삭제 실패');
        }

        notify('문의글이 삭제되었습니다.');
        closeModal('#inquiryViewModal');
        loadInquiries();

      } catch (error) {
        console.error('삭제 오류:', error);
        notify('삭제 중 오류가 발생했습니다.');
      }
    };

    if (typeof haebomConfirm === 'function') {
      haebomConfirm('정말 이 문의글을 삭제하시겠습니까?\n삭제된 문의는 복구할 수 없습니다.', doDelete, null, '문의 삭제');
    } else if (confirm('정말 이 문의글을 삭제하시겠습니까?')) {
      doDelete();
    }
  });

})();