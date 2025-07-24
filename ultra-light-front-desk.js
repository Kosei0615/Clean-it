// Check access
const user = JSON.parse(localStorage.getItem('currentUser'));
if (!user || user.role !== 'front-desk') {
    location.href = 'index.html';
}

// Elements
const form = document.getElementById('guestForm');
const roomSelect = document.getElementById('roomNumber');
const checkInInput = document.getElementById('checkInDate');
const stayDaysInput = document.getElementById('stayDays');
const roomStatus = document.getElementById('roomStatus');
const totalDisplay = document.getElementById('totalGuests');

// Update total guests (optimized)
function updateTotal() {
    const total = ['adultMen', 'adultWomen', 'children', 'infants']
        .reduce((sum, id) => sum + (+document.getElementById(id).value || 0), 0);
    totalDisplay.textContent = `合計: ${total}名`;
}

// Check room availability (optimized)
function checkRoom() {
    const room = roomSelect.value;
    const checkIn = checkInInput.value;
    const days = +stayDaysInput.value || 1;
    
    if (!room || !checkIn) {
        roomStatus.style.display = 'none';
        return;
    }
    
    const guests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
    const start = new Date(checkIn);
    const end = new Date(start.getTime() + days * 86400000); // milliseconds
    
    const conflict = guests.find(g => {
        if (g.roomNumber !== room) return false;
        const gStart = new Date(g.checkInDate);
        const gEnd = new Date(gStart.getTime() + g.stayDays * 86400000);
        return start < gEnd && end > gStart;
    });
    
    roomStatus.style.display = 'block';
    if (conflict) {
        roomStatus.className = 'room-status room-conflict';
        roomStatus.textContent = `⚠️ 予約済み: ${conflict.guestName}様`;
    } else {
        roomStatus.className = 'room-status room-available';
        roomStatus.textContent = '✅ 利用可能';
    }
}

// Event listeners (minimal)
['adultMen', 'adultWomen', 'children', 'infants'].forEach(id => {
    document.getElementById(id).onchange = updateTotal;
});

roomSelect.onchange = checkRoom;
checkInInput.onchange = checkRoom;
stayDaysInput.onchange = checkRoom;

// Form submission (optimized)
form.onsubmit = (e) => {
    e.preventDefault();
    
    if (roomStatus.classList.contains('room-conflict')) {
        alert('⚠️ この部屋は予約済みです');
        return;
    }
    
    const data = {
        id: Date.now(),
        guestName: document.getElementById('guestName').value,
        checkInDate: checkInInput.value,
        stayDays: +stayDaysInput.value,
        roomNumber: roomSelect.value,
        region: document.getElementById('region').value,
        bookingSource: document.getElementById('bookingSource').value,
        adultMen: +document.getElementById('adultMen').value || 0,
        adultWomen: +document.getElementById('adultWomen').value || 0,
        children: +document.getElementById('children').value || 0,
        infants: +document.getElementById('infants').value || 0,
        additionalInfo: document.getElementById('additionalInfo').value,
        timestamp: new Date().toISOString(),
        createdBy: user.username
    };
    
    data.totalGuests = data.adultMen + data.adultWomen + data.children + data.infants;
    
    // Save locally
    const guests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
    guests.push(data);
    localStorage.setItem('hotelGuests', JSON.stringify(guests));
    
    // Auto-backup to Google Sheets if configured
    if (localStorage.getItem('googleSheetsUrl')) {
        exportToSheets(data);
    }
    
    alert(`✅ 予約完了！\n${data.guestName}様 - ${data.roomNumber}号室`);
    
    form.reset();
    updateTotal();
    roomStatus.style.display = 'none';
};

// Google Sheets Integration
function setupGoogleSheets() {
    const instructions = `
Googleスプレッドシート連携設定手順:

1. Googleスプレッドシートを作成
2. 「拡張機能」→「Apps Script」を選択
3. 以下のコードを貼り付け:

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  // ヘッダーがない場合は追加
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      '日時', '顧客名', 'チェックイン', '宿泊日数', '部屋番号', 
      '大人男性', '大人女性', '子供', '幼児', '合計人数', 
      '地域', '予約経路', '追加情報', '登録者'
    ]);
  }
  
  sheet.appendRow([
    new Date(data.timestamp),
    data.guestName,
    data.checkInDate,
    data.stayDays,
    data.roomNumber,
    data.adultMen,
    data.adultWomen,
    data.children,
    data.infants,
    data.totalGuests,
    data.region === 'japan' ? '日本' : '海外',
    data.bookingSource,
    data.additionalInfo,
    data.createdBy
  ]);
  
  return ContentService.createTextOutput('Success');
}

4. 「デプロイ」→「新しいデプロイ」
5. 種類: ウェブアプリ
6. アクセス: 全員
7. デプロイしてURLをコピー
`;

    alert(instructions);
    
    const url = prompt('Google Apps ScriptのWebアプリURLを入力してください:');
    if (url) {
        localStorage.setItem('googleSheetsUrl', url);
        showStatus('✅ Googleシート連携が設定されました', 'success');
    }
}

function exportToSheets(singleData = null) {
    const url = localStorage.getItem('googleSheetsUrl');
    if (!url) {
        alert('先にGoogleシート連携を設定してください');
        return;
    }
    
    const data = singleData || JSON.parse(localStorage.getItem('hotelGuests') || '[]');
    const dataToSend = Array.isArray(data) ? data : [data];
    
    showStatus('📤 Googleシートにバックアップ中...', 'info');
    
    // Send each record
    Promise.all(dataToSend.map(record => 
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        })
    )).then(() => {
        showStatus('✅ Googleシートにバックアップ完了!', 'success');
    }).catch(() => {
        showStatus('❌ バックアップに失敗しました', 'error');
    });
}

function downloadBackup() {
    const data = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
    if (data.length === 0) {
        alert('バックアップするデータがありません');
        return;
    }
    
    // Convert to CSV for easy Excel import
    const csv = [
        '日時,顧客名,チェックイン,宿泊日数,部屋番号,大人男性,大人女性,子供,幼児,合計人数,地域,予約経路,追加情報,登録者',
        ...data.map(d => [
            d.timestamp,
            d.guestName,
            d.checkInDate,
            d.stayDays,
            d.roomNumber,
            d.adultMen,
            d.adultWomen,
            d.children,
            d.infants,
            d.totalGuests,
            d.region === 'japan' ? '日本' : '海外',
            d.bookingSource,
            d.additionalInfo,
            d.createdBy
        ].join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hotel-backup-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function showStatus(message, type) {
    const status = document.getElementById('backupStatus');
    status.textContent = message;
    status.className = `backup-status backup-${type}`;
    setTimeout(() => status.textContent = '', 3000);
}

function showHistory() {
    const guests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
    if (guests.length === 0) {
        alert('📋 予約履歴がありません');
        return;
    }
    
    const recent = guests.slice(-5).reverse()
        .map(g => `${g.guestName}様 - ${g.roomNumber}号室 (${g.checkInDate})`)
        .join('\n');
    
    alert(`📋 最近の予約:\n\n${recent}`);
}

// Initialize
updateTotal();