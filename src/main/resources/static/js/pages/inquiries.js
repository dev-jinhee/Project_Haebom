(() => {
  const toast = window.Haebom ? window.Haebom.toast : null;

  const openModal = (selector) => {
    const node = document.querySelector(selector);
    if (node && window.bootstrap) {
      bootstrap.Modal.getOrCreateInstance(node).show();
    }
  };

  // 1. 문의 작성 모달 열기
  document.querySelector('[data-open-inquiry]')?.addEventListener('click', () => {
    openModal('#inquiryModal');
  });

  // 2. 문의 작성 폼 임시 제출 인터랙션
  document.getElementById('inquiryForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const modalEl = document.getElementById('inquiryModal');
    if (modalEl && window.bootstrap) {
      bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    }
    event.currentTarget.reset();

    if (typeof haebomAlert === 'function') {
      haebomAlert('문의가 정상적으로 등록되었습니다!\n(백엔드 연동 시 실제 DB에 안전하게 저장됩니다)', '문의 접수 완료', null, 'success');
    } else if (toast) {
      toast('문의가 등록되었습니다.');
    }
  });

  // 3. 문의 내역 클릭 시 상세 보기 모달 인터랙션 (문의 내용 + 관리자 답변)
  const demoDetails = {
    '2': {
      title: '저장한 연습을 다시 이어가고 싶어요',
      category: '시뮬레이션 문의',
      date: '2026.10.13',
      status: 'WAITING',
      statusText: '답변 대기',
      content: '전입신고 3단계까지 진행하고 임시 저장했는데, 마이페이지나 홈에서 다시 이어서 연습하려면 어떻게 해야 하나요?',
      answer: null
    },
    '1': {
      title: '큰 글씨 설정에서도 화면 읽기를 사용할 수 있나요?',
      category: '기타 문의',
      date: '2026.10.09',
      status: 'ANSWERED',
      statusText: '답변 완료',
      content: '시각 보조 기능 중 큰 글씨 설정과 브라우저 화면 낭독 프로그램(스크린 리더)을 함께 사용할 때 호환이 잘 되는지 궁금합니다.',
      answer: '안녕하세요, 해봄 운영팀입니다.\n\n해봄 서비스의 모든 페이지는 웹 접근성 표준 규격을 준수하여 제작되었습니다. 큰 글씨 모드를 활성화한 상태에서도 스크린 리더(NVDA, 센스리더 등)가 정상적으로 텍스트를 읽어드리니 안심하고 이용하셔도 좋습니다.\n\n추가로 궁금한 점이 있으시면 언제든 문의 남겨주세요. 감사합니다.',
      answerDate: '2026.10.10'
    }
  };

  document.querySelectorAll('.inquiry-item-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.dataset.inquiryId;
      const data = demoDetails[id];
      if (!data) return;

      document.getElementById('inquiryViewModalTitle').textContent = data.title;
      document.getElementById('inquiryViewCategory').textContent = data.category;
      document.getElementById('inquiryViewDate').textContent = data.date;
      document.getElementById('inquiryViewContent').textContent = data.content;

      const statusBadge = document.getElementById('inquiryViewStatus');
      const answerSection = document.getElementById('inquiryAnswerSection');

      if (data.status === 'ANSWERED') {
        statusBadge.className = 'badge rounded-pill text-bg-success-subtle text-success';
        statusBadge.textContent = '답변 완료';
        answerSection.style.display = 'block';
        document.getElementById('inquiryAnswerContent').textContent = data.answer;
        document.getElementById('inquiryAnswerDate').textContent = data.answerDate || '';
      } else {
        statusBadge.className = 'badge rounded-pill text-bg-warning-subtle text-warning-emphasis';
        statusBadge.textContent = '답변 대기';
        answerSection.style.display = 'none';
      }

      openModal('#inquiryViewModal');
    });
  });
})();
