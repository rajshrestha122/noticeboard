let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        let notices = JSON.parse(localStorage.getItem('collegeNotices')) || [];

        if (!currentUser || currentUser.role !== 'student') {
            window.location.href = 'index.html';
        }

        function logout() {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }

        function formatDate(date) {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function renderNotices(filteredNotices = notices) {
            const grid = document.getElementById('noticesGrid');
            
            const relevantNotices = filteredNotices.filter(notice => {
                return notice.targetAudience === 'all' || 
                       (notice.targetAudience === 'department' && notice.department === currentUser.department) ||
                       (notice.targetAudience === 'subject' && notice.department === currentUser.department);
            });
            
            if (relevantNotices.length === 0) {
                grid.innerHTML = `
                    <div class="no-notices">
                        <h3>No notices found</h3>
                        <p>Try adjusting your search or filter criteria</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = relevantNotices.map(notice => `
                <div class="notice-card ${notice.priority}-priority">
                    <div class="notice-header">
                        <div>
                            <div class="notice-title">${notice.title}</div>
                            <span class="notice-category">${notice.category}</span>
                            ${notice.subject ? `<span class="notice-category" style="background: #9b59b6; margin-left: 5px;">${notice.subject}</span>` : ''}
                        </div>
                    </div>
                    <div class="notice-content">${notice.content}</div>
                    <div class="notice-footer">
                        <div>
                            <div class="notice-author">By: ${notice.author}</div>
                            <div style="font-size: 0.8rem; margin-top: 2px;">${formatDate(notice.date)}</div>
                        </div>
                        <span class="priority-badge priority-${notice.priority}">${notice.priority.toUpperCase()}</span>
                    </div>
                </div>
            `).join('');
        }

        function updateStats() {
            const relevantNotices = notices.filter(notice => {
                return notice.targetAudience === 'all' || 
                       (notice.targetAudience === 'department' && notice.department === currentUser.department) ||
                       (notice.targetAudience === 'subject' && notice.department === currentUser.department);
            });

            const total = relevantNotices.length;
            const highPriority = relevantNotices.filter(n => n.priority === 'high').length;
            const today = new Date().toDateString();
            const todayCount = relevantNotices.filter(n => new Date(n.date).toDateString() === today).length;
            const departmentCount = relevantNotices.filter(n => n.targetAudience === 'department').length;

            document.getElementById('totalNotices').textContent = total;
            document.getElementById('highPriorityCount').textContent = highPriority;
            document.getElementById('todayNotices').textContent = todayCount;
            document.getElementById('departmentNotices').textContent = departmentCount;
        }

        function filterNotices() {
            const searchTerm = document.getElementById('searchBox').value.toLowerCase();
            const categoryFilter = document.getElementById('categoryFilter').value;
            const priorityFilter = document.getElementById('priorityFilter').value;
            const audienceFilter = document.getElementById('audienceFilter').value;

            let filtered = notices.filter(notice => {
                const matchesSearch = notice.title.toLowerCase().includes(searchTerm) || 
                                    notice.content.toLowerCase().includes(searchTerm);
                const matchesCategory = !categoryFilter || notice.category === categoryFilter;
                const matchesPriority = !priorityFilter || notice.priority === priorityFilter;
                const matchesAudience = !audienceFilter || notice.targetAudience === audienceFilter;

                return matchesSearch && matchesCategory && matchesPriority && matchesAudience;
            });

            renderNotices(filtered);
        }

        document.getElementById('searchBox').addEventListener('input', filterNotices);
        document.getElementById('categoryFilter').addEventListener('change', filterNotices);
        document.getElementById('priorityFilter').addEventListener('change', filterNotices);
        document.getElementById('audienceFilter').addEventListener('change', filterNotices);

        document.getElementById('userInfo').innerHTML = `
            <div><strong>${currentUser.name}</strong></div>
            <div>Roll No: ${currentUser.rollNo}</div>
            <div>Department: ${currentUser.department}</div>
        `;

        renderNotices();
        updateStats();

        setInterval(() => {
            notices = JSON.parse(localStorage.getItem('collegeNotices')) || [];
            renderNotices();
            updateStats();
        }, 5000);