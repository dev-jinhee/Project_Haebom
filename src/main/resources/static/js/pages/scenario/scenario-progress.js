(() => {
  const toast = window.Haebom.toast;
  const savedSimulationKey = 'ongyeol-sim-saved';
// The only supported scenario is move-in notification; show current, incomplete progress only.
  const syncPracticeProgress = (prefix) => {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem('ongyeol-sim-saved') || 'null'); } catch (_) { saved = null; }
    const valid = saved && saved.version === 4 && saved.started === true && Number.isInteger(saved.step) && saved.step >= 0 && saved.step < 6;
    if (!valid) {
      if (saved || localStorage.getItem('ongyeol-last-scenario-progress') || localStorage.getItem('ongyeol-last-completed')) {
        localStorage.removeItem('ongyeol-sim-saved');
        localStorage.removeItem('ongyeol-last-completed');
        localStorage.removeItem('ongyeol-last-scenario-progress');
      }
      document.querySelector(`[data-${prefix}-practice-row]`)?.classList.add('d-none');
      const count = document.getElementById('activeScenarioCount'); if (count) count.textContent = '0건';
      document.querySelector(`[data-${prefix}-no-practice]`)?.classList.remove('d-none');
      return;
    }
    const percent = Math.round((saved.step / 5) * 100);
    const captions = ['0단계 · 사전 정보 입력', '1단계 · 유의사항', '2단계 · 기본 정보', '3단계 · 이전 주소', '4단계 · 현재 주소', '5단계 · 결과'];
    if (prefix === 'home') {
      document.querySelector('[data-home-start-guide]')?.classList.add('d-none');
      const homeProgress = document.querySelector('[data-home-saved-practice]');
      homeProgress?.classList.remove('d-none');
      const stageLabel = homeProgress?.querySelector('[data-home-progress-stage]');
      if (stageLabel) stageLabel.textContent = `현재 ${captions[saved.step]}`;
      const stageBar = homeProgress?.querySelector('.home-stage-progress');
      if (stageBar) stageBar.setAttribute('aria-valuenow', String(saved.step));
      homeProgress?.querySelectorAll('[data-home-step-segment]').forEach((segment, index) => {
        segment.classList.toggle('is-complete', index < saved.step);
        segment.classList.toggle('is-current', index === saved.step);
      });
    }
    const label = document.querySelector(`[data-${prefix}-progress-label]`);
    if (label) label.textContent = `${saved.step} / 5단계`;
    const bar = document.querySelector(`[data-${prefix}-progress-bar]`);
    if (bar) bar.style.width = `${percent}%`;
    const caption = document.querySelector(`[data-${prefix}-progress-caption]`);
    if (caption) caption.textContent = `${captions[saved.step]} · 임시 저장된 연습`;
    document.querySelectorAll(`[data-${prefix}-practice-percent]`).forEach((practicePercent) => { practicePercent.textContent = `${percent}%`; });
    const practiceBar = document.querySelector(`[data-${prefix}-practice-bar]`);
    if (practiceBar) practiceBar.style.width = `${percent}%`;
    const practiceCaption = document.querySelector(`[data-${prefix}-practice-caption]`);
    if (practiceCaption) practiceCaption.textContent = captions[saved.step];
    const action = document.querySelector(`[data-${prefix}-practice-action]`);
    if (action) action.innerHTML = '이어서 하기 <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>';
    if (prefix === 'my') {
      const restartButton = document.querySelector('[data-my-practice-restart]');
      const deleteButton = document.querySelector('[data-my-practice-delete]');
      restartButton?.classList.remove('d-none');
      deleteButton?.classList.remove('d-none');
      const clearSavedProgress = () => {
        localStorage.removeItem(savedSimulationKey);
        localStorage.removeItem('ongyeol-last-scenario-progress');
        localStorage.removeItem('ongyeol-last-completed');
      };
      restartButton?.addEventListener('click', () => {
        clearSavedProgress();
        window.location.href = '/simulation.html';
      });
      deleteButton?.addEventListener('click', () => {
        if (!window.confirm('저장된 진행 내용을 삭제할까요? 삭제하면 이어서 할 수 없습니다.')) return;
        clearSavedProgress();
        document.querySelector('[data-my-practice-row]')?.classList.add('d-none');
        document.querySelector('[data-my-no-practice]')?.classList.remove('d-none');
        document.getElementById('myScenarioStatus')?.classList.add('d-none');
        const count = document.getElementById('activeScenarioCount'); if (count) count.textContent = '0건';
      });
    }
    const count = document.getElementById('activeScenarioCount'); if (count) count.textContent = '1건';
    document.getElementById('myScenarioStatus')?.classList.remove('d-none');
    const cta = document.querySelector(`[data-${prefix}-practice-cta]`);
    if (cta) {
      cta.firstChild.textContent = prefix === 'home' ? '이어서 연습하기 ' : '진행 중인 연습 보기 ';
      if (prefix === 'home') cta.href = '/simulation.html';
    }
  };
  syncPracticeProgress('home');
  syncPracticeProgress('my');

  const search = document.getElementById('scenarioSearch');
  const scenarioItems = [...document.querySelectorAll('.scenario-item')];
  const scenarioSearchEmpty = document.getElementById('scenarioSearchEmpty');
  const scenarioComingSoon = document.querySelector('.scenario-coming-soon');
  const filterScenarios = () => {
    if (!search) return;
    const query = search.value.trim().toLowerCase();
    let visibleCount = 0;
    scenarioItems.forEach((item) => {
      const visible = `${item.dataset.search} ${item.textContent}`.toLowerCase().includes(query);
      item.classList.toggle('d-none', !visible);
      if (visible) visibleCount += 1;
    });
    scenarioSearchEmpty?.classList.toggle('d-none', !query || visibleCount > 0);
    scenarioComingSoon?.classList.toggle('d-none', Boolean(query));
  };
  search?.addEventListener('input', filterScenarios);
  const moveScenario = document.querySelector('[data-scenario-card="move-in"]');
  if (moveScenario) {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem('ongyeol-sim-saved') || 'null'); } catch (_) { saved = null; }
    const isActive = saved?.version === 4 && saved.started === true && Number.isInteger(saved.step) && saved.step >= 0 && saved.step < 6;
    if (isActive) {
      const percent = Math.round((saved.step / 5) * 100);
      moveScenario.querySelector('[data-scenario-state]')?.replaceChildren('진행 중');
      const progress = moveScenario.querySelector('[data-scenario-progress]');
      progress?.classList.remove('d-none');
      const caption = moveScenario.querySelector('[data-scenario-progress-caption]');
      if (caption) caption.textContent = `${saved.step} / 5단계 진행 중`;
      const percentLabel = moveScenario.querySelector('[data-scenario-progress-percent]');
      if (percentLabel) percentLabel.textContent = `${percent}%`;
      const bar = moveScenario.querySelector('[data-scenario-progress-bar]');
      if (bar) { bar.style.width = `${percent}%`; bar.parentElement?.setAttribute('aria-valuenow', String(percent)); }
      const action = moveScenario.querySelector('[data-scenario-action]');
      if (action) action.innerHTML = '이어서 하기 <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>';
      const restartButton = moveScenario.querySelector('[data-scenario-restart]');
      const deleteButton = moveScenario.querySelector('[data-scenario-delete]');
      restartButton?.classList.remove('d-none');
      deleteButton?.classList.remove('d-none');
      const clearSavedProgress = () => {
        localStorage.removeItem(savedSimulationKey);
        localStorage.removeItem('ongyeol-last-scenario-progress');
        localStorage.removeItem('ongyeol-last-completed');
      };
      restartButton?.addEventListener('click', () => {
        clearSavedProgress();
        window.location.href = '/simulation.html';
      });
      deleteButton?.addEventListener('click', () => {
        if (!window.confirm('저장된 진행 내용을 삭제할까요? 삭제하면 이어서 할 수 없습니다.')) return;
        clearSavedProgress();
        moveScenario.querySelector('[data-scenario-state]')?.replaceChildren('이용 가능');
        progress?.classList.add('d-none');
        if (action) action.innerHTML = '연습 시작하기 <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>';
        restartButton?.classList.add('d-none');
        deleteButton?.classList.add('d-none');
        toast('진행 내용을 삭제했어요.');
      });
    }
  }

})();
