// Check user authentication
const user = JSON.parse(localStorage.getItem('currentUser'));
if (!user) {
    location.href = 'login.html';
}

let currentDate = new Date();
const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
];

const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

function getGuests() {
    return JSON.parse(localStorage.getItem('hotelGuests') || '[]');
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    const monthElement = document.getElementById('currentMonth');
    if (monthElement) {
        monthElement.textContent = `${year}年 ${monthNames[month]}`;
    }
    
    const grid = document.getElementById('calendarGrid');
    if (!grid) {
        console.error('Calendar grid element not found');
        return;
    }
    
    // Clear grid
    grid.innerHTML = '';
    
    // Add day headers
    dayNames.forEach(dayName => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = dayName;
        grid.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date().toISOString().split('T')[0];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        grid.appendChild(emptyDay);
    }
    
    // Get all guests for this month
    const guests = getGuests();
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Find guests for this day
        const dayGuests = guests.filter(guest => {
            const checkIn = new Date(guest.checkInDate);
            const checkOut = new Date(checkIn.getTime() + guest.stayDays * 86400000);
            const currentDay = new Date(dateStr);
            return currentDay >= checkIn && currentDay < checkOut;
        });
        
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        
        // Add classes
        if (dateStr === today) {
            dayElement.classList.add('today');
        }
        if (dayGuests.length > 0) {
            dayElement.classList.add('occupied');
            
            // Check if there are foreign guests
            const hasForeignGuests = dayGuests.some(g => g.region === 'other');
            if (hasForeignGuests) {
                dayElement.classList.add('foreign');
            }
        }
        
        // Create day content
        let dayContent = `<div class="day-number">${day}</div>`;
        
        if (dayGuests.length > 0) {
            const totalGuests = dayGuests.reduce((sum, g) => sum + (g.totalGuests || 0), 0);
            const roomCount = dayGuests.length;
            const foreignGuests = dayGuests.filter(g => g.region === 'other').length;
            
            dayContent += `<div class="day-info">
                <div class="room-count">🏠 ${roomCount}室</div>
                <div class="guest-count">👥 ${totalGuests}名</div>
                ${foreignGuests > 0 ? `<div class="foreign-count">🌏 ${foreignGuests}</div>` : ''}
            </div>`;
        }
        
        dayElement.innerHTML = dayContent;
        
        // Add click event for day details
        if (dayGuests.length > 0) {
            dayElement.style.cursor = 'pointer';
            dayElement.title = createTooltip(dayGuests);
            dayElement.onclick = () => showDayDetails(dateStr, dayGuests);
        }
        
        grid.appendChild(dayElement);
    }
    
    // Update month statistics
    updateMonthStats(year, month, guests);
}

function createTooltip(dayGuests) {
    return dayGuests.map(guest => {
        const infantTotal = (guest.infantsWithMeal || 0) + (guest.infantsNoMeal || 0);
        return `${guest.roomNumber}号室: ${guest.guestName}様\n` +
               `👥 ${guest.totalGuests}名 (👨${guest.adultMen || 0} 👩${guest.adultWomen || 0} 🧒${guest.children || 0} 👶${infantTotal})\n` +
               `${guest.region === 'japan' ? '🇯🇵 日本' : '🌏 海外'} | ${guest.stayDays}泊\n` +
               `チェックイン: ${guest.checkInDate}`;
    }).join('\n\n');
}

function showDayDetails(dateStr, dayGuests) {
    const details = dayGuests.map(guest => {
        const infantTotal = (guest.infantsWithMeal || 0) + (guest.infantsNoMeal || 0);
        return `🏠 ${guest.roomNumber}号室: ${guest.guestName}様\n` +
               `👥 合計 ${guest.totalGuests}名\n` +
               `   👨 大人男性: ${guest.adultMen || 0}名\n` +
               `   👩 大人女性: ${guest.adultWomen || 0}名\n` +
               `   🧒 子供: ${guest.children || 0}名\n` +
               `   👶 幼児(食事有): ${guest.infantsWithMeal || 0}名\n` +
               `   👶 幼児(食事無): ${guest.infantsNoMeal || 0}名\n` +
               `🌍 地域: ${guest.region === 'japan' ? '日本' : '海外'}\n` +
               `📅 ${guest.stayDays}泊滞在\n` +
               `🎯 予約経路: ${guest.bookingSource}\n` +
               `📝 チェックイン: ${guest.checkInDate}\n` +
               `👤 登録者: ${guest.createdBy}\n` +
               `${guest.additionalInfo ? `💬 備考: ${guest.additionalInfo}` : ''}`;
    }).join('\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n');
    
    const formattedDate = new Date(dateStr).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    alert(`📅 ${formattedDate}の予約詳細\n(${dayGuests.length}件の予約)\n\n${details}`);
}

