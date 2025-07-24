class CustomerDatabase {
    constructor() {
        this.checkAccess();
        this.customers = JSON.parse(localStorage.getItem('hotelGuests')) || [];
        this.filteredCustomers = [...this.customers];
        this.sortDirection = 1; // 1 for ascending, -1 for descending
        this.loadCustomers();
        this.updateStats();
    }

    checkAccess() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'login.html';
        }
    }

    loadCustomers() {
        const tableBody = document.getElementById('customersTableBody');
        
        if (this.filteredCustomers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="no-data-row">
                        <div class="no-data">
                            <p>👥 顧客データがありません</p>
                            <p>No customer data available</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Remove duplicates based on unique ID
        const uniqueCustomers = this.filteredCustomers.filter((customer, index, self) =>
            index === self.findIndex(c => c.id === customer.id)
        );

        tableBody.innerHTML = uniqueCustomers.map(customer => `
            <tr class="${customer.region === 'other' ? 'foreign-customer' : ''}">
                <td>${customer.guestName}</td>
                <td class="room-cell">${customer.roomNumber}</td>
                <td>${customer.checkInDate}</td>
                <td>${customer.stayDays}</td>
                <td class="guests-cell">${customer.totalGuests}</td>
                <td class="region-cell">
                    <span class="region-badge ${customer.region}">
                        ${customer.region === 'japan' ? '🇯🇵 日本' : '🌏 海外'}
                    </span>
                </td>
                <td>${this.getSourceText(customer.bookingSource)}</td>
                <td>
                    <button onclick="showCustomerDetails(${customer.id})" class="details-btn">
                        詳細 / Details
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getSourceText(source) {
        const sourceMap = {
            'direct': '直接 / Direct',
            'online': 'オンライン / Online',
            'travel-agent': '旅行会社 / Agent',
            'phone': '電話 / Phone'
        };
        return sourceMap[source] || source;
    }

    updateStats() {
        // Remove duplicates for stats calculation
        const uniqueCustomers = this.filteredCustomers.filter((customer, index, self) =>
            index === self.findIndex(c => c.id === customer.id)
        );

        const total = uniqueCustomers.length;
        const japanese = uniqueCustomers.filter(c => c.region === 'japan').length;
        const foreign = uniqueCustomers.filter(c => c.region === 'other').length;
        const totalGuests = uniqueCustomers.reduce((sum, c) => sum + c.totalGuests, 0);
        const avgStay = total > 0 ? (uniqueCustomers.reduce((sum, c) => sum + c.stayDays, 0) / total).toFixed(1) : 0;

        document.getElementById('statsSummary').innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${total}</div>
                    <div class="stat-label">総予約数 / Total Bookings</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${totalGuests}</div>
                    <div class="stat-label">総宿泊者数 / Total Guests</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${japanese}</div>
                    <div class="stat-label">🇯🇵 国内客 / Domestic</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${foreign}</div>
                    <div class="stat-label">🌏 海外客 / Foreign</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${avgStay}</div>
                    <div class="stat-label">平均宿泊日数 / Avg Stay</div>
                </div>
            </div>
        `;
    }

    filterCustomers() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const regionFilter = document.getElementById('regionFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;

        this.filteredCustomers = this.customers.filter(customer => {
            // Search filter
            const matchesSearch = customer.guestName.toLowerCase().includes(searchTerm) ||
                                customer.roomNumber.toLowerCase().includes(searchTerm);

            // Region filter
            const matchesRegion = !regionFilter || customer.region === regionFilter;

            // Date filter
            let matchesDate = true;
            if (dateFilter) {
                const customerDate = new Date(customer.checkInDate);
                const today = new Date();
                
                switch (dateFilter) {
                    case 'today':
                        matchesDate = customerDate.toDateString() === today.toDateString();
                        break;
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(today.getDate() - 7);
                        matchesDate = customerDate >= weekAgo;
                        break;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(today.getMonth() - 1);
                        matchesDate = customerDate >= monthAgo;
                        break;
                }
            }

            return matchesSearch && matchesRegion && matchesDate;
        });

        this.loadCustomers();
        this.updateStats();
    }

    sortTable(columnIndex) {
        const columns = ['guestName', 'roomNumber', 'checkInDate', 'stayDays', 'totalGuests', 'region', 'bookingSource'];
        const column = columns[columnIndex];

        this.filteredCustomers.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            if (column === 'checkInDate') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (aVal < bVal) return -1 * this.sortDirection;
            if (aVal > bVal) return 1 * this.sortDirection;
            return 0;
        });

        this.sortDirection *= -1;
        this.loadCustomers();
    }

    showCustomerDetails(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;

        const checkOutDate = new Date(customer.checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + customer.stayDays);

        document.getElementById('modalTitle').textContent = `${customer.guestName}様の詳細情報`;
        document.getElementById('customerDetails').innerHTML = `
            <div class="detail-section">
                <h3>基本情報 / Basic Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>顧客名 / Name:</strong> ${customer.guestName}
                    </div>
                    <div class="detail-item">
                        <strong>部屋番号 / Room:</strong> ${customer.roomNumber}
                    </div>
                    <div class="detail-item">
                        <strong>チェックイン / Check-in:</strong> ${customer.checkInDate}
                    </div>
                    <div class="detail-item">
                        <strong>チェックアウト / Check-out:</strong> ${checkOutDate.toISOString().split('T')[0]}
                    </div>
                    <div class="detail-item">
                        <strong>宿泊日数 / Stay Duration:</strong> ${customer.stayDays} 泊
                    </div>
                    <div class="detail-item">
                        <strong>地域 / Region:</strong> ${customer.region === 'japan' ? '🇯🇵 日本' : '🌏 海外'}
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>宿泊者詳細 / Guest Details</h3>
                <div class="guests-breakdown">
                    <div class="guest-type">👨 成人男性: ${customer.adultMen}名</div>
                    <div class="guest-type">👩 成人女性: ${customer.adultWomen}名</div>
                    <div class="guest-type">🧒 小学生: ${customer.children}名</div>
                    <div class="guest-type">👶 幼児(食事有): ${customer.infantsWithMeal}名</div>
                    <div class="guest-type">👶 幼児(食事無): ${customer.infantsNoMeal}名</div>
                    <div class="total-guests-detail">
                        <strong>合計: ${customer.totalGuests}名</strong>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>予約情報 / Booking Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>予約経路 / Source:</strong> ${this.getSourceText(customer.bookingSource)}
                    </div>
                    <div class="detail-item">
                        <strong>知ったきっかけ / How they knew:</strong> ${customer.howKnow || 'なし / None'}
                    </div>
                    <div class="detail-item">
                        <strong>登録者 / Registered by:</strong> ${customer.createdBy}
                    </div>
                    <div class="detail-item">
                        <strong>登録日時 / Registration:</strong> ${new Date(customer.timestamp).toLocaleString('ja-JP')}
                    </div>
                </div>
            </div>

            ${customer.additionalInfo ? `
                <div class="detail-section">
                    <h3>追加情報 / Additional Information</h3>
                    <div class="additional-info-detail">
                        ${customer.additionalInfo}
                    </div>
                </div>
            ` : ''}
        `;

        document.getElementById('customerModal').style.display = 'flex';
    }
}

function filterCustomers() {
    window.customerDB.filterCustomers();
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('regionFilter').value = '';
    document.getElementById('dateFilter').value = '';
    filterCustomers();
}

function sortTable(columnIndex) {
    window.customerDB.sortTable(columnIndex);
}

function showCustomerDetails(customerId) {
    window.customerDB.showCustomerDetails(customerId);
}

function closeCustomerModal() {
    document.getElementById('customerModal').style.display = 'none';
}

function exportData() {
    const customers = JSON.parse(localStorage.getItem('hotelGuests')) || [];
    // Remove duplicates before export
    const uniqueCustomers = customers.filter((customer, index, self) =>
        index === self.findIndex(c => c.id === customer.id)
    );
    
    const dataStr = JSON.stringify(uniqueCustomers, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `hotel-customers-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function goHome() {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    window.customerDB = new CustomerDatabase();
});