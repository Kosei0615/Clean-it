// Check access
const user = JSON.parse(localStorage.getItem('currentUser'));
if (!user || user.role !== 'front-desk') {
    location.href = 'index.html';
}

let allCustomers = [];
let filteredCustomers = [];
let editingCustomer = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCustomers();
    updateStats();
});

function loadCustomers() {
    allCustomers = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
    filteredCustomers = [...allCustomers];
    displayCustomers();
}

function displayCustomers() {
    const customerList = document.getElementById('customerList');
    
    if (filteredCustomers.length === 0) {
        customerList.innerHTML = `
            <div class="no-customers">
                <p>👥 顧客データがありません</p>
                <p>No customer data found</p>
            </div>
        `;
        return;
    }

    // Sort by most recent first
    const sortedCustomers = filteredCustomers.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    customerList.innerHTML = sortedCustomers.map(customer => {
        const checkOutDate = new Date(customer.checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + customer.stayDays);
        
        const today = new Date();
        const isCurrentGuest = today >= new Date(customer.checkInDate) && today < checkOutDate;
        const isFutureGuest = new Date(customer.checkInDate) > today;
        const isPastGuest = checkOutDate <= today;
        
        let statusClass = '';
        let statusText = '';
        
        if (isCurrentGuest) {
            statusClass = 'current-guest';
            statusText = '🏠 滞在中';
        } else if (isFutureGuest) {
            statusClass = 'future-guest';
            statusText = '🔮 予約済み';
        } else {
            statusClass = 'past-guest';
            statusText = '📋 過去の宿泊';
        }

        return `
            <div class="customer-card ${statusClass} ${customer.region === 'other' ? 'foreign-customer' : ''}">
                <div class="customer-header">
                    <div class="customer-info">
                        <h3>${customer.guestName}様</h3>
                        <span class="room-badge">${customer.roomNumber}号室</span>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="customer-actions">
                        <button onclick="viewCustomer(${customer.id})" class="view-btn">👁️ 詳細</button>
                        <button onclick="editCustomer(${customer.id})" class="edit-btn">✏️ 編集</button>
                    </div>
                </div>
                
                <div class="customer-summary">
                    <div class="summary-item">
                        <span class="label">📅 期間:</span>
                        <span class="value">${customer.checkInDate} 〜 ${checkOutDate.toISOString().split('T')[0]} (${customer.stayDays}泊)</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">👥 人数:</span>
                        <span class="value">${customer.totalGuests}名 (👨${customer.adultMen || 0} 👩${customer.adultWomen || 0} 🧒${customer.children || 0} 👶${(customer.infantsWithMeal || 0) + (customer.infantsNoMeal || 0)})</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">🌍 地域:</span>
                        <span class="value">${customer.region === 'japan' ? '🇯🇵 日本' : '🌏 海外'}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">🎯 予約経路:</span>
                        <span class="value">${customer.bookingSource}</span>
                    </div>
                    ${customer.additionalInfo ? `
                        <div class="summary-item">
                            <span class="label">📝 備考:</span>
                            <span class="value">${customer.additionalInfo}</span>
                        </div>
                    ` : ''}
                    <div class="summary-item">
                        <span class="label">👤 登録者:</span>
                        <span class="value">${customer.createdBy} (${new Date(customer.timestamp).toLocaleDateString('ja-JP')})</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateStats() {
    const today = new Date();
    const currentGuests = filteredCustomers.filter(c => {
        const checkIn = new Date(c.checkInDate);
        const checkOut = new Date(checkIn.getTime() + c.stayDays * 86400000);
        return today >= checkIn && today < checkOut;
    });
    
    const futureGuests = filteredCustomers.filter(c => 
        new Date(c.checkInDate) > today
    );
    
    const totalGuests = filteredCustomers.reduce((sum, c) => sum + c.totalGuests, 0);
    const foreignGuests = filteredCustomers.filter(c => c.region === 'other').length;

    document.getElementById('customerStats').innerHTML = `
        <h3>📊 顧客統計 / Customer Statistics</h3>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${filteredCustomers.length}</div>
                <div class="stat-label">総予約数<br>Total Bookings</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${currentGuests.length}</div>
                <div class="stat-label">現在滞在中<br>Current Guests</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${futureGuests.length}</div>
                <div class="stat-label">未来の予約<br>Future Bookings</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${totalGuests}</div>
                <div class="stat-label">総宿泊者数<br>Total People</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${foreignGuests}</div>
                <div class="stat-label">🌏 海外客<br>Foreign Guests</div>
            </div>
        </div>
    `;
}

function filterCustomers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const regionFilter = document.getElementById('regionFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    filteredCustomers = allCustomers.filter(customer => {
        // Search filter
        const matchesSearch = !searchTerm || 
            customer.guestName.toLowerCase().includes(searchTerm) ||
            customer.roomNumber.toLowerCase().includes(searchTerm);
        
        // Region filter
        const matchesRegion = !regionFilter || customer.region === regionFilter;
        
        // Date filter
        let matchesDate = true;
        if (dateFilter) {
            const today = new Date();
            const checkIn = new Date(customer.checkInDate);
            const checkOut = new Date(checkIn.getTime() + customer.stayDays * 86400000);
            
            switch (dateFilter) {
                case 'today':
                    matchesDate = today >= checkIn && today < checkOut;
                    break;
                case 'thisWeek':
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 7);
                    matchesDate = checkIn < weekEnd && checkOut > weekStart;
                    break;
                case 'thisMonth':
                    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    matchesDate = checkIn <= monthEnd && checkOut >= monthStart;
                    break;
                case 'future':
                    matchesDate = checkIn > today;
                    break;
            }
        }
        
        return matchesSearch && matchesRegion && matchesDate;
    });
    
    displayCustomers();
    updateStats();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('regionFilter').value = '';
    document.getElementById('dateFilter').value = '';
    filterCustomers();
}

function viewCustomer(customerId) {
    const customer = allCustomers.find(c => c.id === customerId);
    if (!customer) return;
    
    const checkOutDate = new Date(customer.checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + customer.stayDays);
    
    document.getElementById('modalTitle').textContent = `${customer.guestName}様の詳細情報`;
    document.getElementById('customerModalBody').innerHTML = `
        <div class="customer-details">
            <div class="detail-section">
                <h3>🏠 基本情報 / Basic Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>顧客名 / Name:</label>
                        <span>${customer.guestName}</span>
                    </div>
                    <div class="detail-item">
                        <label>部屋番号 / Room:</label>
                        <span>${customer.roomNumber}号室</span>
                    </div>
                    <div class="detail-item">
                        <label>チェックイン / Check-in:</label>
                        <span>${customer.checkInDate}</span>
                    </div>
                    <div class="detail-item">
                        <label>チェックアウト / Check-out:</label>
                        <span>${checkOutDate.toISOString().split('T')[0]}</span>
                    </div>
                    <div class="detail-item">
                        <label>宿泊日数 / Stay Duration:</label>
                        <span>${customer.stayDays}泊</span>
                    </div>
                    <div class="detail-item">
                        <label>地域 / Region:</label>
                        <span>${customer.region === 'japan' ? '🇯🇵 日本' : '🌏 海外'}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>👥 宿泊者詳細 / Guest Details</h3>
                <div class="guest-breakdown">
                    <div class="guest-item">👨 大人男性: <strong>${customer.adultMen || 0}名</strong></div>
                    <div class="guest-item">👩 大人女性: <strong>${customer.adultWomen || 0}名</strong></div>
                    <div class="guest-item">🧒 子供: <strong>${customer.children || 0}名</strong></div>
                    <div class="guest-item">👶 幼児(食事有): <strong>${customer.infantsWithMeal || 0}名</strong></div>
                    <div class="guest-item">👶 幼児(食事無): <strong>${customer.infantsNoMeal || 0}名</strong></div>
                    <div class="guest-total">合計: <strong>${customer.totalGuests}名</strong></div>
                </div>
            </div>

            <div class="detail-section">
                <h3>📋 予約情報 / Booking Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>予約経路 / Source:</label>
                        <span>${customer.bookingSource}</span>
                    </div>
                    <div class="detail-item">
                        <label>登録者 / Created by:</label>
                        <span>${customer.createdBy}</span>
                    </div>
                    <div class="detail-item">
                        <label>登録日時 / Created at:</label>
                        <span>${new Date(customer.timestamp).toLocaleString('ja-JP')}</span>
                    </div>
                </div>
            </div>

            ${customer.additionalInfo ? `
                <div class="detail-section">
                    <h3>📝 追加情報 / Additional Information</h3>
                    <div class="additional-info">
                        ${customer.additionalInfo}
                    </div>
                </div>
            ` : ''}
        </div>
        
        <div class="modal-actions">
            <button onclick="editCustomer(${customer.id})" class="edit-btn">✏️ 編集する / Edit</button>
            <button onclick="closeCustomerModal()" class="cancel-btn">閉じる / Close</button>
        </div>
    `;
    
    document.getElementById('customerModal').style.display = 'flex';
}

function editCustomer(customerId) {
    const customer = allCustomers.find(c => c.id === customerId);
    if (!customer) return;
    
    editingCustomer = customer;
    
    document.getElementById('modalTitle').textContent = `${customer.guestName}様の情報編集`;
    document.getElementById('customerModalBody').innerHTML = `
        <form id="editCustomerForm" onsubmit="saveCustomer(event)">
            <div class="edit-section">
                <h3>🏠 基本情報 / Basic Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>顧客名 / Guest Name</label>
                        <input type="text" id="editGuestName" value="${customer.guestName}" required>
                    </div>
                    <div class="form-group">
                        <label>部屋番号 / Room</label>
                        <select id="editRoomNumber" required>
                            <optgroup label="1階">
                                <option value="103" ${customer.roomNumber === '103' ? 'selected' : ''}>103号室</option>
                                <option value="104" ${customer.roomNumber === '104' ? 'selected' : ''}>104号室</option>
                            </optgroup>
                            <optgroup label="2階">
                                <option value="201" ${customer.roomNumber === '201' ? 'selected' : ''}>201号室</option>
                                <option value="202" ${customer.roomNumber === '202' ? 'selected' : ''}>202号室</option>
                                <option value="203" ${customer.roomNumber === '203' ? 'selected' : ''}>203号室</option>
                            </optgroup>
                            <optgroup label="3階">
                                <option value="301" ${customer.roomNumber === '301' ? 'selected' : ''}>301号室</option>
                                <option value="302" ${customer.roomNumber === '302' ? 'selected' : ''}>302号室</option>
                                <option value="303" ${customer.roomNumber === '303' ? 'selected' : ''}>303号室</option>
                            </optgroup>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>チェックイン日 / Check-in Date</label>
                        <input type="date" id="editCheckInDate" value="${customer.checkInDate}" required>
                    </div>
                    <div class="form-group">
                        <label>宿泊日数 / Stay Days</label>
                        <input type="number" id="editStayDays" value="${customer.stayDays}" min="1" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>地域 / Region</label>
                        <select id="editRegion" required>
                            <option value="japan" ${customer.region === 'japan' ? 'selected' : ''}>🇯🇵 日本</option>
                            <option value="other" ${customer.region === 'other' ? 'selected' : ''}>🌏 海外</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>予約経路 / Booking Source</label>
                        <select id="editBookingSource" required>
                            <option value="direct" ${customer.bookingSource === 'direct' ? 'selected' : ''}>直接</option>
                            <option value="online" ${customer.bookingSource === 'online' ? 'selected' : ''}>オンライン</option>
                            <option value="phone" ${customer.bookingSource === 'phone' ? 'selected' : ''}>電話</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="edit-section">
                <h3>👥 宿泊者数 / Guest Count</h3>
                <div class="counter-grid">
                    <div class="counter-item">
                        <label>👨 大人男性</label>
                        <input type="number" id="editAdultMen" value="${customer.adultMen || 0}" min="0">
                    </div>
                    <div class="counter-item">
                        <label>👩 大人女性</label>
                        <input type="number" id="editAdultWomen" value="${customer.adultWomen || 0}" min="0">
                    </div>
                    <div class="counter-item">
                        <label>🧒 子supply</label>
                        <input type="number" id="editChildren" value="${customer.children || 0}" min="0">
                    </div>
                    <div class="counter-item">
                        <label>👶 幼児(食事有)</label>
                        <input type="number" id="editInfantsWithMeal" value="${customer.infantsWithMeal || 0}" min="0">
                    </div>
                    <div class="counter-item">
                        <label>👶 幼児(食事無)</label>
                        <input type="number" id="editInfantsNoMeal" value="${customer.infantsNoMeal || 0}" min="0">
                    </div>
                </div>
                <div class="total-display" id="editTotalGuests">合計: ${customer.totalGuests}名</div>
            </div>

            <div class="edit-section">
                <h3>📝 追加情報 / Additional Information</h3>
                <div class="form-group">
                    <label>備考 / Notes</label>
                    <textarea id="editAdditionalInfo" rows="3">${customer.additionalInfo || ''}</textarea>
                </div>
            </div>
            
            <div class="modal-actions">
                <button type="submit" class="save-btn">💾 保存 / Save</button>
                <button type="button" onclick="closeCustomerModal()" class="cancel-btn">キャンセル / Cancel</button>
            </div>
        </form>
    `;
    
    // Add event listeners for total calculation
    ['editAdultMen', 'editAdultWomen', 'editChildren', 'editInfantsWithMeal', 'editInfantsNoMeal'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateEditTotal);
    });
    
    document.getElementById('customerModal').style.display = 'flex';
}

function updateEditTotal() {
    const total = ['editAdultMen', 'editAdultWomen', 'editChildren', 'editInfantsWithMeal', 'editInfantsNoMeal']
        .reduce((sum, id) => sum + (+document.getElementById(id).value || 0), 0);
    document.getElementById('editTotalGuests').textContent = `合計: ${total}名`;
}

function saveCustomer(event) {
    event.preventDefault();
    
    if (!editingCustomer) return;
    
    // Get updated data
    const updatedCustomer = {
        ...editingCustomer,
        guestName: document.getElementById('editGuestName').value,
        roomNumber: document.getElementById('editRoomNumber').value,
        checkInDate: document.getElementById('editCheckInDate').value,
        stayDays: +document.getElementById('editStayDays').value,
        region: document.getElementById('editRegion').value,
        bookingSource: document.getElementById('editBookingSource').value,
        adultMen: +document.getElementById('editAdultMen').value || 0,
        adultWomen: +document.getElementById('editAdultWomen').value || 0,
        children: +document.getElementById('editChildren').value || 0,
        infantsWithMeal: +document.getElementById('editInfantsWithMeal').value || 0,
        infantsNoMeal: +document.getElementById('editInfantsNoMeal').value || 0,
        additionalInfo: document.getElementById('editAdditionalInfo').value,
        lastModified: new Date().toISOString(),
        modifiedBy: user.username
    };
    
    updatedCustomer.totalGuests = updatedCustomer.adultMen + updatedCustomer.adultWomen + 
                                  updatedCustomer.children + updatedCustomer.infantsWithMeal + 
                                  updatedCustomer.infantsNoMeal;
    
    // Check room availability (exclude current booking)
    const guests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
    const otherGuests = guests.filter(g => g.id !== editingCustomer.id);
    
    const requestedCheckIn = new Date(updatedCustomer.checkInDate);
    const requestedCheckOut = new Date(requestedCheckIn.getTime() + updatedCustomer.stayDays * 86400000);
    
    const conflict = otherGuests.find(g => {
        if (g.roomNumber !== updatedCustomer.roomNumber) return false;
        const gCheckIn = new Date(g.checkInDate);
        const gCheckOut = new Date(gCheckIn.getTime() + g.stayDays * 86400000);
        return requestedCheckIn < gCheckOut && requestedCheckOut > gCheckIn;
    });
    
    if (conflict) {
        alert(`⚠️ 部屋の競合があります。${conflict.guestName}様と日程が重複しています。`);
        return;
    }
    
    // Update the customer in storage
    const allGuests = JSON.parse(localStorage.getItem('hotelGuests') || '[]');
    const updatedGuests = allGuests.map(g => g.id === editingCustomer.id ? updatedCustomer : g);
    localStorage.setItem('hotelGuests', JSON.stringify(updatedGuests));
    
    // Auto-backup to Google Sheets if configured
    const sheetsUrl = localStorage.getItem('googleSheetsUrl');
    if (sheetsUrl) {
        exportToSheets(updatedCustomer).catch(() => {
            console.log('Google Sheets sync failed');
        });
    }
    
    alert(`✅ ${updatedCustomer.guestName}様の情報を更新しました！`);
    
    closeCustomerModal();
    loadCustomers();
    updateStats();
}

function closeCustomerModal() {
    document.getElementById('customerModal').style.display = 'none';
    editingCustomer = null;
}

function exportCustomerList() {
    if (filteredCustomers.length === 0) {
        alert('エクスポートするデータがありません');
        return;
    }
    
    const csv = [
        '顧客名,部屋番号,チェックイン,宿泊日数,大人男性,大人女性,子供,幼児(食事有),幼児(食事無),合計人数,地域,予約経路,追加情報,登録者,登録日時',
        ...filteredCustomers.map(c => [
            c.guestName,
            c.roomNumber,
            c.checkInDate,
            c.stayDays,
            c.adultMen || 0,
            c.adultWomen || 0,
            c.children || 0,
            c.infantsWithMeal || 0,
            c.infantsNoMeal || 0,
            c.totalGuests,
            c.region === 'japan' ? '日本' : '海外',
            c.bookingSource,
            (c.additionalInfo || '').replace(/,/g, '；'),
            c.createdBy,
            new Date(c.timestamp).toLocaleString('ja-JP')
        ].join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customer-list-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Google Sheets export function (reuse from front-desk)
function exportToSheets(customerData) {
    const url = localStorage.getItem('googleSheetsUrl');
    if (!url) return Promise.reject('No URL configured');
    
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
        mode: 'no-cors'
    });
}