function updateMonthStats(year, month, guests) {
    const statsElement = document.getElementById('monthStats');
    if (!statsElement) return;
    
    // Filter guests for this month
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    const monthGuests = guests.filter(guest => {
        const checkIn = new Date(guest.checkInDate);
        const checkOut = new Date(checkIn.getTime() + guest.stayDays * 86400000);
        return checkIn <= monthEnd && checkOut >= monthStart;
    });
    
    const totalBookings = monthGuests.length;
    const totalGuests = monthGuests.reduce((sum, g) => sum + (g.totalGuests || 0), 0);
    const foreignGuests = monthGuests.filter(g => g.region === 'other').length;
    const domesticGuests = monthGuests.filter(g => g.region === 'japan').length;
    
    // Calculate occupancy rate (assuming 8 rooms)
    const totalRoomDays = new Date(year, month + 1, 0).getDate() * 8;
    const occupiedRoomDays = monthGuests.reduce((sum, g) => sum + g.stayDays, 0);
    const occupancyRate = totalRoomDays > 0 ? Math.round((occupiedRoomDays / totalRoomDays) * 100) : 0;
    
    // Calculate average guests per booking
    const avgGuestsPerBooking = totalBookings > 0 ? Math.round((totalGuests / totalBookings) * 10) / 10 : 0;
    
    statsElement.innerHTML = `
        <h3>${monthNames[month]}の統計 / ${monthNames[month]} Statistics</h3>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${totalBookings}</div>
                <div class="stat-label">予約件数<br>Bookings</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${totalGuests}</div>
                <div class="stat-label">総宿泊者数<br>Total Guests</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${domesticGuests}</div>
                <div class="stat-label">🇯🇵 日本人<br>Domestic</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${foreignGuests}</div>
                <div class="stat-label">🌏 外国人<br>Foreign</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${occupancyRate}%</div>
                <div class="stat-label">稼働率<br>Occupancy</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${avgGuestsPerBooking}</div>
                <div class="stat-label">平均人数<br>Avg Guests</div>
            </div>
        </div>
    `;
}

// Navigation functions (matching your existing HTML)
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Calendar initializing...');
    renderCalendar();
});

// Auto-refresh every 2 minutes
setInterval(renderCalendar, 120000);

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        previousMonth();
    } else if (e.key === 'ArrowRight') {
        nextMonth();
    }
});

// Export calendar data
function exportCalendarMonth() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const guests = getGuests();
    
    const monthGuests = guests.filter(guest => {
        const checkIn = new Date(guest.checkInDate);
        return checkIn.getFullYear() === year && checkIn.getMonth() === month;
    });
    
    if (monthGuests.length === 0) {
        alert('この月の予約データがありません');
        return;
    }
    
    const csv = [
        '日付,部屋番号,顧客名,宿泊者数,大人男性,大人女性,子供,幼児(食事有),幼児(食事無),地域,宿泊日数,予約経路,備考',
        ...monthGuests.map(g => [
            g.checkInDate,
            g.roomNumber,
            g.guestName,
            g.totalGuests,
            g.adultMen || 0,
            g.adultWomen || 0,
            g.children || 0,
            g.infantsWithMeal || 0,
            g.infantsNoMeal || 0,
            g.region === 'japan' ? '日本' : '海外',
            g.stayDays,
            g.bookingSource,
            (g.additionalInfo || '').replace(/,/g, '；')
        ].join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `calendar-${year}-${String(month + 1).padStart(2, '0')}.csv`;
    link.click();
}