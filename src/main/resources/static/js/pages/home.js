(function () {
  const page = document.getElementById('main-content');
  const logoutForm = document.querySelector('[data-logout-form]');
  let administrativeCenterMap = null;

  if (logoutForm !== null) {
    logoutForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
      const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content
        || 'X-CSRF-TOKEN';
      const csrfInput = logoutForm.querySelector('input[name="_csrf"]');
      const token = csrfToken || (csrfInput ? csrfInput.value : '');
      const submitButton = logoutForm.querySelector('[type="submit"]');

      if (!token) {
        window.alert('보안 토큰을 찾을 수 없습니다. 페이지를 새로고침해 주세요.');
        return;
      }

      if (submitButton) submitButton.disabled = true;
      try {
        const params = new URLSearchParams(new FormData(logoutForm));
        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Accept': 'text/html'
        };
        headers[csrfHeader] = token;

        const response = await fetch(logoutForm.action, {
          method: 'POST',
          credentials: 'same-origin',
          headers: headers,
          body: params.toString()
        });

        if (response.redirected) {
          window.location.assign(response.url);
        } else if (response.ok) {
          window.location.reload();
        } else {
          throw new Error('로그아웃 요청을 처리하지 못했습니다. 다시 시도해 주세요.');
        }
      } catch (error) {
        window.alert(error.message || '로그아웃 중 통신 오류가 발생했습니다.');
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  if (page !== null) {
    loadMainPage(page);
  }

  initializePolicySearch();
  initializeAdministrativeCenterMap();

  function show(element, visible) {
    if (element !== null) {
      element.hidden = !visible;
    }
  }

  function initializeAdministrativeCenterMap() {
    const section = document.getElementById('center-map-section');
    if (section === null) return;

    const mapElement = document.getElementById('center-map');
    const message = document.getElementById('center-map-message');
    const sidoSelect = document.getElementById('center-sido');
    const sigunguSelect = document.getElementById('center-sigungu');
    const centerList = document.getElementById('center-list');
    const apiKey = (section.dataset.mapKey || '').trim();
    const centersApiUrl = section.dataset.apiUrl;
    const regionsApiUrl = section.dataset.regionApiUrl;
    if (!mapElement || !message || !sidoSelect || !sigunguSelect || !centerList) return;

    let regionsLoaded = false;
    let regionsLoadFailed = false;
    let mapReady = false;
    let clustererLoaded = false;
    let centersLoaded = false;
    let centerData = [];
    let centerDataLabel = '행정복지센터';
    let centerMarkers = [];
    let centerClusterer = null;
    let centerInfoWindow = null;
    let regionRequestId = 0;
    let centerLoadPromise = null;

    sidoSelect.disabled = true;
    sigunguSelect.disabled = true;

    function updateRegionControls() {
      sidoSelect.disabled = !regionsLoaded || !mapReady;
      sigunguSelect.disabled = !regionsLoaded || !mapReady || !sidoSelect.value;
    }

    function resetSelect(select, placeholder) {
      select.replaceChildren(new Option(placeholder, ''));
    }

    async function fetchRegions(cd) {
      const url = new URL(regionsApiUrl, window.location.origin);
      if (cd) url.searchParams.set('cd', cd);
      const response = await fetch(url, { credentials: 'same-origin' });
      if (!response.ok) throw new Error('행정구역 조회에 실패했습니다.');
      const regions = await response.json();
      if (!Array.isArray(regions)) throw new Error('행정구역 응답 형식이 올바르지 않습니다.');
      return regions;
    }

    async function loadSidoOptions() {
      const requestId = ++regionRequestId;
      message.textContent = '시·도 목록을 불러오는 중입니다.';
      try {
        const regions = await fetchRegions();
        if (requestId !== regionRequestId || !section.isConnected) return;
        resetSelect(sidoSelect, '시·도를 선택하세요');
        regions.forEach(region => {
          if (region.cd != null && region.addr_name) {
            sidoSelect.add(new Option(region.addr_name, String(region.cd)));
          }
        });
        regionsLoaded = true;
        regionsLoadFailed = false;
        updateRegionControls();
        if (mapReady && !centersLoaded) message.textContent = '시·도와 시·군·구를 선택해 주세요.';
      } catch (error) {
        console.error('시·도 조회 오류:', error);
        if (requestId === regionRequestId) {
          regionsLoadFailed = true;
          message.textContent = '시·도 목록을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.';
        }
      }
    }

    function clearCenterMarkers() {
      if (centerClusterer) {
        centerClusterer.clearMarkers();
        centerClusterer.setMap(null);
        centerClusterer = null;
      }
      centerMarkers.forEach(marker => marker.setMap(null));
      centerMarkers = [];
      centerList.replaceChildren();
      if (centerInfoWindow) centerInfoWindow.close();
    }

    function normalizeSidoName(name) {
      const sidoNames = {
        '서울특별시': '서울', '부산광역시': '부산', '대구광역시': '대구',
        '인천광역시': '인천', '광주광역시': '광주', '대전광역시': '대전',
        '울산광역시': '울산', '세종특별자치시': '세종', '경기도': '경기',
        '강원도': '강원', '강원특별자치도': '강원', '충청북도': '충북',
        '충청남도': '충남', '전라북도': '전북', '전북특별자치도': '전북',
        '전라남도': '전남', '경상북도': '경북', '경상남도': '경남',
        '제주특별자치도': '제주'
      };
      return sidoNames[name] || name;
    }

    function focusMapOnSelectedRegion() {
      if (!centersLoaded || !administrativeCenterMap) return;

      const sidoName = sidoSelect.value
        ? sidoSelect.selectedOptions[0]?.textContent?.trim()
        : '';
      const sigunguName = sigunguSelect.value
        ? sigunguSelect.selectedOptions[0]?.textContent?.trim()
        : '';
      if (!sidoName) return;

      const selectedCenters = centerData.filter(center =>
        normalizeSidoName(center.sido) === normalizeSidoName(sidoName)
        && (!sigunguName || center.sigungu === sigunguName));

      if (selectedCenters.length === 0) {
        message.textContent = `${sidoName}${sigunguName ? ` ${sigunguName}` : ''} 지역의 좌표가 등록된 행정복지센터가 없습니다.`;
        return;
      }

      if (selectedCenters.length === 1) {
        administrativeCenterMap.setCenter({
          lat: selectedCenters[0].latitude,
          lng: selectedCenters[0].longitude
        });
        administrativeCenterMap.setZoom(sigunguName ? 13 : 9);
        return;
      }

      const bounds = new google.maps.LatLngBounds();
      selectedCenters.forEach(center => bounds.extend({
        lat: center.latitude,
        lng: center.longitude
      }));
      administrativeCenterMap.fitBounds(bounds, 40);
    }

    function createCenterMarker(center) {
      const marker = new google.maps.Marker({
        position: { lat: center.latitude, lng: center.longitude },
        title: center.centerName || '행정복지센터',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#1769aa',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 1.5,
          scale: 6
        }
      });
      marker.addListener('click', () => {
        const content = document.createElement('div');
        content.className = 'center-place-popup';
        const title = document.createElement('strong');
        const address = document.createElement('p');
        title.textContent = center.centerName || '행정복지센터';
        address.textContent = center.address || '주소 정보 없음';
        content.append(title, address);
        if (center.postalCode) {
          const postalCode = document.createElement('p');
          postalCode.textContent = `우편번호 ${center.postalCode}`;
          content.append(postalCode);
        }

        const placeStatus = document.createElement('p');
        placeStatus.textContent = '추가 장소 정보를 불러오는 중입니다.';
        content.append(placeStatus);
        centerInfoWindow.setContent(content);
        centerInfoWindow.open({ map: administrativeCenterMap, anchor: marker });

        fetch(`${centersApiUrl}/${encodeURIComponent(center.centerId)}/place-info`, {
          headers: { Accept: 'application/json' }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Places lookup failed: ${response.status}`);
            }
            return response.json();
          })
          .then(place => {
            placeStatus.textContent = '';

            const appendText = (label, value) => {
              if (!value) return;
              const row = document.createElement('p');
              row.textContent = `${label}: ${value}`;
              content.append(row);
            };

            appendText('전화번호', place.phoneNumber);

            if (Array.isArray(place.weekdayDescriptions)
                && place.weekdayDescriptions.length > 0) {
              const hours = document.createElement('div');
              hours.className = 'center-place-hours';
              const hoursTitle = document.createElement('strong');
              hoursTitle.className = 'center-place-hours-title';
              hoursTitle.textContent = '운영시간';
              hours.append(hoursTitle);

              place.weekdayDescriptions.forEach(description => {
                const separator = description.indexOf(':');
                const day = separator >= 0
                  ? description.slice(0, separator).trim()
                  : '';
                const time = separator >= 0
                  ? description.slice(separator + 1).trim()
                  : description;
                const row = document.createElement('div');
                row.className = 'center-place-hours-row';

                if (day) {
                  const dayLabel = document.createElement('span');
                  dayLabel.className = 'center-place-hours-day';
                  dayLabel.textContent = day;
                  row.append(dayLabel);
                }

                const timeLabel = document.createElement('span');
                timeLabel.className = 'center-place-hours-time';
                timeLabel.textContent = time;
                row.append(timeLabel);
                hours.append(row);
              });
              content.append(hours);
            }

            [
              ['홈페이지 열기', place.websiteUri],
              ['Google 지도에서 보기', place.googleMapsUri]
            ].forEach(([label, url]) => {
              if (!url) return;
              const link = document.createElement('a');
              link.className = 'center-place-link';
              link.href = url;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              link.textContent = label;
              content.append(link);
            });

            if (!place.phoneNumber && !place.websiteUri
                && (!Array.isArray(place.weekdayDescriptions)
                    || place.weekdayDescriptions.length === 0)) {
              placeStatus.textContent = '추가 연락처·운영시간 정보가 등록되어 있지 않습니다.';
            }
          })
          .catch(() => {
            placeStatus.textContent =
              '추가 정보를 불러오지 못했습니다. 기본 기관 정보를 확인해 주세요.';
          });
      });
      return marker;
    }

    function renderVisibleCenters() {
      if (!mapReady || !centersLoaded || !administrativeCenterMap) return;
      const bounds = administrativeCenterMap.getBounds();
      if (!bounds) return;

      clearCenterMarkers();
      const visibleCenters = centerData.filter(center =>
        bounds.contains({ lat: center.latitude, lng: center.longitude }));
      centerMarkers = visibleCenters.map(createCenterMarker);

      if (centerMarkers.length === 0) {
        message.textContent = `${centerDataLabel} ${centerData.length}곳 중 현재 지도 범위에 표시할 기관이 없습니다.`;
        return;
      }

      if (clustererLoaded && window.markerClusterer?.MarkerClusterer) {
        const clusterOptions = {
          map: administrativeCenterMap,
          markers: centerMarkers,
          renderer: {
            render({ count, position }) {
              const scale = count >= 100 ? 17 : count >= 10 ? 15 : 13;
              return new google.maps.Marker({
                position,
                zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: '#075fae',
                  fillOpacity: 0.94,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  scale
                },
                label: {
                  text: String(count),
                  color: '#ffffff',
                  fontSize: count >= 100 ? '10px' : '11px',
                  fontWeight: '700'
                }
              });
            }
          }
        };
        if (window.markerClusterer.SuperClusterAlgorithm) {
          clusterOptions.algorithm = new window.markerClusterer.SuperClusterAlgorithm({
            radius: 90,
            maxZoom: 14
          });
        }
        centerClusterer = new window.markerClusterer.MarkerClusterer(clusterOptions);
      } else {
        centerMarkers.forEach(marker => marker.setMap(administrativeCenterMap));
      }

      message.textContent = `${centerDataLabel} ${centerData.length}곳 중 현재 지도에 ${centerMarkers.length}곳을 표시했습니다.`;
      if (!clustererLoaded) message.textContent += ' (클러스터 라이브러리를 불러오지 못해 개별 마커로 표시합니다.)';
    }

    async function loadCentersForSelection() {
      if (!mapReady) return;
      if (centersLoaded) {
        focusMapOnSelectedRegion();
        return;
      }
      if (centerLoadPromise) {
        await centerLoadPromise;
        focusMapOnSelectedRegion();
        return;
      }

      clearCenterMarkers();
      message.textContent = '좌표가 등록된 전체 행정복지센터를 불러오는 중입니다.';
      centerLoadPromise = (async () => {
        try {
          const response = await fetch(centersApiUrl, {
            credentials: 'same-origin'
          });
          if (!response.ok) throw new Error('행정복지센터 조회에 실패했습니다.');
          const centers = await response.json();
          if (!Array.isArray(centers)) throw new Error('행정복지센터 응답 형식이 올바르지 않습니다.');
          if (!section.isConnected) return;

          centerInfoWindow = centerInfoWindow || new google.maps.InfoWindow({ maxWidth: 360 });
          centerData = centers.map(center => {
            const lat = Number(center.latitude);
            const lng = Number(center.longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lng) ||
                lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
            return { ...center, latitude: lat, longitude: lng };
          }).filter(Boolean);
          centersLoaded = true;
          centerDataLabel = '좌표가 등록된 행정복지센터';

          if (centerData.length === 0) {
            message.textContent = '지도에 표시할 좌표가 등록된 행정복지센터가 없습니다.';
            return;
          }

          if (sidoSelect.value) {
            focusMapOnSelectedRegion();
          } else {
            const bounds = new google.maps.LatLngBounds();
            centerData.forEach(center => bounds.extend({
              lat: center.latitude,
              lng: center.longitude
            }));
            administrativeCenterMap.fitBounds(bounds);
          }
          renderVisibleCenters();
        } catch (error) {
          console.error('행정복지센터 조회 오류:', error);
          message.textContent = '행정복지센터를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.';
          centerLoadPromise = null;
        }
      })();
      await centerLoadPromise;
    }

    sidoSelect.addEventListener('change', async () => {
      resetSelect(sigunguSelect, '먼저 시·도를 선택하세요');
      sigunguSelect.disabled = true;
      loadCentersForSelection();
      if (!sidoSelect.value) {
        return;
      }

      const requestId = ++regionRequestId;
      const selectedSido = sidoSelect.value;
      message.textContent = '시·군·구 목록을 불러오는 중입니다.';
      try {
        const regions = await fetchRegions(selectedSido);
        if (requestId !== regionRequestId || sidoSelect.value !== selectedSido || !section.isConnected) return;
        resetSelect(sigunguSelect, '시·군·구를 선택하세요');
        regions.forEach(region => {
          if (region.cd != null && region.addr_name) {
            sigunguSelect.add(new Option(region.addr_name, String(region.cd)));
          }
        });
        sigunguSelect.disabled = regions.length === 0;
        if (regions.length === 0) message.textContent = '선택한 시·도에 시·군·구 목록이 없습니다.';
      } catch (error) {
        console.error('시·군·구 조회 오류:', error);
        if (requestId === regionRequestId) message.textContent = '시·군·구 목록을 불러오지 못했습니다.';
      }
    });

    sigunguSelect.addEventListener('change', () => {
      loadCentersForSelection();
    });

    loadSidoOptions();

    if (!apiKey) {
      message.textContent = 'Google Maps 브라우저 키가 설정되지 않아 지도를 표시할 수 없습니다.';
      mapElement.hidden = true;
      return;
    }

    message.textContent = '지도를 불러오는 중입니다.';

    window.initHaebomCenterMap = function () {
      if (!window.google || !window.google.maps) {
        message.textContent = '지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
        return;
      }

      administrativeCenterMap = new google.maps.Map(mapElement, {
        center: { lat: 36.5, lng: 127.8 },
        zoom: 7,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
      });
      administrativeCenterMap.addListener('idle', renderVisibleCenters);
      administrativeCenterMap.addListener('zoom_changed', clearCenterMarkers);
      administrativeCenterMap.addListener('dragstart', clearCenterMarkers);
      centerInfoWindow = new google.maps.InfoWindow({ maxWidth: 360 });

      const clusterScript = document.createElement('script');
      clusterScript.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
      clusterScript.async = true;
      clusterScript.onload = function () {
        clustererLoaded = !!window.markerClusterer?.MarkerClusterer;
        mapReady = true;
        updateRegionControls();
        message.textContent = regionsLoadFailed
          ? '시·도 목록을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.'
          : clustererLoaded
            ? '전체 행정복지센터 위치를 불러오는 중입니다.'
            : '클러스터를 불러오지 못했습니다. 지역을 선택하면 개별 마커로 표시합니다.';
        loadCentersForSelection();
      };
      clusterScript.onerror = function () {
        clustererLoaded = false;
        mapReady = true;
        updateRegionControls();
        message.textContent = '클러스터 라이브러리를 불러오지 못했습니다. 마커는 개별 표시합니다.';
        loadCentersForSelection();
      };
      document.head.append(clusterScript);
    };

    window.gm_authFailure = function () {
      message.textContent = 'Google Maps 인증에 실패했습니다. API 키와 허용 도메인 설정을 확인해 주세요.';
    };

    const script = document.createElement('script');
    const query = new URLSearchParams({
      key: apiKey,
      callback: 'initHaebomCenterMap',
      loading: 'async'
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${query.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = function () {
      message.textContent = 'Google Maps 스크립트를 불러오지 못했습니다. 네트워크와 API 키 설정을 확인해 주세요.';
    };
    document.head.append(script);
  }

  async function loadMainPage(pageElement) {
    const loggedOutView = document.getElementById('loggedOutView');
    const noProgressView = document.getElementById('loggedInNoProgressView');
    const inProgressView = document.getElementById('loggedInProgressView');
    const startGuideCard = document.getElementById('startGuideCard');
    const recentProgressMount = document.getElementById('recentProgressMount');

    try {
      const response = await fetch(pageElement.dataset.apiUrl, {
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error('메인 정보를 불러오지 못했습니다.');
      }

      const data = await response.json();
      const hasProgress = Boolean(data.recentScenario);

      initializePopularScenarios(
        document.getElementById('popular-scenarios'),
        data.popularScenarios || [],
        Boolean(data.loggedIn),
        pageElement.dataset.apiUrl
      );

      show(loggedOutView, !data.loggedIn);
      show(noProgressView, data.loggedIn && !hasProgress);
      show(inProgressView, data.loggedIn && hasProgress);
      show(startGuideCard, !data.loggedIn || !hasProgress);
      show(recentProgressMount, data.loggedIn && hasProgress);

      if (data.loggedIn) {
        setMemberName('memberNameNoProgress', data.memberName);
        setMemberName('memberNameProgress', data.memberName);
      }

      if (data.loggedIn && hasProgress) {
        await renderRecentScenarioCard(recentProgressMount, data.recentScenario, pageElement.dataset.apiUrl);
      }
    } catch (error) {
      console.error(error);
      initializePopularScenarios(
        document.getElementById('popular-scenarios'),
        [],
        false,
        pageElement.dataset.apiUrl,
        '인기 시나리오를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
      show(loggedOutView, true);
      show(noProgressView, false);
      show(inProgressView, false);
      show(startGuideCard, true);
      show(recentProgressMount, false);
    }
  }

  function setMemberName(elementId, memberName) {
    const element = document.getElementById(elementId);

    if (element !== null) {
      element.textContent = memberName || '';
    }
  }

  function initializePopularScenarios(root, items, loggedIn, mainApiUrl, loadError) {
    if (root === null) return;

    const slide = root.querySelector('[data-popular-slide]');
    const position = root.querySelector('[data-popular-position]');
    const dots = root.querySelector('[data-popular-dots]');
    const feedback = root.querySelector('[data-popular-feedback]');
    const previousButton = root.querySelector('[data-popular-prev]');
    const nextButton = root.querySelector('[data-popular-next]');
    const toggleButton = root.querySelector('[data-popular-toggle]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mainUrl = new URL(mainApiUrl, window.location.href);
    const contextPath = mainUrl.pathname.replace(/\/api\/main\/?$/, '');
    const scenarios = Array.isArray(items) ? items : [];
    let currentIndex = 0;
    let timerId = null;
    let paused = reducedMotion;

    function updateAutoPlayButton() {
      const icon = toggleButton.querySelector('.material-symbols-outlined');
      const isRunning = timerId !== null;
      icon.textContent = isRunning ? 'pause' : 'play_arrow';
      toggleButton.setAttribute('aria-label', isRunning ? '자동 넘김 일시정지' : '자동 넘김 시작');
      toggleButton.setAttribute('aria-pressed', String(!isRunning));
    }

    function stopAutoPlay() {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
      updateAutoPlayButton();
    }

    function startAutoPlay() {
      stopAutoPlay();
      if (paused || reducedMotion || scenarios.length < 2) return;
      timerId = window.setInterval(function () {
        currentIndex = (currentIndex + 1) % scenarios.length;
        render();
      }, 6000);
      updateAutoPlayButton();
    }

    function render() {
      slide.replaceChildren();
      dots.replaceChildren();

      if (loadError || scenarios.length === 0) {
        const message = document.createElement('p');
        message.className = 'popular-scenarios-status';
        message.textContent = loadError || '이번 달 인기 시나리오가 아직 없습니다.';
        slide.append(message);
        position.textContent = '0 / 0';
        previousButton.disabled = true;
        nextButton.disabled = true;
        toggleButton.disabled = true;
        stopAutoPlay();
        return;
      }

      const item = scenarios[currentIndex];
      const card = document.createElement('article');
      card.className = 'popular-scenario-card';

      const copy = document.createElement('div');
      copy.className = 'popular-scenario-copy';

      const eyebrow = document.createElement('div');
      eyebrow.className = 'popular-scenario-eyebrow';
      const rank = document.createElement('span');
      rank.className = 'popular-scenario-rank';
      rank.textContent = `인기 ${currentIndex + 1}`;
      const category = document.createElement('span');
      category.className = 'popular-scenario-category';
      category.textContent = item.categoryLabel || item.categoryName || '행정절차';
      eyebrow.append(rank, category);

      const title = document.createElement('h3');
      title.textContent = item.scenarioTitle || '시나리오';
      const description = document.createElement('p');
      description.textContent = item.description || '단계별 행정절차를 미리 연습해 보세요.';

      const duration = document.createElement('p');
      duration.className = 'popular-scenario-duration';
      const minutes = Number(item.estimatedMinutes);
      duration.textContent = Number.isFinite(minutes) && minutes > 0
        ? `예상 ${minutes}분 · 학습용 시뮬레이션`
        : '학습용 시뮬레이션';
      copy.append(eyebrow, title, description, duration);

      const actions = document.createElement('div');
      actions.className = 'popular-scenario-actions';
      const startButton = document.createElement('button');
      startButton.className = 'btn btn-light rounded-pill';
      startButton.type = 'button';
      startButton.textContent = loggedIn ? '연습 시작' : '로그인하고 연습하기';
      startButton.addEventListener('click', function () {
        startScenario(item.scenarioId, startButton);
      });
      const listLink = document.createElement('a');
      listLink.className = 'popular-scenario-list-link';
      listLink.href = `${contextPath}/scenario`;
      listLink.textContent = '시나리오 안내 보기';
      actions.append(startButton, listLink);

      card.append(copy, actions);
      slide.append(card);
      position.textContent = `${currentIndex + 1} / ${scenarios.length}`;
      previousButton.disabled = scenarios.length < 2;
      nextButton.disabled = scenarios.length < 2;
      toggleButton.disabled = scenarios.length < 2 || reducedMotion;

      scenarios.forEach(function (scenario, index) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'popular-carousel-dot';
        dot.setAttribute('aria-label', `인기 시나리오 ${index + 1} 보기`);
        dot.setAttribute('aria-current', String(index === currentIndex));
        dot.addEventListener('click', function () {
          currentIndex = index;
          render();
          startAutoPlay();
        });
        dots.append(dot);
      });

      updateAutoPlayButton();
    }

    async function startScenario(scenarioId, button) {
      if (!loggedIn) {
        const returnTo = `${contextPath}/scenario`;
        window.location.assign(`${contextPath}/login?redirect=${encodeURIComponent(returnTo)}`);
        return;
      }
      if (!Number.isInteger(Number(scenarioId))) {
        feedback.textContent = '시나리오 정보를 확인할 수 없습니다.';
        return;
      }

      button.disabled = true;
      feedback.textContent = '시나리오를 준비하고 있습니다.';
      try {
        const response = await fetch(
          `${contextPath}/api/scenario/${encodeURIComponent(scenarioId)}/start`,
          { method: 'POST', credentials: 'same-origin', headers: { Accept: 'application/json' } }
        );
        if (response.redirected) {
          window.location.assign(response.url);
          return;
        }
        if (!response.ok) throw new Error('시나리오를 시작하지 못했습니다. 다시 시도해 주세요.');

        const progressId = await response.json();
        if (!Number.isInteger(Number(progressId))) {
          throw new Error('시작 결과를 확인하지 못했습니다. 시나리오 목록에서 다시 시작해 주세요.');
        }
        window.sessionStorage.setItem('progressId', String(progressId));
        window.location.assign(`${contextPath}/simulation`);
      } catch (error) {
        feedback.textContent = error.message || '시나리오 시작 중 오류가 발생했습니다.';
        button.disabled = false;
      }
    }

    previousButton.addEventListener('click', function () {
      if (scenarios.length < 2) return;
      currentIndex = (currentIndex - 1 + scenarios.length) % scenarios.length;
      render();
      startAutoPlay();
    });
    nextButton.addEventListener('click', function () {
      if (scenarios.length < 2) return;
      currentIndex = (currentIndex + 1) % scenarios.length;
      render();
      startAutoPlay();
    });
    toggleButton.addEventListener('click', function () {
      paused = !paused;
      if (paused) stopAutoPlay();
      else startAutoPlay();
    });
    root.addEventListener('mouseenter', stopAutoPlay);
    root.addEventListener('mouseleave', startAutoPlay);
    root.addEventListener('focusin', stopAutoPlay);
    root.addEventListener('focusout', function (event) {
      if (!root.contains(event.relatedTarget)) startAutoPlay();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAutoPlay();
      else startAutoPlay();
    });

    render();
    startAutoPlay();
  }

  async function renderRecentScenarioCard(mount, item, mainApiUrl) {
    if (mount === null || !item || !item.scenario || !item.progress) {
      return;
    }

    const scenario = item.scenario;
    const progress = item.progress;
    const totalSteps = Number(scenario.stepCount) || 0;
    const currentStep = Math.max(0, Number(progress.stepOrder) || 0);
    const progressPercent = totalSteps > 1
      ? Math.min(100, Math.max(0, (currentStep - 1) / (totalSteps - 1) * 100))
      : (currentStep > 0 ? 100 : 0);

    let steps = [];
    try {
      const mainUrl = new URL(mainApiUrl, window.location.href);
      const contextPath = mainUrl.pathname.replace(/\/api\/main\/?$/, '');
      const stepsResponse = await fetch(
        `${contextPath}/api/scenario/${encodeURIComponent(scenario.scenarioId)}/steps`,
        { headers: { Accept: 'application/json' } }
      );
      if (!stepsResponse.ok) {
        throw new Error('시나리오 단계 정보를 불러오지 못했습니다.');
      }
      const allSteps = await stepsResponse.json();
      steps = Array.isArray(allSteps)
        ? allSteps
            .filter(function (step) { return Number(step.stepOrder) > 0; })
            .sort(function (left, right) {
              return Number(left.stepOrder) - Number(right.stepOrder);
            })
        : [];
    } catch (error) {
      console.error(error);
    }

    if (!Array.isArray(steps) || steps.length === 0) {
      steps = Array.from({ length: totalSteps }, function (_, index) {
        return { stepOrder: index + 1, stepTitle: `${index + 1}단계` };
      });
    }

    const card = document.createElement('section');
    card.className = 'home-recent-progress';

    const heading = document.createElement('div');
    heading.className = 'home-recent-progress-heading';

    const title = document.createElement('h2');
    title.textContent = scenario.scenarioTitle || '시나리오';
    heading.append(title);

    const progressSection = document.createElement('div');
    progressSection.className = 'home-sim-progress';

    const progressHeading = document.createElement('div');
    progressHeading.className = 'home-sim-progress-heading';

    const currentTitle = document.createElement('strong');
    const activeStep = steps.find(function (step) {
      return Number(step.stepOrder) === currentStep;
    });
    currentTitle.textContent = currentStep === 0
      ? '사전정보 입력'
      : (activeStep ? activeStep.stepTitle : `${currentStep}단계`);

    const currentCount = document.createElement('span');
    currentCount.textContent = `현재 ${currentStep} / ${totalSteps}단계`;
    progressHeading.append(currentTitle, currentCount);

    const progressTrack = document.createElement('div');
    progressTrack.className = 'progress home-sim-progress-track';
    progressTrack.setAttribute('role', 'progressbar');
    progressTrack.setAttribute('aria-label', '시나리오 진행률');
    progressTrack.setAttribute('aria-valuemin', '0');
    progressTrack.setAttribute('aria-valuemax', '100');
    progressTrack.setAttribute('aria-valuenow', String(Math.round(progressPercent)));

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = `${progressPercent}%`;
    progressTrack.append(progressBar);

    const stepLabels = document.createElement('ol');
    stepLabels.className = 'home-sim-step-labels';
    stepLabels.setAttribute('aria-label', '단계별 진행 상황');

    steps.forEach(function (step) {
      const stepItem = document.createElement('li');
      const stepOrder = Number(step.stepOrder);
      const status = stepOrder < currentStep
        ? 'complete'
        : (stepOrder === currentStep ? 'active' : 'upcoming');
      stepItem.className = `home-sim-step-label step-label ${status}`;
      stepItem.textContent = step.stepTitle || `${stepOrder}단계`;

      if (status === 'active') {
        stepItem.setAttribute('aria-current', 'step');
      }

      stepLabels.append(stepItem);
    });

    progressSection.append(progressHeading, progressTrack, stepLabels);
    card.append(heading, progressSection);
    mount.replaceChildren(card);
  }

  function initializePolicySearch() {
    const policyForm = document.getElementById('policySearchForm');
    if (!policyForm) return;
    const policyInput = document.getElementById('policySearchInput');
    const categories = document.getElementById('policySearchCategories');
    const results = document.getElementById('policySearchResults');
    const message = document.getElementById('policySearchMessage');
    const pagination = document.getElementById('policySearchPagination');
    const submitButton = policyForm.querySelector('[type="submit"]');
    if (!policyInput || !categories || !results || !message || !pagination) return;

    let selectedCategory = 'ALL';
    let latestRequestId = 0;

    async function loadCategories() {
      const categoriesUrl = new URL(
        policyForm.action.replace(/\/$/, '') + '/categories',
        window.location.href
      );

      try {
        const response = await fetch(categoriesUrl.toString(), {
          method: 'GET',
          credentials: 'same-origin',
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) {
          throw new Error('정책 분야 목록을 불러오지 못했습니다.');
        }

        const fields = await response.json();
        categories.replaceChildren(createCategoryButton('전체', 'ALL', true));
        (Array.isArray(fields) ? fields : []).forEach(function (field) {
          if (typeof field === 'string' && field.trim()) {
            categories.append(createCategoryButton(field.trim(), field.trim(), false));
          }
        });
      } catch (error) {
        message.textContent = error.message || '정책 분야 목록을 불러오지 못했습니다.';
      }
    }

    function createCategoryButton(label, value, active) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'policy-category-button' + (active ? ' active' : '');
      button.dataset.policyCategory = value;
      button.setAttribute('aria-pressed', String(active));
      button.textContent = label;
      return button;
    }

    async function loadPolicies(page) {
      const requestId = ++latestRequestId;
      const requestUrl = new URL(policyForm.action, window.location.href);
      requestUrl.searchParams.set('keyword', policyInput.value.trim());
      requestUrl.searchParams.set('category', selectedCategory);
      requestUrl.searchParams.set('page', String(Math.max(1, page)));
      message.textContent = '공공서비스를 검색하고 있습니다.';
      results.replaceChildren();
      results.classList.add('d-none');
      pagination.replaceChildren();

      if (submitButton) submitButton.disabled = true;

      try {
        const response = await fetch(requestUrl.toString(), {
          method: 'GET',
          credentials: 'same-origin',
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) {
          throw new Error('공공서비스 검색에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        }

        const pageData = await response.json();
        if (requestId !== latestRequestId) return;
        const items = Array.isArray(pageData.items) ? pageData.items : [];
        if (items.length === 0) {
          message.textContent = '검색 결과가 없습니다. 다른 분야나 검색어를 선택해 주세요.';
          return;
        }

        items.forEach(function (policy) {
          results.append(createPolicySearchCard(policy));
        });
        message.textContent = `검색 결과 ${pageData.totalCount}건`;
        results.classList.remove('d-none');
        renderPagination(pageData.page, pageData.totalPages);
      } catch (error) {
        if (requestId === latestRequestId) {
          message.textContent = error.message || '공공서비스 검색 중 오류가 발생했습니다.';
        }
      } finally {
        if (requestId === latestRequestId && submitButton) submitButton.disabled = false;
      }
    }

    function renderPagination(page, totalPages) {
      pagination.replaceChildren();
      if (totalPages <= 1) return;

      function appendPage(label, targetPage, disabled, active) {
        const item = document.createElement('li');
        item.className = 'page-item' + (disabled ? ' disabled' : '') + (active ? ' active' : '');

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'page-link';
        button.textContent = label;
        button.disabled = disabled;
        button.setAttribute('aria-label',
          label === '이전' || label === '다음' ? label + ' 페이지' : label + ' 페이지로 이동');
        if (active) button.setAttribute('aria-current', 'page');
        button.addEventListener('click', function () {
          loadPolicies(targetPage);
        });

        item.append(button);
        pagination.append(item);
      }

      const firstPage = Math.floor((page - 1) / 10) * 10 + 1;
      const lastPage = Math.min(firstPage + 9, totalPages);
      const previousGroupPage = firstPage - 10;
      const nextGroupPage = firstPage + 10;

      appendPage('이전', previousGroupPage, firstPage === 1, false);
      for (let number = firstPage; number <= lastPage; number += 1) {
        appendPage(String(number), number, false, number === page);
      }
      appendPage('다음', nextGroupPage, nextGroupPage > totalPages, false);
    }

    policyForm.addEventListener('submit', function (event) {
      event.preventDefault();
      loadPolicies(1);
    });

    categories.addEventListener('click', function (event) {
      const button = event.target.closest('[data-policy-category]');
      if (!button) return;

      selectedCategory = button.dataset.policyCategory;
      categories.querySelectorAll('[data-policy-category]').forEach(function (categoryButton) {
        const active = categoryButton === button;
        categoryButton.classList.toggle('active', active);
        categoryButton.setAttribute('aria-pressed', String(active));
      });
      loadPolicies(1);
    });

    loadCategories();
    loadPolicies(1);

    function createPolicySearchCard(policy) {
      const card = document.createElement('article');
      card.className = 'policy-search-result';

      const title = document.createElement('h3');
      title.textContent = policy.serviceName || '서비스명 미제공';

      const summary = document.createElement('p');
      summary.textContent = policy.summary || '자세한 내용은 공식 상세 페이지에서 확인해 주세요.';

      const target = document.createElement('p');
      target.textContent = '지원 대상: ' + (policy.target || '공식 상세 페이지에서 확인해 주세요.');

      const agency = document.createElement('p');
      agency.textContent = '소관 기관: ' + (policy.agencyName || '정보 미제공');

      const detailLink = document.createElement('a');
      detailLink.className = 'btn btn-sm btn-outline-primary align-self-start';
      detailLink.textContent = '정부 공식 상세 페이지';
      detailLink.href = safePolicyDetailUrl(policy.detailUrl);
      detailLink.target = '_blank';
      detailLink.rel = 'noopener noreferrer';

      card.append(title, summary, target, agency, detailLink);
      return card;
    }

    function safePolicyDetailUrl(value) {
      if (value) {
        try {
          const url = new URL(value);
          if (url.protocol === 'https:') {
            return url.toString();
          }
        } catch (error) {
          // 잘못된 주소는 공식 사이트로 대체합니다.
        }
      }
      return 'https://www.gov.kr/';
    }
  }

})();
