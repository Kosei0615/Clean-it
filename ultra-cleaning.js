const user = JSON.parse(localStorage.getItem('currentUser'));
if (!user) location.href = 'login.html';

let selectedDate = new Date().toISOString().split('T')[0]; // Default to today

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('selectedDate');
    if (dateInput) {
        dateInput.value = selectedDate;
    }
    loadRoomsForDate();
    updateDateDisplay();
});

function changeDate(days) {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + days);
    selectedDate = currentDate.toISOString().split('T')[0];
    
    const dateInput = document.getElementById('selectedDate');
    if (dateInput) {
        dateInput.value = selectedDate;
    }
    
    loadRoomsForDate();
    updateDateDisplay();
    updateQuickDateButtons();
}

function selectQuickDate(dayOffset) {
    const today = new Date();
    today.setDate(today.getDate() + dayOffset);
    selectedDate = today.toISOString().split('T')[0];
    
    const dateInput = document.getElementById('selectedDate');
    if (dateInput) {
        dateInput.value = selectedDate;
    }
    
    loadRoomsForDate();
    updateDateDisplay();
    updateQuickDateButtons();
}

function goToToday() {
    selectedDate = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('selectedDate');
    if (dateInput) {
        dateInput.value = selectedDate;
    }
    
    loadRoomsForDate();
    updateDateDisplay();
    updateQuickDateButtons();
}

