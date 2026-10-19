(() => {
  const toast = window.Haebom.toast;
const stepContent = [...document.querySelectorAll('.sim-step-content[data-step]')];
  if (!stepContent.length) return;
  const headings = [
    { title: '사전 정보 입력', question: '사전 정보 입력', help: '실제 주민등록 정보는 조회할 수 없어, 신청에 필요한 정보를 연습용으로 입력해 주세요.', icon: 'bi-person-check' },
    { title: '유의사항', question: '시작하기 전에', help: '전입신고 신청 전 유의사항을 확인해 주세요.', icon: 'bi-card-checklist' },
    { title: '기본 정보', question: '기본 정보', help: '전입신고를 하는 사람의 기본 정보를 확인합니다.', icon: 'bi-person-vcard' },
    { title: '이전 주소', question: '이사 전 주소', help: '이사하기 전 거주했던 주소를 확인합니다.', icon: 'bi-house' },
    { title: '현재 주소', question: '현재 거주지 정보', help: '이사한 후 거주할 주소와 세대 구성을 확인합니다.', icon: 'bi-geo-alt' },
    { title: '결과', question: '연습 결과', help: '연습을 마쳤습니다. 실제 신청 전 확인할 내용을 살펴보세요.', icon: 'bi-clipboard2-check' }
  ];
  const flowVersion = 7;
  let savedProgress = {};
  try { savedProgress = JSON.parse(localStorage.getItem('ongyeol-sim-saved') || '{}'); } catch (_) { savedProgress = {}; }
  if (savedProgress.version !== flowVersion) {
    localStorage.removeItem('ongyeol-sim-saved');
    localStorage.removeItem('ongyeol-last-scenario-progress');
    savedProgress = {};
  }
  const peopleBody = document.getElementById('householdPeopleBody');
  const personRowTemplate = document.getElementById('householdPersonRowTemplate');
  let personRowSequence = 0;
  const syncRemovePersonButton = () => {
    const removeButton = document.getElementById('removeHouseholdPerson');
    if (removeButton) removeButton.disabled = !peopleBody?.querySelector('[data-person-row]:not([data-person-id="applicant"])');
  };
  const applyPersonData = (row, person = {}) => {
    const mover = row.querySelector('input[name="movingPeople"]');
    const head = row.querySelector('input[name="householdHead"]');
    const relation = row.querySelector('select[name="householdRelation"]');
    const name = row.querySelector('[name="personName"]');
    const birthdate = row.querySelector('[name="personBirthdate"]');
    const gender = row.querySelector('[name="personGender"]');
    const id = person.id || row.dataset.personId || `member-${Date.now()}-${++personRowSequence}`;
    row.dataset.personId = id;
    if (mover) { mover.value = id; mover.checked = Boolean(person.moving); }
    if (head) { head.value = id; head.checked = Boolean(person.head); }
    if (relation) relation.value = person.relation || '';
    if (name) name.value = person.name || '';
    if (birthdate) birthdate.value = person.birthdate || '';
    if (gender) gender.value = person.gender || '';
    return row;
  };
  const addHouseholdPersonRow = (person = {}) => {
    if (!peopleBody || !personRowTemplate) return null;
    const row = personRowTemplate.content.firstElementChild.cloneNode(true);
    applyPersonData(row, person);
    peopleBody.append(row);
    return row;
  };
  if (savedProgress.address && document.getElementById('newAddress')) document.getElementById('newAddress').value = savedProgress.address;
  if (savedProgress.household) {
    const savedHousehold = document.querySelector(`input[name="household"][value="${savedProgress.household}"]`);
    if (savedHousehold) savedHousehold.checked = true;
  }
  if (Array.isArray(savedProgress.people) && savedProgress.people.length) {
    const applicantRow = peopleBody?.querySelector('[data-person-id="applicant"]');
    const savedApplicant = savedProgress.people.find((person) => person.id === 'applicant');
    if (applicantRow && savedApplicant) applyPersonData(applicantRow, {
      ...savedApplicant,
      name: savedApplicant.name || '김민지',
      birthdate: savedApplicant.birthdate || '2000-01-01',
      gender: savedApplicant.gender || '여'
    });
    savedProgress.people.filter((person) => person.id !== 'applicant').forEach((person) => addHouseholdPersonRow(person));
  }
  syncRemovePersonButton();
  let currentStep = 0;
  const stepProgress = document.getElementById('stepProgress');
  const progressBar = stepProgress?.closest('.progress');
  const stepCurrent = document.getElementById('stepCurrent');
  const stepTotal = document.getElementById('stepTotal');
  const stepTitle = document.getElementById('stepTitle');
  const currentQuestion = document.getElementById('currentQuestion');
  const questionHelp = document.getElementById('questionHelp');
  const questionIcon = document.getElementById('questionIcon');
  const questionEyebrow = document.getElementById('questionEyebrow');
  const prevButton = document.getElementById('prevStep');
  const nextButton = document.getElementById('nextStep');
  const saveArea = document.querySelector('.sim-save-area');
  const validation = document.getElementById('validationMessage');
  const validationText = validation?.querySelector('span');
  const navLabels = [...document.querySelectorAll('.step-labels span')];
  const getPersonName = (row) => row?.querySelector('[data-person-name]')?.value.trim() || '';
  const renderHouseholdHeadSummary = () => {
    const selected = document.querySelector('input[name="householdHead"]:checked');
    const selectedName = getPersonName(selected?.closest('tr')) || '선택된 세대주가 없습니다.';
    document.querySelectorAll('[data-household-head-summary]').forEach((node) => { node.textContent = selectedName; });
  };
  const renderMovingPeopleSummary = () => {
    const names = [...document.querySelectorAll('input[name="movingPeople"]:checked')]
      .map((input) => getPersonName(input.closest('tr')) || '이름 입력 중');
    document.querySelectorAll('[data-moving-people-summary]').forEach((node) => {
      node.textContent = names.length ? names.join(', ') : '선택된 사람이 없습니다.';
    });
  };
  renderHouseholdHeadSummary();
  renderMovingPeopleSummary();
  const clearPracticeInputs = () => {
    peopleBody?.querySelectorAll('[data-person-row]:not([data-person-id="applicant"])').forEach((row) => row.remove());
    syncRemovePersonButton();
    document.querySelectorAll('input[name="household"], input[name="householdHead"], input[name="movingPeople"], input[name="moveReason"], input[name="dataConsent"], input[name="extraService"], #contactConsent').forEach((input) => { input.checked = false; });
    document.querySelectorAll('#phoneFirst, #phoneMiddle, #phoneLast, #detailAddress, #buildingMainNumber, #buildingSubNumber, #newAddress, #householdName, #householdBirthdate, #householdGender').forEach((input) => { input.value = ''; });
    const otherReason = document.getElementById('otherReason');
    if (otherReason) { otherReason.disabled = true; otherReason.value = ''; }
    previousAddressResult?.classList.add('d-none');
    previousAddressConsent?.classList.add('d-none');
    if (previousAddressCity) previousAddressCity.value = '';
    if (previousAddressDistrict) {
      previousAddressDistrict.replaceChildren(new Option('시군구선택', ''));
      previousAddressDistrict.disabled = true;
    }
    renderHouseholdHeadSummary();
    renderMovingPeopleSummary();
  };
  const saveProgress = () => {
    const percent = Math.round((currentStep / (stepContent.length - 1)) * 100);
    localStorage.setItem('ongyeol-sim-saved', JSON.stringify({
      version: flowVersion, started: true, step: currentStep, savedAt: Date.now(),
      people: [...(peopleBody?.querySelectorAll('[data-person-row]') || [])].map((row) => ({
          id: row.dataset.personId,
          moving: Boolean(row.querySelector('input[name="movingPeople"]')?.checked),
          head: Boolean(row.querySelector('input[name="householdHead"]')?.checked),
          relation: row.querySelector('select[name="householdRelation"]')?.value || '',
          name: row.querySelector('[name="personName"]')?.value || '',
          birthdate: row.querySelector('[name="personBirthdate"]')?.value || '',
          gender: row.querySelector('[name="personGender"]')?.value || ''
        })),
      household: document.querySelector('input[name="household"]:checked')?.value || '',
      address: document.getElementById('newAddress')?.value || ''
    }));
    localStorage.setItem('ongyeol-last-scenario-progress', String(percent));
  };
  const showStep = (index) => {
    currentStep = Math.max(0, Math.min(index, stepContent.length - 1));
    window.scrollTo(0, 0);
    stepContent.forEach((section, i) => section.classList.toggle('d-none', i !== currentStep));
    const notice = stepContent[currentStep].querySelector('.gov24-official-note')
      || (currentStep === 0 ? document.querySelector('.sim-retention-note') : null);
    if (notice && validation) notice.before(validation);
    const data = headings[currentStep];
    if (stepTitle) stepTitle.textContent = data.title;
    if (stepCurrent) stepCurrent.textContent = String(currentStep);
    if (stepTotal) stepTotal.textContent = String(stepContent.length - 1);
    if (currentQuestion) currentQuestion.textContent = data.question;
    if (questionHelp) {
      questionHelp.textContent = data.help;
      questionHelp.classList.toggle('d-none', !data.help);
    }
    if (questionEyebrow) questionEyebrow.textContent = `${currentStep}단계 / ${stepContent.length - 1}단계`;
    if (questionIcon) questionIcon.innerHTML = `<i class="bi ${data.icon}" aria-hidden="true"></i>`;
    const percent = Math.round((currentStep / (stepContent.length - 1)) * 100);
    if (stepProgress) stepProgress.style.width = `${percent}%`;
    if (progressBar) progressBar.setAttribute('aria-valuenow', String(percent));
    navLabels.forEach((label, i) => {
      label.classList.toggle('active', i === currentStep);
      if (i < currentStep) label.setAttribute('aria-label', `${label.textContent.replace(/\s+/g, ' ').trim()}, 완료`);
      else label.removeAttribute('aria-label');
    });
    if (prevButton) prevButton.disabled = currentStep === 0;
    if (prevButton) prevButton.hidden = currentStep === stepContent.length - 1;
    saveArea?.classList.toggle('d-none', currentStep === 0);
    if (nextButton) nextButton.innerHTML = currentStep === stepContent.length - 1
      ? '메인 화면으로 <i class="bi bi-house-door ms-1" aria-hidden="true"></i>'
      : '다음 단계 <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>';
    validation?.classList.add('d-none');
    if (currentStep < stepContent.length - 1) saveProgress();
    else {
      clearPracticeInputs();
      localStorage.removeItem('ongyeol-sim-saved');
      localStorage.removeItem('ongyeol-last-scenario-progress');
      localStorage.removeItem('ongyeol-last-completed');
    }
  };

  const validateCurrentStep = () => {
    if (currentStep === 0 && !document.querySelector('input[name="movingPeople"]:checked')) {
      return { message: '이사 가는 사람을 선택해 주세요.', focus: document.querySelector('input[name="movingPeople"]') };
    }
    if (currentStep === 0 && !document.querySelector('input[name="householdHead"]:checked')) {
      return { message: '세대주로 지정할 사람을 선택해 주세요.', focus: document.querySelector('input[name="householdHead"]') };
    }
    if (currentStep === 0) {
      for (const row of peopleBody?.querySelectorAll('[data-person-row]') || []) {
        const relation = row.querySelector('select[name="householdRelation"]');
        const name = row.querySelector('[name="personName"]');
        const birthdate = row.querySelector('[name="personBirthdate"]');
        const gender = row.querySelector('[name="personGender"]');
        if (relation && !relation.value) return { message: '추가한 사람의 세대주와의 관계를 선택해 주세요.', focus: relation };
        if (!name?.value.trim()) return { message: '각 행의 성명을 입력해 주세요.', focus: name };
        if (!birthdate?.value) return { message: '각 행의 생년월일을 선택해 주세요.', focus: birthdate };
        if (!gender?.value) return { message: '각 행의 성별을 선택해 주세요.', focus: gender };
      }
    }
    if (currentStep === 2) {
      const phoneIsValid = ['phoneFirst', 'phoneMiddle', 'phoneLast'].every((id) => /^\d+$/.test(document.getElementById(id)?.value || ''));
      if (!phoneIsValid) return { message: '휴대전화번호를 확인해 주세요.', focus: document.getElementById('phoneFirst') };
      if (!document.querySelector('input[name="moveReason"]:checked')) return { message: '전입사유를 선택해 주세요.', focus: document.querySelector('input[name="moveReason"]') };
    }
    if (currentStep === 3) {
      if (document.getElementById('previousAddressResult')?.classList.contains('d-none')) return { message: '시·도와 시·군·구를 선택한 뒤 주소조회를 해주세요.', focus: document.getElementById('previousAddressCity') };
      if (!document.querySelector('input[name="dataConsent"]:checked')) return { message: '정보 확인 동의 여부를 선택해 주세요.', focus: document.querySelector('input[name="dataConsent"]') };
    }
    if (currentStep === 4) {
      if (!document.getElementById('newAddress')?.value.trim()) return { message: '현재 주소를 검색해 주세요.', focus: document.getElementById('addressSearch') };
      if (!document.querySelector('input[name="household"]:checked')) return { message: '세대 구성을 선택해 주세요.', focus: document.querySelector('input[name="household"]') };
    }
    return null;
  };

  prevButton?.addEventListener('click', () => showStep(currentStep - 1));
  nextButton?.addEventListener('click', () => {
    if (currentStep === stepContent.length - 1) {
      window.location.href = '/home.html';
      return;
    }
    const issue = validateCurrentStep();
    if (issue) {
      if (validationText) validationText.textContent = issue.message;
      validation?.classList.remove('d-none');
      issue.focus?.focus();
      return;
    }
    showStep(currentStep + 1);
  });
  const previousAddressCity = document.getElementById('previousAddressCity');
  const previousAddressDistrict = document.getElementById('previousAddressDistrict');
  const previousAddressResult = document.getElementById('previousAddressResult');
  const previousAddressConsent = document.getElementById('previousAddressConsent');
  const districtOptions = {
    '서울특별시': ['중랑구', '마포구', '종로구'],
    '경기도': ['수원시 팔달구', '성남시 분당구', '고양시 덕양구'],
    '인천광역시': ['미추홀구', '연수구', '부평구'],
    '부산광역시': ['해운대구', '부산진구', '동래구']
  };
  const resetPreviousAddressResult = () => {
    previousAddressResult?.classList.add('d-none');
    previousAddressConsent?.classList.add('d-none');
    document.querySelectorAll('input[name="dataConsent"]').forEach((input) => { input.checked = false; });
  };
  previousAddressCity?.addEventListener('change', () => {
    const districts = districtOptions[previousAddressCity.value] || [];
    if (previousAddressDistrict) {
      previousAddressDistrict.replaceChildren(new Option('시군구선택', ''));
      districts.forEach((district) => previousAddressDistrict.add(new Option(district, district)));
      previousAddressDistrict.disabled = districts.length === 0;
    }
    resetPreviousAddressResult();
  });
  previousAddressDistrict?.addEventListener('change', resetPreviousAddressResult);
  document.getElementById('previousAddressSearch')?.addEventListener('click', () => {
    const city = previousAddressCity?.value;
    const district = previousAddressDistrict?.value;
    if (!city || !district) { toast('시·도와 시·군·구를 선택해 주세요.'); return; }
    const sample = city === '서울특별시' && district === '중랑구'
      ? { address: '서울특별시 중랑구 사가정로53길 26-0', office: '면목제3.8동' }
      : { address: `${city} ${district} 시청로 10 (연습용 주소)`, office: `${district} 행정복지센터 (예시)` };
    document.getElementById('previousAddressValue').textContent = sample.address;
    document.getElementById('previousAddressOffice').textContent = sample.office;
    previousAddressResult?.classList.remove('d-none');
    previousAddressConsent?.classList.remove('d-none');
    validation?.classList.add('d-none');
  });
  document.querySelectorAll('input[name="moveReason"]').forEach((input) => input.addEventListener('change', () => {
    const otherReason = document.getElementById('otherReason');
    if (otherReason) {
      otherReason.disabled = input.value !== 'other';
      if (input.value === 'other') otherReason.focus();
      else otherReason.value = '';
    }
    validation?.classList.add('d-none');
  }));
  document.getElementById('addHouseholdPerson')?.addEventListener('click', () => {
    const row = addHouseholdPersonRow();
    syncRemovePersonButton();
    row?.querySelector('[name="personName"]')?.focus();
    validation?.classList.add('d-none');
    if (currentStep < stepContent.length - 1) saveProgress();
  });
  document.getElementById('removeHouseholdPerson')?.addEventListener('click', () => {
    const addedRows = [...(peopleBody?.querySelectorAll('[data-person-row]:not([data-person-id="applicant"])') || [])];
    addedRows[addedRows.length - 1]?.remove();
    syncRemovePersonButton();
    renderHouseholdHeadSummary();
    renderMovingPeopleSummary();
    validation?.classList.add('d-none');
    if (currentStep < stepContent.length - 1) saveProgress();
  });
  peopleBody?.addEventListener('change', (event) => {
    const input = event.target;
    if (input.matches('input[name="householdHead"]') && input.checked) {
      peopleBody.querySelectorAll('input[name="householdHead"]').forEach((other) => { if (other !== input) other.checked = false; });
    }
    renderHouseholdHeadSummary();
    renderMovingPeopleSummary();
    validation?.classList.add('d-none');
    if (currentStep < stepContent.length - 1) saveProgress();
  });
  peopleBody?.addEventListener('input', () => {
    renderHouseholdHeadSummary();
    renderMovingPeopleSummary();
    validation?.classList.add('d-none');
    if (currentStep < stepContent.length - 1) saveProgress();
  });
  document.querySelectorAll('input[name="household"]').forEach((input) => input.addEventListener('change', () => {
    validation?.classList.add('d-none');
    saveProgress();
  }));
  document.getElementById('addressSearch')?.addEventListener('click', () => {
    const address = '서울특별시 마포구 월드컵북로 120 (연습용 주소)';
    const field = document.getElementById('newAddress');
    if (field) field.value = address;
    validation?.classList.add('d-none');
    toast('연습용 주소를 확인했습니다.');
    saveProgress();
  });
  document.getElementById('buildingNumberHelp')?.addEventListener('click', () => toast('건물번호는 주소 검색 결과에서 확인하는 도로명 주소의 번호입니다.'));
  document.querySelector('[data-info-button]')?.addEventListener('click', () => toast('연습용으로 표시된 이전 주소입니다.'));
  document.getElementById('printApplication')?.addEventListener('click', () => window.print());
  showStep(Number.isInteger(savedProgress.step) && savedProgress.step >= 0 && savedProgress.step < stepContent.length ? savedProgress.step : 0);
})();
