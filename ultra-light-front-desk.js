// Check access
const user = JSON.parse(localStorage.getItem('currentUser'));
if (!user || user.role !== 'front-desk') {
    location.href = 'index.html';
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const form = document.getElementById('guestForm');
    const roomSelect = document.getElementById('roomNumber');
    const checkInInput = document.getElementById('checkInDate');
    const stayDaysInput = document.getElementById('stayDays');
    const roomStatus = document.getElementById('roomStatus');
    const totalDisplay = document.getElementById('totalGuests');

    // Update total guests (including both infant types)
    function updateTotal() {
        const total = ['adultMen', 'adultWomen', 'children', 'infantsWithMeal', 'infantsNoMeal']
            .reduce((sum, id) => sum + (+document.getElementById(id).value || 0), 0);
        totalDisplay.textContent = `合計: ${total}名`;
    }

    // Check room availability
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
        const end = new Date(start.getTime() + days * 86400000);
        
        const conflict = guests.find(g => {
            if (g.roomNumber !== room) return false;
            const gStart = new Date(g.checkInDate);
            const gEnd = new Date(gStart.getTime() + g.stayDays * 86400000);
            return start < gEnd && end > gStart;
        });
        
        roomStatus.style.display = 'block';
        if (conflict) {
            roomStatus.className = 'room-status room-conflict';
            roomStatus.textContent = `⚠️ 予約済み: ${conflict.guestName}様 (${conflict.checkInDate}〜)`;
        } else {
            roomStatus.className = 'room-status room-available';
            roomStatus.textContent = '✅ 利用可能';
        }
    }

    // Event listeners for guest count updates
    ['adultMen', 'adultWomen', 'children', 'infantsWithMeal', 'infantsNoMeal'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateTotal);
        }
    });

    // Event listeners for room availability
    if (roomSelect) roomSelect.addEventListener('change', checkRoom);
    if (checkInInput) checkInInput.addEventListener('change', checkRoom);
    if (stayDaysInput) stayDaysInput.addEventListener('change', checkRoom);

    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
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
                infantsWithMeal: +document.getElementById('infantsWithMeal').value || 0,
                infantsNoMeal: +document.getElementById('infantsNoMeal').value || 0,
                additionalInfo: document.getElementById('additionalInfo').value,
                timestamp: new Date().toISOString(),
                createdBy: user.username
            };
            
            data.totalGuests = data.adultMen + data.adultWomen + data.children + data.infantsWithMeal + data.infantsNoMeal;
            
            // Save locally first
            const guests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
            guests.push(data);
            localStorage.setItem('hotelGuests', JSON.stringify(guests));
            
            // Show saving status
            showStatus('💾 保存中... / Saving...', 'info');
            
            // Auto-backup to Google Sheets
            const sheetsUrl = localStorage.getItem('googleSheetsUrl');
            if (sheetsUrl) {
                exportToSheets(data).then(() => {
                    showStatus('✅ 保存＆Googleシート同期完了! / Saved & Synced!', 'success');
                    alert(`✅ 予約完了！Googleシートに保存されました\n${data.guestName}様 - ${data.roomNumber}号室`);
                }).catch(() => {
                    showStatus('⚠️ ローカル保存OK、Googleシート同期失敗', 'error');
                    alert(`✅ 予約完了！(ローカル保存のみ)\n${data.guestName}様 - ${data.roomNumber}号室`);
                });
            } else {
                showStatus('✅ ローカル保存完了 / Saved Locally', 'success');
                alert(`✅ 予約完了！\n${data.guestName}様 - ${data.roomNumber}号室\n\nGoogleシート連携を設定すると自動バックアップされます`);
            }
            
            // Reset form
            form.reset();
            updateTotal();
            roomStatus.style.display = 'none';
        });
    }

    // Initialize
    updateTotal();

    // Set today's date as default
    if (checkInInput) {
        checkInInput.value = new Date().toISOString().split('T')[0];
    }
});