function loadRoomsForDate() {
    const dateInput = document.getElementById('selectedDate');
    if (dateInput && dateInput.value) {
        selectedDate = dateInput.value;
    }
    
    const guests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
    
    // Get selected date's guests (including check-in and stay period)
    const selectedDateGuests = guests.filter(g => {
        const checkIn = new Date(g.checkInDate);
        const checkOut = new Date(checkIn.getTime() + g.stayDays * 86400000);
        const currentDay = new Date(selectedDate);
        return currentDay >= checkIn && currentDay < checkOut;
    });
    
    // Get guests checking in on selected date
    const checkingInDate = guests.filter(g => g.checkInDate === selectedDate);
    
    // Get guests checking out on selected date
    const checkingOutDate = guests.filter(g => {
        const checkIn = new Date(g.checkInDate);
        const checkOut = new Date(checkIn.getTime() + g.stayDays * 86400000);
        return checkOut.toISOString().split('T')[0] === selectedDate;
    });
    
    const rooms = ['103', '104', '201', '202', '203', '301', '302', '303'];
    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today;
    const isPast = new Date(selectedDate) < new Date(today);
    const isFuture = new Date(selectedDate) > new Date(today);
    
    let roomsHTML = '';
    
    // Add summary section with date context
    const dateLabel = isToday ? '今日' : isPast ? '過去の日付' : '未来の日付';
    const dateColor = isToday ? '#4caf50' : isPast ? '#9e9e9e' : '#2196f3';
    
    roomsHTML += `
        <div class="cleaning-summary" style="border-color: ${dateColor};">
            <h3>📊 ${dateLabel}の概要 / ${dateLabel} Summary</h3>
            <div class="date-status">
                <span class="date-indicator" style="background: ${dateColor};">
                    ${isToday ? '📍 今日' : isPast ? '📅 過去' : '🔮 未来'}
                </span>
            </div>
            <div class="summary-stats">
                <div class="summary-item check-in">
                    <div class="summary-number">${checkingInDate.length}</div>
                    <div class="summary-label">チェックイン<br>Check-in</div>
                </div>
                <div class="summary-item check-out">
                    <div class="summary-number">${checkingOutDate.length}</div>
                    <div class="summary-label">チェックアウト<br>Check-out</div>
                </div>
                <div class="summary-item occupied">
                    <div class="summary-number">${selectedDateGuests.length}</div>
                    <div class="summary-label">稼働室数<br>Occupied</div>
                </div>
                <div class="summary-item available">
                    <div class="summary-number">${8 - selectedDateGuests.length}</div>
                    <div class="summary-label">空室数<br>Available</div>
                </div>
            </div>
        </div>
    `;
    
    // Add historical context for past dates
    if (isPast) {
        roomsHTML += `
            <div class="historical-note">
                <p>📋 過去の宿泊記録を表示しています</p>
                <p>この情報は参考用です</p>
            </div>
        `;
    } else if (isFuture) {
        roomsHTML += `
            <div class="future-note">
                <p>🔮 未来の予約状況を表示しています</p>
                <p>予約は変更される可能性があります</p>
            </div>
        `;
    }
    
    rooms.forEach(room => {
        const guest = selectedDateGuests.find(g => g.roomNumber === room);
        const isCheckingIn = checkingInDate.find(g => g.roomNumber === room);
        const isCheckingOut = checkingOutDate.find(g => g.roomNumber === room);
        
        let statusClass = '';
        let statusIcon = '';
        let statusText = '';
        
        if (isCheckingIn) {
            statusClass = 'checking-in';
            statusIcon = '📥';
            statusText = 'チェックイン';
        } else if (isCheckingOut) {
            statusClass = 'checking-out';
            statusIcon = '📤';
            statusText = 'チェックアウト';
        } else if (guest) {
            statusClass = 'staying';
            statusIcon = '🏠';
            statusText = '滞在中';
        } else {
            statusClass = 'available';
            statusIcon = '✨';
            statusText = isPast ? '空室だった' : isFuture ? '空室予定' : '清掃完了・空室';
        }
        
        // Add foreign guest indicator
        if (guest && guest.region === 'other') {
            statusClass += ' foreign-guest';
        }
        
        // Add date context class
        if (isPast) statusClass += ' past-date';
        if (isFuture) statusClass += ' future-date';
        
        roomsHTML += `
            <div class="room-card ${statusClass}">
                <div class="room-header">
                    <div class="room-info">
                        <span class="room-number">${room}号室</span>
                        <span class="room-status">${statusIcon} ${statusText}</span>
                    </div>
                    ${guest ? `<span class="guest-name">${guest.guestName}様</span>` : ''}
                </div>
                
                ${guest ? `
                    <div class="guest-details">
                        <div class="detail-row">
                            <span class="detail-label">👥 宿泊者数:</span>
                            <span class="detail-value">${guest.totalGuests}名</span>
                        </div>
                        <div class="detail-breakdown">
                            👨 ${guest.adultMen || 0}名 | 👩 ${guest.adultWomen || 0}名 | 
                            🧒 ${guest.children || 0}名 | 👶 ${(guest.infantsWithMeal || 0) + (guest.infantsNoMeal || 0)}名
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">🌍 地域:</span>
                            <span class="detail-value">${guest.region === 'japan' ? '🇯🇵 日本' : '🌏 海外'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">📅 期間:</span>
                            <span class="detail-value">${guest.checkInDate} 〜 ${new Date(new Date(guest.checkInDate).getTime() + guest.stayDays * 86400000).toISOString().split('T')[0]} (${guest.stayDays}泊)</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">📊 滞在日数:</span>
                            <span class="detail-value">${calculateStayDay(guest.checkInDate, selectedDate, guest.stayDays)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">🎯 予約経路:</span>
                            <span class="detail-value">${guest.bookingSource}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">👤 登録者:</span>
                            <span class="detail-value">${guest.createdBy}</span>
                        </div>
                        ${guest.additionalInfo ? `
                            <div class="detail-row">
                                <span class="detail-label">📝 備考:</span>
                                <span class="detail-value">${guest.additionalInfo}</span>
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div class="empty-room-info">
                        <p>🧹 ${isPast ? '空室でした' : isFuture ? '空室予定' : '清掃準備完了'}</p>
                        <p>${isPast ? '宿泊者はいませんでした' : isFuture ? '予約をお待ちしています' : '次回予約をお待ちしています'}</p>
                    </div>
                `}
            </div>
        `;
    });
    
    document.getElementById('roomsList').innerHTML = roomsHTML;
    updateDateDisplay();
}

function calculateStayDay(checkInDate, currentDate, totalStayDays) {
    const checkIn = new Date(checkInDate);
    const current = new Date(currentDate);
    const dayNumber = Math.floor((current - checkIn) / (1000 * 60 * 60 * 24)) + 1;
    
    if (dayNumber < 1) {
        return 'チェックイン前';
    } else if (dayNumber > totalStayDays) {
        return 'チェックアウト済み';
    } else {
        return `${dayNumber}日目 / ${totalStayDays}日間`;
    }
}

function updateDateDisplay() {
    const displayElement = document.getElementById('selectedDateDisplay');
    if (!displayElement) return;
    
    const date = new Date(selectedDate);
    const today = new Date().toISOString().split('T')[0];
    
    const formattedDate = date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    let statusText = '';
    if (selectedDate === today) {
        statusText = '📍 今日の情報を表示中';
    } else if (date < new Date(today)) {
        statusText = '📅 過去の記録を表示中';
    } else {
        statusText = '🔮 未来の予約を表示中';
    }
    
    displayElement.innerHTML = `${statusText}<br><strong>${formattedDate}</strong>`;
}

function updateQuickDateButtons() {
    const today = new Date().toISOString().split('T')[0];
    const buttons = document.querySelectorAll('.quick-date-btn');
    
    buttons.forEach((btn, index) => {
        btn.classList.remove('active');
        
        let targetDate;
        if (index === 0) { // 昨日
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            targetDate = yesterday.toISOString().split('T')[0];
        } else if (index === 1) { // 今日
            targetDate = today;
        } else if (index === 2) { // 明日
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            targetDate = tomorrow.toISOString().split('T')[0];
        } else if (index === 3) { // 明後日
            const dayAfterTomorrow = new Date();
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
            targetDate = dayAfterTomorrow.toISOString().split('T')[0];
        }
        
        if (targetDate === selectedDate) {
            btn.classList.add('active');
        }
    });
}

// Auto-refresh every 30 seconds (only if showing today)
setInterval(() => {
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate === today) {
        loadRoomsForDate();
    }
}, 30000);

// Export function for selected date
function exportCleaningReport() {
    const guests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
    
    const selectedDateGuests = guests.filter(g => {
        const checkIn = new Date(g.checkInDate);
        const checkOut = new Date(checkIn.getTime() + g.stayDays * 86400000);
        const currentDay = new Date(selectedDate);
        return currentDay >= checkIn && currentDay < checkOut;
    });
    
    if (selectedDateGuests.length === 0) {
        alert(`${selectedDate}の清掃レポートデータがありません`);
        return;
    }
    
    const csv = [
        '日付,部屋番号,顧客名,宿泊者数,大人男性,大人女性,子供,幼児(食事有),幼児(食事無),地域,チェックイン,宿泊日数,滞在日数,予約経路,登録者,備考',
        ...selectedDateGuests.map(g => [
            selectedDate,
            g.roomNumber,
            g.guestName,
            g.totalGuests,
            g.adultMen || 0,
            g.adultWomen || 0,
            g.children || 0,
            g.infantsWithMeal || 0,
            g.infantsNoMeal || 0,
            g.region === 'japan' ? '日本' : '海外',
            g.checkInDate,
            g.stayDays,
            calculateStayDay(g.checkInDate, selectedDate, g.stayDays),
            g.bookingSource,
            g.createdBy,
            (g.additionalInfo || '').replace(/,/g, '；')
        ].join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cleaning-report-${selectedDate}.csv`;
    link.click();
}