const user = JSON.parse(localStorage.getItem('currentUser'));
if (!user) location.href = 'login.html';

let currentDate = new Date();
const guests = () => JSON.parse(localStorage.getItem('hotelGuests') || '[]');

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('currentMonth').textContent = 
        `${year}年 ${month + 1}月`;
    
    const grid = document.getElementById('calendarGrid');
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    grid.innerHTML = ['日', '月', '火', '水', '木', '金', '土']
        .map(d => `<div class="day-header">${d}</div>`).join('');
    
    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += '<div class="day"></div>';
    }
    
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayGuests = guests().filter(g => {
            const checkIn = new Date(g.checkInDate);
            const checkOut = new Date(checkIn.getTime() + g.stayDays * 86400000);
            const currentDay = new Date(dateStr);
            return currentDay >= checkIn && currentDay < checkOut;
        });
        
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        const occupied = dayGuests.length > 0;
        
        grid.innerHTML += `<div class="day ${isToday ? 'today' : ''} ${occupied ? 'occupied' : ''}" 
            ${occupied ? `title="${dayGuests.map(g => `${g.roomNumber}:${g.guestName}`).join(', ')}"` : ''}>
            ${day}
            ${occupied ? `<br><small>${dayGuests.map(g => g.roomNumber).join(',')}</small>` : ''}
        </div>`;
    }
}

function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

renderCalendar();