// Google Sheets Integration Functions
function setupGoogleSheets() {
    const instructions = `
📊 Googleスプレッドシート連携設定手順:

1. https://sheets.google.com で新しいスプレッドシートを作成
2. 「拡張機能」→「Apps Script」を選択
3. 以下のコードを貼り付け:

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // ヘッダーがない場合は追加
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        '登録日時', '顧客名', 'チェックイン', '宿泊日数', '部屋番号', 
        '大人男性', '大人女性', '子供', '幼児(食事有)', '幼児(食事無)', '合計人数', 
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
      data.infantsWithMeal,
      data.infantsNoMeal,
      data.totalGuests,
      data.region === 'japan' ? '日本' : '海外',
      data.bookingSource,
      data.additionalInfo || '',
      data.createdBy
    ]);
    
    return ContentService.createTextOutput('Success');
  } catch (error) {
    return ContentService.createTextOutput('Error: ' + error.toString());
  }
}

4. 「デプロイ」→「新しいデプロイ」を選択
5. 種類: 「ウェブアプリ」を選択
6. アクセス権限: 「全員」を選択
7. 「デプロイ」をクリックしてURLをコピー
`;

    alert(instructions);
    
    const url = prompt('Google Apps ScriptのWebアプリURLを入力してください:\n(例: https://script.google.com/macros/s/ABC.../exec)');
    if (url && url.includes('script.google.com')) {
        localStorage.setItem('googleSheetsUrl', url);
        showStatus('✅ Googleシート連携が設定されました', 'success');
        alert('✅ 設定完了！次回から自動でGoogleシートに保存されます');
    } else if (url) {
        alert('❌ 正しいGoogle Apps ScriptのURLを入力してください');
    }
}

function exportToSheets(singleData = null) {
    return new Promise((resolve, reject) => {
        const url = localStorage.getItem('googleSheetsUrl');
        if (!url) {
            alert('先にGoogleシート連携を設定してください');
            reject('No URL configured');
            return;
        }
        
        const data = singleData || JSON.parse(localStorage.getItem('hotelGuests') || '[]');
        const dataToSend = Array.isArray(data) ? data : [data];
        
        if (dataToSend.length === 0) {
            alert('送信するデータがありません');
            reject('No data');
            return;
        }
        
        showStatus('📤 Googleシートにバックアップ中...', 'info');
        
        // Send each record
        Promise.all(dataToSend.map(record => 
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record),
                mode: 'no-cors' // Important for Google Apps Script
            })
        )).then(() => {
            showStatus('✅ Googleシートにバックアップ完了!', 'success');
            resolve();
        }).catch(error => {
            console.error('Backup error:', error);
            showStatus('❌ バックアップに失敗しました', 'error');
            reject(error);
        });
    });
}

function downloadBackup() {
    const data = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
    if (data.length === 0) {
        alert('バックアップするデータがありません');
        return;
    }
    
    // Convert to CSV
    const csv = [
        '登録日時,顧客名,チェックイン,宿泊日数,部屋番号,大人男性,大人女性,子供,幼児(食事有),幼児(食事無),合計人数,地域,予約経路,追加情報,登録者',
        ...data.map(d => [
            d.timestamp,
            d.guestName,
            d.checkInDate,
            d.stayDays,
            d.roomNumber,
            d.adultMen || 0,
            d.adultWomen || 0,
            d.children || 0,
            d.infantsWithMeal || 0,
            d.infantsNoMeal || 0,
            d.totalGuests,
            d.region === 'japan' ? '日本' : '海外',
            d.bookingSource,
            (d.additionalInfo || '').replace(/,/g, '；'), // Replace commas
            d.createdBy
        ].join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hotel-backup-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showStatus('💾 CSVファイルをダウンロードしました', 'success');
}

function showStatus(message, type) {
    const status = document.getElementById('backupStatus');
    if (status) {
        status.textContent = message;
        status.className = `backup-status backup-${type}`;
        setTimeout(() => status.textContent = '', 5000);
    }
}

function showHistory() {
    const guests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
    if (guests.length === 0) {
        alert('📋 予約履歴がありません');
        return;
    }
    
    const recent = guests.slice(-5).reverse()
        .map(g => `${g.guestName}様 - ${g.roomNumber}号室 (${g.checkInDate}) - ${g.totalGuests}名`)
        .join('\n');
    
    alert(`📋 最近の予約 (${guests.length}件):\n\n${recent}`);
}