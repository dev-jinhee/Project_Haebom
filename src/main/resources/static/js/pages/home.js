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

  initializeHomeSectionNavigation();
  initializePolicySearch();
  initializeAdministrativeCenterMap();

  function initializeHomeSectionNavigation() {
    const panels = Array.from(document.querySelectorAll('.home-panel[id]'));
    const navigationLinks = Array.from(document.querySelectorAll('[data-home-nav]'));
    const dotLinks = Array.from(document.querySelectorAll('[data-home-dot]'));
    if (panels.length === 0) return;

    const desktopSnap = window.matchMedia('(min-width: 768px)');
    function updateSnapMode() {
      document.documentElement.classList.toggle('home-snap-enabled', desktopSnap.matches);
    }
    updateSnapMode();
    desktopSnap.addEventListener?.('change', updateSnapMode);

    function setActiveSection(id) {
      navigationLinks.forEach(link => {
        const active = link.dataset.homeNav === id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      dotLinks.forEach(link => {
        const active = link.dataset.homeDot === id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { threshold: [0.05, 0.2, 0.4, 0.6], rootMargin: '-12% 0px -28% 0px' });
    panels.forEach(panel => observer.observe(panel));

    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target || !target.classList.contains('home-panel')) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', link.getAttribute('href'));
        setActiveSection(target.id);
      });
    });

    const initialPanel = panels.find(panel => `#${panel.id}` === window.location.hash);
    if (initialPanel) {
      window.requestAnimationFrame(() => initialPanel.scrollIntoView({ block: 'start' }));
      setActiveSection(initialPanel.id);
    }
  }

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
    const regionSearchButton = document.getElementById('center-map-search');
    const centerList = document.getElementById('center-list');
    const centerListEmptyState = document.getElementById('center-list-empty-state');
    const centerListMessage = document.getElementById('center-list-message');
    const centerListResults = document.getElementById('center-list-results');
    const centerListPagination = document.getElementById('center-list-pagination');
    const apiKey = (section.dataset.mapKey || '').trim();
    const centersApiUrl = section.dataset.apiUrl;
    const sidoApiUrl = section.dataset.sidoApiUrl;
    const sigunguApiUrl = section.dataset.sigunguApiUrl;
    const dataFreshnessMessage = '주소 자료는 행정안전부 읍면동 하부행정기관 현황(2025년 12월 31일 기준)이며, 이후 변경 사항은 반영되지 않았을 수 있습니다.';
    if (!mapElement || !message || !sidoSelect || !sigunguSelect || !regionSearchButton
        || !centerList || !centerListEmptyState || !centerListMessage
        || !centerListResults || !centerListPagination) return;

    let regionsLoaded = false;
    let regionsLoadFailed = false;
    let mapReady = false;
    let clustererLoaded = false;
    let centersLoaded = false;
    let centerData = [];
    let mapCenterData = [];
    let centerMarkers = [];
    let centerClusterer = null;
    let centerInfoWindow = null;
    let centerPopupOpen = false;
    let activeCenterMarker = null;
    let regionCenterData = [];
    let regionCenterLabel = '';
    let regionCenterPage = 1;
    let regionRequestId = 0;
    let centerLoadPromise = null;
    let regionSearchRequested = false;
    let centerMarkerIcon = null;
    const CENTER_LIST_PAGE_SIZE = 5;
    const CENTER_LIST_PAGE_GROUP_SIZE = 5;

    function getCenterMarkerIcon() {
      if (centerMarkerIcon) return centerMarkerIcon;
      centerMarkerIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">' +
          '<path d="M20 1C9.5 1 1 9.5 1 20c0 14.2 19 31 19 31s19-16.8 19-31C39 9.5 30.5 1 20 1Z" fill="#1769aa" stroke="#fff" stroke-width="2"/>' +
          '<path d="M12 29h16M14.5 28V18.5L20 15l5.5 3.5V28M17.5 21v1m5-1v1m-5 3v3m5-3v3" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/>' +
          '</svg>'
        )}`,
        scaledSize: new google.maps.Size(28, 36),
        anchor: new google.maps.Point(14, 35)
      };
      return centerMarkerIcon;
    }

    sidoSelect.disabled = true;
    sigunguSelect.disabled = true;

    function updateRegionControls() {
      sidoSelect.disabled = !regionsLoaded || !mapReady;
      sigunguSelect.disabled = !regionsLoaded || !mapReady || !sidoSelect.value;
      regionSearchButton.disabled = !regionsLoaded || !mapReady;
    }

    function resetSelect(select, placeholder) {
      select.replaceChildren(new Option(placeholder, ''));
    }

    async function fetchRegionNames(apiUrl, sido) {
      const url = new URL(apiUrl, window.location.origin);
      if (sido) url.searchParams.set('sido', sido);
      const response = await fetch(url, { credentials: 'same-origin' });
      if (!response.ok) throw new Error('행정복지센터 기준 지역 목록 조회에 실패했습니다.');
      const names = await response.json();
      if (!Array.isArray(names)) throw new Error('지역 목록 응답 형식이 올바르지 않습니다.');
      return names.filter(name => typeof name === 'string' && name.trim());
    }

    async function loadSidoOptions() {
      const requestId = ++regionRequestId;
      message.textContent = '시·도 목록을 불러오는 중입니다.';
      try {
        const sidos = await fetchRegionNames(sidoApiUrl);
        if (requestId !== regionRequestId || !section.isConnected) return;
        resetSelect(sidoSelect, '시·도를 선택하세요');
        sidos.forEach(sido => sidoSelect.add(new Option(sido, sido)));
        regionsLoaded = true;
        regionsLoadFailed = false;
        updateRegionControls();
        if (mapReady && !centersLoaded) message.textContent = '';
      } catch (error) {
        console.error('시·도 조회 오류:', error);
        if (requestId === regionRequestId) {
          regionsLoadFailed = true;
          message.textContent = '시·도 목록을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.';
        }
      }
    }

    function clearCenterMarkerLayer(markerToKeep = null) {
      if (centerClusterer) {
        centerClusterer.clearMarkers();
        centerClusterer.setMap(null);
        centerClusterer = null;
      }
      centerMarkers.forEach(marker => {
        if (marker !== markerToKeep) marker.setMap(null);
      });
      centerMarkers = markerToKeep ? [markerToKeep] : [];
      if (markerToKeep) markerToKeep.setMap(administrativeCenterMap);
    }

    function clearCenterMarkers() {
      centerPopupOpen = false;
      activeCenterMarker = null;
      clearCenterMarkerLayer();
      if (centerInfoWindow) centerInfoWindow.close();
    }

    function clearMarkersForMapGesture() {
      clearCenterMarkerLayer(centerPopupOpen ? activeCenterMarker : null);
    }

    function focusMapOnSelectedRegion(selectedCenters) {
      if (!administrativeCenterMap || selectedCenters.length === 0) return;

      if (selectedCenters.length === 1) {
        administrativeCenterMap.setCenter({
          lat: selectedCenters[0].latitude,
          lng: selectedCenters[0].longitude
        });
        administrativeCenterMap.setZoom(sigunguSelect.value ? 13 : 9);
        return;
      }

      const bounds = new google.maps.LatLngBounds();
      selectedCenters.forEach(center => bounds.extend({
        lat: center.latitude,
        lng: center.longitude
      }));
      administrativeCenterMap.fitBounds(bounds, 40);
    }

    function renderCenterListForSelectedRegion(selectedCenters) {
      const sidoName = sidoSelect.value
        ? sidoSelect.selectedOptions[0]?.textContent?.trim()
        : '';
      const sigunguName = sigunguSelect.value
        ? sigunguSelect.selectedOptions[0]?.textContent?.trim()
        : '';

      if (!sidoName) {
        regionCenterData = [];
        regionCenterLabel = '';
        centerListEmptyState.hidden = false;
        centerListMessage.textContent = '시·도를 선택한 뒤 지역 조회를 눌러주세요.';
        centerListResults.replaceChildren();
        centerListPagination.replaceChildren();
        return;
      }

      regionCenterLabel = sidoName + (sigunguName ? ' ' + sigunguName : '');
      regionCenterData = selectedCenters;
      regionCenterPage = 1;
      renderCenterListPage(regionCenterPage);
    }

    async function fetchCentersByRegion(sido, sigungu) {
      const url = new URL(centersApiUrl, window.location.origin);
      url.searchParams.set('sido', sido);
      if (sigungu) url.searchParams.set('sigungu', sigungu);
      const response = await fetch(url, { credentials: 'same-origin' });
      if (!response.ok) throw new Error('선택한 지역의 행정복지센터 조회에 실패했습니다.');
      const centers = await response.json();
      if (!Array.isArray(centers)) throw new Error('행정복지센터 응답 형식이 올바르지 않습니다.');
      return centers.map(center => {
        const lat = Number(center.latitude);
        const lng = Number(center.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng) ||
            lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
        return { ...center, latitude: lat, longitude: lng };
      }).filter(Boolean);
    }

    function focusMapOnCenter(center) {
      if (!administrativeCenterMap || !center) return;

      centerPopupOpen = false;
      activeCenterMarker = null;
      if (centerInfoWindow) centerInfoWindow.close();

      const position = {
        lat: center.latitude,
        lng: center.longitude
      };

      const openCenterInfoWindow = () => {
        const marker = centerMarkers.find(item =>
          String(item.centerId) === String(center.centerId));
        if (!marker) return false;
        google.maps.event.trigger(marker, 'click');
        return true;
      };

      if (administrativeCenterMap.getZoom() >= 15 && openCenterInfoWindow()) {
        return;
      }

      let idleListener;
      idleListener = administrativeCenterMap.addListener('idle', () => {
        google.maps.event.removeListener(idleListener);
        if (!openCenterInfoWindow()) {
          renderVisibleCenters();
          openCenterInfoWindow();
        }
      });

      administrativeCenterMap.setZoom(15);
      administrativeCenterMap.setCenter(position);
    }

    function renderCenterListPage(requestedPage) {
      const totalCount = regionCenterData.length;
      const totalPages = Math.ceil(totalCount / CENTER_LIST_PAGE_SIZE);

      centerListResults.replaceChildren();
      centerListPagination.replaceChildren();

      if (totalCount === 0) {
        centerListEmptyState.hidden = false;
        centerListMessage.textContent =
          regionCenterLabel + ' 지역에 표시할 행정복지센터가 없습니다.';
        return;
      }

      centerListEmptyState.hidden = true;

      regionCenterPage = Math.min(Math.max(requestedPage, 1), totalPages);
      const start = (regionCenterPage - 1) * CENTER_LIST_PAGE_SIZE;
      const pageItems = regionCenterData.slice(start, start + CENTER_LIST_PAGE_SIZE);

      pageItems.forEach(center => {
        const card = document.createElement('article');
        card.className = 'center-list-card';

        const title = document.createElement('h4');
        title.textContent = center.centerName || '행정복지센터';

        const address = document.createElement('p');
        address.textContent = center.address || '주소 정보 없음';
        if (center.address && center.postalCode) {
          address.textContent += ' (우편번호 ' + center.postalCode + ')';
        }

        const actions = document.createElement('div');
        actions.className = 'center-list-actions';

        const mapButton = document.createElement('button');
        mapButton.type = 'button';
        mapButton.className = 'btn btn-sm btn-outline-primary';
        mapButton.textContent = '지도에서 위치 보기';
        mapButton.addEventListener('click', () => focusMapOnCenter(center));

        const directionsLink = document.createElement('a');
        directionsLink.className = 'btn btn-sm btn-primary';
        directionsLink.href = 'https://www.google.com/maps/dir/?api=1&destination='
          + encodeURIComponent(center.latitude + ',' + center.longitude);
        directionsLink.target = '_blank';
        directionsLink.rel = 'noopener noreferrer';
        directionsLink.textContent = '길찾기';

        actions.append(mapButton, directionsLink);
        card.append(title, address, actions);
        centerListResults.append(card);
      });

      renderCenterListPagination(regionCenterPage, totalPages);
    }

    function renderCenterListPagination(page, totalPages) {
      centerListPagination.replaceChildren();
      if (totalPages <= 1) return;

      function appendPage(label, targetPage, disabled, active) {
        const item = document.createElement('li');
        item.className = 'page-item'
          + (disabled ? ' disabled' : '')
          + (active ? ' active' : '');

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'page-link';
        button.textContent = label;
        button.disabled = disabled;
        if (active) button.setAttribute('aria-current', 'page');
        button.addEventListener('click', () => renderCenterListPage(targetPage));

        item.append(button);
        centerListPagination.append(item);
      }

      const firstPage =
        Math.floor((page - 1) / CENTER_LIST_PAGE_GROUP_SIZE)
          * CENTER_LIST_PAGE_GROUP_SIZE + 1;
      const lastPage = Math.min(
        firstPage + CENTER_LIST_PAGE_GROUP_SIZE - 1,
        totalPages
      );
      const previousGroupPage = firstPage - CENTER_LIST_PAGE_GROUP_SIZE;
      const nextGroupPage = firstPage + CENTER_LIST_PAGE_GROUP_SIZE;

      appendPage('이전', previousGroupPage, firstPage === 1, false);
      for (let number = firstPage; number <= lastPage; number += 1) {
        appendPage(String(number), number, false, number === page);
      }
      appendPage('다음', nextGroupPage, nextGroupPage > totalPages, false);
    }

    function createCenterMarker(center) {
      const marker = new google.maps.Marker({
        position: { lat: center.latitude, lng: center.longitude },
        title: center.centerName || '행정복지센터',
        icon: getCenterMarkerIcon()
      });
      marker.centerId = String(center.centerId);
      marker.addListener('click', () => {
        const header = document.createElement('div');
        header.className = 'center-place-popup-header';
        header.textContent = center.centerName || '행정복지센터';

        const content = document.createElement('div');
        content.className = 'center-place-popup';
        const address = document.createElement('p');
        address.textContent = center.address || '주소 정보 없음';
        if (center.address && center.postalCode) {
          address.textContent += ` (우편번호 ${center.postalCode})`;
        }
        content.append(address);

        const placeStatus = document.createElement('p');
        placeStatus.textContent = '추가 장소 정보를 불러오는 중입니다.';
        content.append(placeStatus);
        centerInfoWindow.setHeaderContent(header);
        centerInfoWindow.setHeaderDisabled(false);
        centerInfoWindow.setContent(content);
        activeCenterMarker = marker;
        centerPopupOpen = true;
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

              const weekOrder = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
              const hoursByDay = new Map();
              const ungroupedHours = [];
              place.weekdayDescriptions.forEach(description => {
                const separator = description.indexOf(':');
                const day = separator >= 0
                  ? description.slice(0, separator).trim()
                  : '';
                const time = separator >= 0
                  ? description.slice(separator + 1).trim()
                  : description;
                if (weekOrder.includes(day)) {
                  if (!hoursByDay.has(day)) hoursByDay.set(day, time);
                } else {
                  ungroupedHours.push({ day, time });
                }
              });

              const appendHoursRow = (day, time) => {
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
              };

              const weekdays = weekOrder.slice(0, 5).map(day => hoursByDay.get(day));
              const weekend = weekOrder.slice(5).map(day => hoursByDay.get(day));
              const hasCompleteWeek = [...weekdays, ...weekend].every(time => time != null);
              const weekdaysMatch = weekdays.every(time => time === weekdays[0]);
              const weekendMatches = weekend.every(time => time === weekend[0]);

              if (hasCompleteWeek && weekdaysMatch && weekendMatches
                  && ungroupedHours.length === 0) {
                appendHoursRow('평일', weekdays[0]);
                appendHoursRow('주말', weekend[0]);
              } else {
                const dailyHours = document.createElement('details');
                dailyHours.className = 'center-place-hours-details';
                const summary = document.createElement('summary');
                summary.textContent = '요일별 운영시간 보기';
                dailyHours.append(summary);

                weekOrder.forEach(day => {
                  if (hoursByDay.has(day)) {
                    const row = document.createElement('div');
                    row.className = 'center-place-hours-row';
                    const dayLabel = document.createElement('span');
                    dayLabel.className = 'center-place-hours-day';
                    dayLabel.textContent = day;
                    const timeLabel = document.createElement('span');
                    timeLabel.className = 'center-place-hours-time';
                    timeLabel.textContent = hoursByDay.get(day);
                    row.append(dayLabel, timeLabel);
                    dailyHours.append(row);
                  }
                });
                ungroupedHours.forEach(({ day, time }) => {
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
                  dailyHours.append(row);
                });
                hours.append(dailyHours);
              }
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

      const markerToKeep = centerPopupOpen ? activeCenterMarker : null;
      clearCenterMarkerLayer(markerToKeep);
      const visibleCenters = mapCenterData.filter(center =>
        bounds.contains({ lat: center.latitude, lng: center.longitude })
        && (!markerToKeep || String(center.centerId) !== markerToKeep.centerId));
      const visibleMarkers = visibleCenters.map(createCenterMarker);
      centerMarkers = markerToKeep
        ? [...visibleMarkers, markerToKeep]
        : visibleMarkers;

      if (visibleMarkers.length === 0) {
        message.textContent = dataFreshnessMessage;
        return;
      }

      if (clustererLoaded && window.markerClusterer?.MarkerClusterer) {
        const clusterOptions = {
          map: administrativeCenterMap,
          markers: visibleMarkers,
          renderer: {
            render({ count, position }) {
              const scale = count >= 100 ? 22 : count >= 10 ? 19 : 16;
              return new google.maps.Marker({
                position,
                zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
                title: `${count}개 행정복지센터`,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: '#1769aa',
                  fillOpacity: 0.97,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                  scale
                },
                label: {
                  text: String(count),
                  color: '#ffffff',
                  fontSize: count >= 100 ? '11px' : '12px',
                  fontWeight: '700'
                }
              });
            }
          }
        };
        if (window.markerClusterer.SuperClusterAlgorithm) {
          clusterOptions.algorithm = new window.markerClusterer.SuperClusterAlgorithm({
            radius: 150,
            maxZoom: 14
          });
        }
        centerClusterer = new window.markerClusterer.MarkerClusterer(clusterOptions);
      } else {
        visibleMarkers.forEach(marker => marker.setMap(administrativeCenterMap));
      }
      if (markerToKeep) markerToKeep.setMap(administrativeCenterMap);

      message.textContent = dataFreshnessMessage;
    }

    async function loadCentersForSelection() {
      if (!mapReady) return;
      if (centersLoaded) return;
      if (centerLoadPromise) {
        await centerLoadPromise;
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
          if (!regionSearchRequested) mapCenterData = centerData;
          centersLoaded = true;
          if (centerData.length === 0) {
            message.textContent = '지도에 표시할 좌표가 등록된 행정복지센터가 없습니다.';
            return;
          }

          if (!regionSearchRequested) {
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
      if (!sidoSelect.value) {
        message.textContent = '';
        return;
      }

      const requestId = ++regionRequestId;
      const selectedSido = sidoSelect.value;
      message.textContent = '시·군·구 목록을 불러오는 중입니다.';
      try {
        const sigungus = await fetchRegionNames(sigunguApiUrl, selectedSido);
        if (requestId !== regionRequestId || sidoSelect.value !== selectedSido || !section.isConnected) return;
        resetSelect(sigunguSelect, '시·군·구를 선택하세요');
        sigungus.forEach(sigungu => sigunguSelect.add(new Option(sigungu, sigungu)));
        sigunguSelect.disabled = sigungus.length === 0;
        if (sigungus.length === 0) message.textContent = '선택한 시·도에 등록된 시·군·구가 없습니다.';
        else message.textContent = '';
      } catch (error) {
        console.error('시·군·구 조회 오류:', error);
        if (requestId === regionRequestId) message.textContent = '시·군·구 목록을 불러오지 못했습니다.';
      }
    });

    sigunguSelect.addEventListener('change', () => {
      message.textContent = '';
    });

    regionSearchButton.addEventListener('click', async () => {
      if (!sidoSelect.value) {
        message.textContent = '먼저 시·도를 선택해 주세요.';
        sidoSelect.focus();
        return;
      }

      regionSearchRequested = true;
      const sido = sidoSelect.value;
      const sigungu = sigunguSelect.value;
      const regionLabel = sidoSelect.selectedOptions[0]?.textContent?.trim()
        + (sigungu ? ' ' + sigunguSelect.selectedOptions[0]?.textContent?.trim() : '');
      regionSearchButton.disabled = true;
      message.textContent = `${regionLabel} 행정복지센터를 조회하는 중입니다.`;
      try {
        const selectedCenters = await fetchCentersByRegion(sido, sigungu);
        if (!section.isConnected || sidoSelect.value !== sido || sigunguSelect.value !== sigungu) return;
        mapCenterData = selectedCenters;
        clearCenterMarkers();
        if (selectedCenters.length === 0) {
          regionCenterData = [];
          regionCenterLabel = regionLabel;
          regionCenterPage = 1;
          renderCenterListPage(regionCenterPage);
          message.textContent = `${regionLabel} 지역에 좌표가 등록된 행정복지센터가 없습니다.`;
          return;
        }
        focusMapOnSelectedRegion(selectedCenters);
        renderVisibleCenters();
        renderCenterListForSelectedRegion(selectedCenters);
        message.textContent = dataFreshnessMessage;
      } catch (error) {
        console.error('지역별 행정복지센터 조회 오류:', error);
        message.textContent = '선택한 지역의 행정복지센터를 조회하지 못했습니다. 다시 시도해 주세요.';
      } finally {
        updateRegionControls();
      }
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
      administrativeCenterMap.addListener('zoom_changed', clearMarkersForMapGesture);
      administrativeCenterMap.addListener('dragstart', clearMarkersForMapGesture);
      centerInfoWindow = new google.maps.InfoWindow({ maxWidth: 360 });
      centerInfoWindow.addListener('closeclick', () => {
        centerPopupOpen = false;
        activeCenterMarker = null;
        renderVisibleCenters();
      });

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
      rank.textContent = `${currentIndex + 1}위`;
      const category = document.createElement('span');
      category.className = 'popular-scenario-category';
      category.textContent = item.categoryLabel || item.categoryName || '행정절차';
      eyebrow.append(rank, category);

      const title = document.createElement('h3');
      title.textContent = item.scenarioTitle || '시나리오';
      const description = document.createElement('p');
      description.textContent = getScenarioSummary(item.description);

      const duration = document.createElement('p');
      duration.className = 'popular-scenario-duration';
      const minutes = Number(item.estimatedMinutes);
      duration.textContent = Number.isFinite(minutes) && minutes > 0
        ? `약 ${minutes}분`
        : '학습용 시뮬레이션';
      copy.append(eyebrow, title, description);

      const actions = document.createElement('div');
      actions.className = 'popular-scenario-actions';
      const startButton = document.createElement('button');
      startButton.className = 'btn btn-light rounded-pill';
      startButton.type = 'button';
      startButton.textContent = loggedIn ? '연습 시작' : '로그인하고 연습하기';
      startButton.addEventListener('click', function () {
        startScenario(item.scenarioId, startButton);
      });
      actions.append(duration, startButton);

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

  function getScenarioSummary(value) {
    const fallback = '단계별 행정절차를 미리 연습해 보세요.';
    if (typeof value !== 'string' || value.trim() === '') return fallback;
    // 첫 문단은 민원 절차 소개, 다음 문단은 해봄 시뮬레이션 설명입니다.
    return value.split(/\r?\n/).map(text => text.trim()).find(Boolean) || fallback;
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
    const mainUrl = new URL(mainApiUrl, window.location.href);
    const contextPath = mainUrl.pathname.replace(/\/api\/main\/?$/, '');

    let steps = [];
    try {
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

    const progressSection = document.createElement('div');
    progressSection.className = 'home-sim-progress';

    const progressHeading = document.createElement('div');
    progressHeading.className = 'home-sim-progress-heading';

    const scenarioTitle = document.createElement('strong');
    scenarioTitle.textContent = scenario.scenarioTitle || '시나리오';

    const currentCount = document.createElement('span');
    currentCount.textContent = `${currentStep} / ${totalSteps}단계`;
    progressHeading.append(scenarioTitle, currentCount);

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
    card.append(progressSection);

    if (Number.isInteger(Number(progress.progressId)) && Number(progress.progressId) > 0) {
      const continueRow = document.createElement('div');
      continueRow.className = 'home-recent-progress-continue';

      const continueLink = document.createElement('a');
      continueLink.className = 'home-recent-progress-continue-link';
      continueLink.href = `${contextPath}/simulation`;
      continueLink.textContent = '이어서 연습하기';
      continueLink.setAttribute('aria-label', `${scenario.scenarioTitle || '시나리오'} 이어서 연습하기`);
      continueLink.addEventListener('click', function () {
        window.sessionStorage.setItem('progressId', String(progress.progressId));
      });

      const arrow = document.createElement('span');
      arrow.className = 'material-symbols-outlined';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = 'arrow_forward';
      continueLink.append(arrow);
      continueRow.append(continueLink);
      card.append(continueRow);
    }

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

      const actions = document.createElement('div');
      actions.className = 'policy-search-result-actions';
      actions.append(detailLink);

      card.append(title, summary, target, agency, actions);
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
