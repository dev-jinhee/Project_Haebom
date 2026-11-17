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
        haebomAlert('보안 토큰을 찾을 수 없습니다. 페이지를 새로고침해 주세요.', '로그아웃 오류');
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
        haebomAlert(error.message || '로그아웃 중 통신 오류가 발생했습니다.', '로그아웃 오류');
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

    // Keep full-screen panels and their anchor offset aligned with the sticky header.
    const header = document.querySelector('.site-header');
    const updateHeaderHeight = () => {
      if (!header) return;
      document.documentElement.style.setProperty(
        '--home-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`
      );
    };
    updateHeaderHeight();
    if (header && 'ResizeObserver' in window) {
      new ResizeObserver(updateHeaderHeight).observe(header);
    } else {
      window.addEventListener('resize', updateHeaderHeight, { passive: true });
    }

    // Snap only on roomy, non-touch desktop viewports. Tablets and short windows
    // use normal document scrolling so content cannot trap the scroll position.
    const desktopSnap = window.matchMedia(
      '(min-width: 68.01em) and (min-height: 56.26rem) and (hover: hover) and (pointer: fine)'
    );
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
    if (!section) return;
    const mapElement = document.getElementById('center-map');
    const message = document.getElementById('center-map-message');
    const sidoSelect = document.getElementById('center-sido');
    const sigunguSelect = document.getElementById('center-sigungu');
    const searchButton = document.getElementById('center-map-search');
    const listEmptyState = document.getElementById('center-list-empty-state');
    const listEmptyTitle = document.getElementById('center-list-empty-title');
    const listMessage = document.getElementById('center-list-message');
    const listResults = document.getElementById('center-list-results');
    const listPagination = document.getElementById('center-list-pagination');
    const searchApiUrl = section.dataset.searchApiUrl;
    const regionsApiUrl = section.dataset.sgisRegionApiUrl;
    const kakaoKey = (section.dataset.kakaoMapKey || '').trim();
    if (!mapElement || !message || !sidoSelect || !sigunguSelect || !searchButton
        || !listEmptyState || !listEmptyTitle || !listMessage || !listResults || !listPagination) return;

    const pageSize = 5;
    let map = null;
    let clusterer = null;
    let placeOverlay = null;
    let pendingPopupListener = null;
    let categoryMatchedMarkerImage = null;
    let otherMarkerImage = null;
    let categoryMatchedSelectedMarkerImage = null;
    let otherSelectedMarkerImage = null;
    let selectedMarker = null;
    let places = [];
    let markers = [];
    let highlightedPlaceId = '';
    let isSejong = false;
    let latestSearchId = 0;
    let searchController = null;

    sidoSelect.disabled = true;
    sigunguSelect.disabled = true;
    searchButton.disabled = true;

    function setListMessage(text, title) {
      listEmptyState.hidden = !text;
      if (title) listEmptyTitle.textContent = title;
      listMessage.textContent = text;
      listMessage.hidden = !text;
    }

    function resetList() {
      places = [];
      highlightedPlaceId = '';
      listResults.replaceChildren();
      listResults.scrollTop = 0;
      listPagination.replaceChildren();
      setListMessage('시·도와 시·군·구를 선택한 뒤 지역 조회를 눌러주세요.', '지역 센터를 찾아보세요');
    }

    function clearMarkers() {
      if (clusterer) clusterer.clear();
      markers.forEach(marker => marker.setMap(null));
      markers = [];
      selectedMarker = null;
      if (pendingPopupListener) {
        kakao.maps.event.removeListener(map, 'idle', pendingPopupListener);
        pendingPopupListener = null;
      }
      if (placeOverlay) {
        placeOverlay.setMap(null);
        placeOverlay = null;
      }
    }

    function invalidatePendingSearch() {
      latestSearchId++;
      if (searchController) {
        searchController.abort();
        searchController = null;
      }
    }

    function resetOptions(select, label) {
      select.replaceChildren(new Option(label, ''));
    }

    async function loadRegions(code) {
      const url = new URL(regionsApiUrl, window.location.origin);
      if (code) url.searchParams.set('cd', code);
      const response = await fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('행정구역 목록을 불러오지 못했습니다.');
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error('행정구역 응답 형식이 올바르지 않습니다.');
      return rows.filter(row => row && row.cd && row.addr_name);
    }

    function updateControls() {
      sidoSelect.disabled = !map || sidoSelect.options.length <= 1;
      sigunguSelect.disabled = !map || !sidoSelect.value || isSejong;
      searchButton.disabled = !map || !sidoSelect.value || (!isSejong && !sigunguSelect.value);
    }

    async function loadSidoOptions() {
      try {
        const sidos = await loadRegions();
        resetOptions(sidoSelect, '시·도를 선택하세요');
        sidos.forEach(region => sidoSelect.add(new Option(region.addr_name, region.cd)));
        sidoSelect.disabled = !map;
        if (map) message.textContent = '지역을 선택해 행정기관을 찾아보세요.';
      } catch (error) {
        console.error('SGIS 시·도 조회 오류:', error);
        message.textContent = error.message || '시·도 목록을 불러오지 못했습니다.';
      }
      updateControls();
    }

    async function loadSigunguOptions(sidoCode) {
      resetOptions(sigunguSelect, '시·군·구를 선택하세요');
      if (!sidoCode) {
        isSejong = false;
        updateControls();
        return;
      }
      const sidoName = sidoSelect.options[sidoSelect.selectedIndex]?.textContent || '';
      isSejong = sidoName.includes('세종');
      sigunguSelect.disabled = true;
      if (isSejong) {
        sigunguSelect.add(new Option('세종 전체', sidoCode));
        sigunguSelect.value = sidoCode;
        updateControls();
        return;
      }
      try {
        const regions = await loadRegions(sidoCode);
        regions.forEach(region => sigunguSelect.add(new Option(region.addr_name, region.cd)));
      } catch (error) {
        console.error('SGIS 시·군·구 조회 오류:', error);
        message.textContent = error.message || '시·군·구 목록을 불러오지 못했습니다.';
      }
      updateControls();
    }

    function getPopupPlacement(position) {
      const point = map.getProjection().containerPointFromCoords(position);
      const preferredWidth = Math.min(256, Math.max(128, mapElement.clientWidth - 48));
      const markerGap = 28;
      const rightSpace = mapElement.clientWidth - point.x - markerGap;
      const leftSpace = point.x - markerGap;
      const side = rightSpace >= preferredWidth || rightSpace >= leftSpace ? 'right' : 'left';
      const availableSpace = side === 'right' ? rightSpace : leftSpace;
      return {
        side,
        width: Math.max(128, Math.min(preferredWidth, availableSpace))
      };
    }

    function createInfoContent(place, placement) {
      const content = document.createElement('div');
      content.className = 'center-place-popup';
      content.classList.add('is-' + placement.side);
      content.style.width = placement.width + 'px';

      const card = document.createElement('div');
      card.className = 'center-place-popup-card';

      const header = document.createElement('div');
      header.className = 'center-place-popup-header';
      const title = document.createElement('strong');
      title.className = 'center-place-popup-title';
      title.textContent = place.placeName || '행정기관';
      header.append(title);

      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'center-place-popup-close';
      close.setAttribute('aria-label', '정보창 닫기');
      close.textContent = '×';
      close.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        if (placeOverlay) {
          placeOverlay.setMap(null);
          placeOverlay = null;
        }
      });
      header.append(close);
      card.append(header);

      const details = document.createElement('div');
      details.className = 'center-place-popup-details';
      const address = document.createElement('p');
      address.className = 'center-place-popup-address';
      address.textContent = place.roadAddressName || place.addressName || '주소 정보 없음';
      details.append(address);
      if (place.phone) {
        const phone = document.createElement('p');
        phone.className = 'center-place-popup-phone';
        phone.textContent = '전화번호: ' + place.phone;
        details.append(phone);
      }
      if (place.placeUrl) {
        const link = document.createElement('a');
        link.className = 'center-place-link';
        link.href = place.placeUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = '카카오맵에서 보기';
        details.append(link);
      }
      card.append(details);
      content.append(card);
      return content;
    }

    function focusPlace(place, marker, shouldPan = true) {
      if (selectedMarker && selectedMarker !== marker) {
        selectedMarker.setImage(selectedMarker.normalImage);
      }
      selectedMarker = marker;
      selectedMarker.setImage(selectedMarker.selectedImage);

      const position = marker.getPosition();
      const showPopup = () => {
        if (pendingPopupListener) {
          kakao.maps.event.removeListener(map, 'idle', pendingPopupListener);
          pendingPopupListener = null;
        }
        if (placeOverlay) placeOverlay.setMap(null);
        const placement = getPopupPlacement(position);
        placeOverlay = new kakao.maps.CustomOverlay({
          map,
          position,
          content: createInfoContent(place, placement),
          xAnchor: placement.side === 'right' ? 0 : 1,
          yAnchor: 0.5,
          zIndex: 10
        });
      };
      const currentCenter = map.getCenter();
      const needsPan = shouldPan && (Math.abs(currentCenter.getLat() - position.getLat())
        + Math.abs(currentCenter.getLng() - position.getLng()) > 0.000001);
      if (needsPan) {
        if (pendingPopupListener) kakao.maps.event.removeListener(map, 'idle', pendingPopupListener);
        pendingPopupListener = showPopup;
        kakao.maps.event.addListener(map, 'idle', pendingPopupListener);
        map.panTo(position);
      } else {
        showPopup();
      }

      highlightedPlaceId = String(place.id);
      const placeIndex = places.findIndex(item => String(item.id) === highlightedPlaceId);
      if (placeIndex >= 0) {
        renderListPage(Math.floor(placeIndex / pageSize) + 1);
      }
    }

    function createMarkerImage(color, scale = 1, selected = false) {
      const pinPath = 'M18 1C8.6 1 1 8.5 1 17.8 1 30 18 43 18 43s17-13 17-25.2C35 8.5 27.4 1 18 1z';
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">'
        + '<path d="' + pinPath + '" fill="' + color + '" stroke="'
        + (selected ? '#8DBBE8' : '#fff') + '" stroke-width="' + (selected ? '3' : '2') + '"/>'
        + '<circle cx="18" cy="18" r="5.2" fill="#fff"/></svg>';
      const src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
      const width = Math.round(36 * scale);
      const height = Math.round(44 * scale);
      return new kakao.maps.MarkerImage(src, new kakao.maps.Size(width, height), {
        offset: new kakao.maps.Point(Math.round(18 * scale), Math.round(43 * scale))
      });
    }

    function focusMapOnResults() {
      if (markers.length === 0) return;

      if (markers.length === 1) {
        map.setLevel(6);
        map.setCenter(markers[0].getPosition());
        return;
      }

      const bounds = new kakao.maps.LatLngBounds();
      markers.forEach(marker => bounds.extend(marker.getPosition()));
      map.setBounds(bounds, 48, 48, 48, 48);
    }

    function renderListPage(page) {
      const totalPages = Math.max(1, Math.ceil(places.length / pageSize));
      const currentPage = Math.min(Math.max(1, page), totalPages);
      const start = (currentPage - 1) * pageSize;
      listResults.replaceChildren();
      places.slice(start, start + pageSize).forEach(place => {
        const card = document.createElement('article');
        card.className = 'center-list-card';
        card.dataset.placeId = String(place.id);
        if (String(place.id) === highlightedPlaceId) card.classList.add('is-map-selected');
        const title = document.createElement('h4');
        title.textContent = place.placeName || '행정기관';
        const address = document.createElement('p');
        address.textContent = place.roadAddressName || place.addressName || '주소 정보 없음';
        const actions = document.createElement('div');
        actions.className = 'center-list-actions';
        const locate = document.createElement('button');
        locate.type = 'button';
        locate.className = 'btn btn-outline-primary btn-sm';
        locate.textContent = '지도에서 위치 보기';
        locate.addEventListener('click', () => {
          const marker = markers.find(item => item.placeId === String(place.id));
          if (marker) focusPlace(place, marker);
        });
        actions.append(locate);
        if (place.placeUrl) {
          const link = document.createElement('a');
          link.className = 'btn btn-primary btn-sm';
          link.href = place.placeUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = '카카오맵에서 보기';
          actions.append(link);
        }
        card.append(title, address, actions);
        listResults.append(card);
      });
      listResults.scrollTop = 0;
      const highlightedCard = Array.from(listResults.children)
        .find(card => card.dataset.placeId === highlightedPlaceId);
      if (highlightedCard) {
        const resultsTop = listResults.getBoundingClientRect().top;
        const cardRect = highlightedCard.getBoundingClientRect();
        if (cardRect.top < resultsTop || cardRect.bottom > listResults.getBoundingClientRect().bottom) {
          listResults.scrollTop += cardRect.top - resultsTop;
        }
      }
      window.renderHaebomPagination({
        container: listPagination,
        currentPage,
        totalPages,
        groupSize: 5,
        previousLabel: '이전',
        nextLabel: '다음',
        showBoundaryButtons: true,
        hideWhenSinglePage: true,
        onPageChange: renderListPage
      });
    }

    async function searchSelectedRegion() {
      if (!sidoSelect.value || (!isSejong && !sigunguSelect.value)) return;
      const searchId = ++latestSearchId;
      if (searchController) searchController.abort();
      searchController = new AbortController();
      clearMarkers();
      resetList();
      searchButton.disabled = true;
      // 결과 안내 문구가 사라져도 한 줄 높이를 유지해 지도와 목록이 움직이지 않도록 합니다.
      message.textContent = '\u00a0';
      setListMessage('');
      const loading = window.HaebomLoading;
      if (loading) loading.show('지역 정보를 조회하고 있어요', '잠시만 기다려 주세요.');
      try {
        const url = new URL(searchApiUrl, window.location.origin);
        url.searchParams.set('sidoCode', sidoSelect.value);
        if (!isSejong) url.searchParams.set('sigunguCode', sigunguSelect.value);
        const response = await fetch(url, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
          signal: searchController.signal
        });
        if (!response.ok) {
          if (response.status === 429) throw new Error('검색 요청이 많아 잠시 중단됐습니다. 잠시 후 다시 시도해 주세요.');
          if (response.status === 503) throw new Error('카카오 API 키 또는 권한 설정을 확인해 주세요.');
          throw new Error('행정기관 검색에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        }
        const result = await response.json();
        if (searchId !== latestSearchId) return;
        places = Array.isArray(result.places) ? result.places : [];
        markers = places.map(place => {
          const isCategoryMatched = Boolean(place.administrativeCategoryMatched);
          const normalImage = isCategoryMatched ? categoryMatchedMarkerImage : otherMarkerImage;
          const selectedImage = isCategoryMatched
            ? categoryMatchedSelectedMarkerImage : otherSelectedMarkerImage;
          const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(Number(place.y), Number(place.x)),
            title: place.placeName || '행정기관',
            image: normalImage
          });
          marker.placeId = String(place.id);
          marker.normalImage = normalImage;
          marker.selectedImage = selectedImage;
          kakao.maps.event.addListener(marker, 'click', () => focusPlace(place, marker, false));
          return marker;
        });
        clusterer.clear();
        clusterer.addMarkers(markers);
        focusMapOnResults();
        if (places.length === 0) setListMessage('다른 지역을 선택해 다시 조회해 주세요.', '검색 결과가 없습니다');
        else {
          setListMessage('');
          renderListPage(1);
        }
        const sidoName = sidoSelect.options[sidoSelect.selectedIndex].textContent;
        const sigunguName = isSejong ? '' : ' ' + sigunguSelect.options[sigunguSelect.selectedIndex].textContent;
        const notices = [];
        if (Number(result.failedQueryCount) > 0) {
          notices.push('일시 오류로 실패한 검색어 ' + result.failedQueryCount + '개');
        }
        if (result.rateLimited) notices.push('요청 제한으로 남은 검색을 중단함');
        const partial = notices.length > 0 ? ' 일부 결과입니다. ' + notices.join(', ') + '.' : '';
        message.textContent = sidoName + sigunguName + ' 검색 결과 ' + places.length + '건입니다.' + partial;
      } catch (error) {
        if (error.name === 'AbortError' || searchId !== latestSearchId) return;
        console.error('Kakao 행정기관 검색 오류:', error);
        setListMessage(error.message || '검색 중 오류가 발생했습니다.', '검색을 완료하지 못했습니다');
        message.textContent = error.message || '검색 중 오류가 발생했습니다.';
      } finally {
        if (loading) loading.hide();
        if (searchId === latestSearchId) updateControls();
      }
    }

    sidoSelect.addEventListener('change', async () => {
      invalidatePendingSearch();
      clearMarkers();
      resetList();
      message.textContent = '지역을 선택해 행정기관을 찾아보세요.';
      await loadSigunguOptions(sidoSelect.value);
      updateControls();
    });
    sigunguSelect.addEventListener('change', () => {
      invalidatePendingSearch();
      clearMarkers();
      resetList();
      message.textContent = '지역을 선택해 행정기관을 찾아보세요.';
      updateControls();
    });
    searchButton.addEventListener('click', searchSelectedRegion);

    if (!kakaoKey) {
      message.textContent = '카카오 지도 JavaScript 키가 설정되지 않았습니다.';
      loadSidoOptions();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey='
      + encodeURIComponent(kakaoKey) + '&libraries=clusterer&autoload=false';
    script.async = true;
    script.onload = () => {
      if (!window.kakao || !window.kakao.maps) {
        message.textContent = '카카오 지도 SDK를 불러오지 못했습니다. 키와 도메인 설정을 확인해 주세요.';
        return;
      }
      window.kakao.maps.load(() => {
        map = new kakao.maps.Map(mapElement, {
          center: new kakao.maps.LatLng(36.5, 127.8),
          level: 13
        });
        clusterer = new kakao.maps.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 8,
          disableClickZoom: false
        });
        categoryMatchedMarkerImage = createMarkerImage('#1676d2');
        otherMarkerImage = createMarkerImage('#202833', 0.7);
        categoryMatchedSelectedMarkerImage = createMarkerImage('#1676d2', 1.15, true);
        otherSelectedMarkerImage = createMarkerImage('#202833', 0.85, true);
        loadSidoOptions();
        updateControls();
      });
    };
    script.onerror = () => {
      message.textContent = '카카오 지도 SDK를 불러오지 못했습니다. 네트워크와 도메인 설정을 확인해 주세요.';
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
      results.setAttribute('aria-busy', 'true');

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
          results.replaceChildren();
          results.classList.add('d-none');
          pagination.replaceChildren();
          message.textContent = '검색 결과가 없습니다. 다른 분야나 검색어를 선택해 주세요.';
          return;
        }

        const resultCards = document.createDocumentFragment();
        items.forEach(function (policy) {
          resultCards.append(createPolicySearchCard(policy));
        });
        results.replaceChildren(resultCards);
        message.textContent = `검색 결과 ${pageData.totalCount}건`;
        results.classList.remove('d-none');
        renderPagination(pageData.page, pageData.totalPages);
      } catch (error) {
        if (requestId === latestRequestId) {
          results.replaceChildren();
          results.classList.add('d-none');
          pagination.replaceChildren();
          message.textContent = error.message || '공공서비스 검색 중 오류가 발생했습니다.';
        }
      } finally {
        if (requestId === latestRequestId) {
          results.removeAttribute('aria-busy');
        }
      }
    }

    function renderPagination(page, totalPages) {
      window.renderHaebomPagination({
        container: pagination,
        currentPage: page,
        totalPages: totalPages,
        groupSize: 5,
        previousLabel: '이전',
        nextLabel: '다음',
        showBoundaryButtons: true,
        bootstrap: false,
        hideWhenSinglePage: true,
        onPageChange: loadPolicies
      });
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
