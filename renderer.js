// 初期表示：東京駅付近
const map = L.map('map').setView([35.681236, 139.767125], 13);

// OSMタイル
const tiles = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
);
tiles.addTo(map);

// クリックでマーカー追加＆座標表示
map.on('click', (e) => {
  const { lat, lng } = e.latlng;
  L.marker([lat, lng]).addTo(map)
    .bindPopup(`緯度: ${lat.toFixed(6)}<br>経度: ${lng.toFixed(6)}`)
    .openPopup();
});

// 住所検索（Nominatim を簡易利用）
const qEl = document.getElementById('q');
const btnSearch = document.getElementById('btnSearch');
const statusEl = document.getElementById('status');

async function geocode(q) {
  statusEl.textContent = '検索中…';
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'json');
    url.searchParams.set('q', q);
    url.searchParams.set('limit', '5');
    // 使いすぎ注意（Nominatimの利用規約に従ってください）
    const res = await fetch(url.toString(), {
      headers: {
        // 簡易的な識別（本番ではあなたのアプリ名やURLを入れてください）
        'User-Agent': 'leaflet-map-app/1.0 (example)'
      }
    });
    const json = await res.json();
    statusEl.textContent = json.length ? `${json.length}件ヒット` : '見つかりませんでした';
    return json;
  } catch (err) {
    console.error(err);
    statusEl.textContent = '検索でエラーが発生しました';
    return [];
  }
}

btnSearch.addEventListener('click', async () => {
  const q = qEl.value.trim();
  if (!q) return;
  const results = await geocode(q);
  if (results.length) {
    const { lat, lon, display_name } = results[0];
    map.setView([+lat, +lon], 16);
    L.marker([+lat, +lon]).addTo(map)
      .bindPopup(display_name)
      .openPopup();
  }
});

// Enterで検索
qEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnSearch.click();
});

// 現在地へ移動（ブラウザのGeolocation API）
document.getElementById('btnLocate').addEventListener('click', () => {
  statusEl.textContent = '現在地を取得中…';
  map.locate({ setView: true, maxZoom: 16 });
});

map.on('locationfound', (e) => {
  statusEl.textContent = '現在地を表示しました';
  L.circleMarker(e.latlng, { radius: 8 }).addTo(map).bindPopup('現在地');
});

map.on('locationerror', () => {
  statusEl.textContent = '現在地を取得できませんでした';
});

// 「現在地」ボタン
document.getElementById('btnLocate').addEventListener('click', () => {
  statusEl.textContent = '現在地を取得中…';
  // Geolocation APIを利用して現在地を取得
  map.locate({ setView: true, maxZoom: 16 });
});

// 成功した場合
map.on('locationfound', (e) => {
  statusEl.textContent = '現在地を表示しました';
  L.circleMarker(e.latlng, { radius: 8 }).addTo(map).bindPopup('現在地');
});

// 失敗した場合（権限NGなど）
map.on('locationerror', () => {
  statusEl.textContent = '現在地を取得できませんでした';
});
