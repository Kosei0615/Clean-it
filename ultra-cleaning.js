const user = JSON.parse(localStorage.getItem('currentUser'));
if (!user) location.href = 'login.html';

function loadRooms() {
    const guests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    const todayGuests = guests.filter(g => {
        const checkIn = new Date(g.checkInDate);
        const checkOut = new Date(checkIn.getTime() + g.stayDays * 86400000);
        const currentDay = new Date(today);
        return currentDay >= checkIn && currentDay < checkOut;
    });
    
    const rooms = ['103', '104', '201', '202', '203', '301', '302', '303'];
    
    document.getElementById('roomsList').innerHTML = rooms.map(room => {
        const guest = todayGuests.find(g => g.roomNumber === room);
        return `<div class="list-item ${guest ? (guest.region === 'other' ? 'foreign-guest' : '') : ''}">
            <div class="item-header">
                <span class="room-number">${room}号室</span>
                ${guest ? `<span class="guest-name">${guest.guestName}様</span>` : '<span>空室</span>'}
            </div>
            ${guest ? `<div class="item-details">
                👥 ${guest.totalGuests}名 | 
                ${guest.region === 'japan' ? '🇯🇵 日本' : '🌏 海外'} |
                ${guest.stayDays}泊滞在
            </div>` : ''}
        </div>`;
    }).join('');
}

loadRooms();