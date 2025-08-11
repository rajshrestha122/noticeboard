let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        let notices = JSON.parse(localStorage.getItem('collegeNotices')) || [];
        let facultyData = JSON.parse(localStorage.getItem('facultyData')) || [];

        if (!currentUser || currentUser.role !== 'faculty') {
            window.location.href = 'index.html';
        }

        const faculty = facultyData.find(f => f.name === currentUser.name);

        function logout() {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }

        function openModal() {
            document.getElementById('noticeModal').style.display = 'block';
            populateSubjects();
        }

        function closeModal() {
            document.getElementById('noticeModal').style.display = 'none';
            document.getElementById('noticeForm').reset();
            document.getElementById('subjectGroup').style.display = 'none';
        }

        function toggleSubjectField() {
            const audience = document.getElementById('targetAudience').value;
            const subjectGroup = document.getElementById('subjectGroup');
            
            if (audience === 'subject') {
                subjectGroup.style.display = 'block';
            } else {
                subjectGroup.style.display = 'none';
            }
        }

        function populateSubjects() {
            const subjectSelect = document.getElementById('noticeSubject');
            subjectSelect.innerHTML = '<option value="">Select Subject</option>';
            
            if (faculty && faculty.subjects) {
                faculty.subjects.forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject;
                    option.textContent = subject;
                    subjectSelect.appendChild(option);
                });
            }
        }

        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
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

        function addNotice(title, content, category, priority, targetAudience, subject) {
            const notice = {
                id: generateId(),
                title: title,
                content: content,
                category: category,
                priority: priority,
                date: new Date().toISOString(),
                author: currentUser.name,
                department: currentUser.department,
                targetAudience: targetAudience,
                subject: subject || null
            };
            
            notices.unshift(notice);
            localStorage.setItem('collegeNotices', JSON.stringify(notices));
            renderNotices();
            updateStats();
        }

        function deleteNotice(id) {
            if (confirm('Are you sure you want to delete this notice?')) {
                notices = notices.filter(notice => notice.id !== id);
                localStorage.setItem('collegeNotices', JSON.stringify(notices));
                renderNotices();
                updateStats();
            }
        }

        function renderNotices(filteredNotices = notices) {
            const grid = document.getElementById('noticesGrid');
            
            const myNotices = filteredNotices.filter(notice => notice.author === currentUser.name);
            
            if (myNotices.length === 0) {
                grid.innerHTML = `
                    <div class="no-notices">
                        <h3>No notices found</h3>
                        <p>Click "Add Notice" to create your first notice</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = myNotices.map(notice => `
                <div class="notice-card ${notice.priority}-priority">
                    <div class="notice-header">
                        <div>
                            <div class="notice-title">${notice.title}</div>
                            <span class="notice-category">${notice.category}</span>
                            ${notice.subject ? `<span class="notice-category" style="background: #9b59b6; margin-left: 5px;">${notice.subject}</span>` : ''}
                        </div>
                        <button class="delete-btn" onclick="deleteNotice('${notice.id}')">Delete</button>
                    </div>
                    <div class="notice-content">${notice.content}</div>
                    <div class="notice-footer">
                        <div>
                            <div style="font-weight: 600;">Target: ${notice.targetAudience === 'all' ? 'All Students' : notice.targetAudience === 'department' ? 'Department Students' : 'Subject Students'}</div>
                            <div style="font-size: 0.8rem; margin-top: 2px;">${formatDate(notice.date)}</div>
                        </div>
                        <span class="priority-badge priority-${notice.priority}">${notice.priority.toUpperCase()}</span>
                    </div>
                </div>
            `).join('');
        }

        function updateStats() {
            const myNotices = notices.filter(notice => notice.author === currentUser.name);
            const total = myNotices.length;
            const highPriority = myNotices.filter(n => n.priority === 'high').length;
            const today = new Date().toDateString();
            const todayCount = myNotices.filter(n => new Date(n.date).toDateString() === today).length;

            document.getElementById('totalNotices').textContent = total;
            document.getElementById('highPriorityCount').textContent = highPriority;
            document.getElementById('todayNotices').textContent = todayCount;
        }

        function filterNotices() {
            const searchTerm = document.getElementById('searchBox').value.toLowerCase();
            const categoryFilter = document.getElementById('categoryFilter').value;
            const priorityFilter = document.getElementById('priorityFilter').value;

            let filtered = notices.filter(notice => {
                const matchesSearch = notice.title.toLowerCase().includes(searchTerm) || 
                                    notice.content.toLowerCase().includes(searchTerm);
                const matchesCategory = !categoryFilter || notice.category === categoryFilter;
                const matchesPriority = !priorityFilter || notice.priority === priorityFilter;

                return matchesSearch && matchesCategory && matchesPriority;
            });

            renderNotices(filtered);
        }

        document.getElementById('noticeForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('noticeTitle').value;
            const content = document.getElementById('noticeContent').value;
            const category = document.getElementById('noticeCategory').value;
            const priority = document.getElementById('noticePriority').value;
            const targetAudience = document.getElementById('targetAudience').value;
            const subject = document.getElementById('noticeSubject').value;

            addNotice(title, content, category, priority, targetAudience, subject);
            closeModal();
        });

        document.getElementById('searchBox').addEventListener('input', filterNotices);
        document.getElementById('categoryFilter').addEventListener('change', filterNotices);
        document.getElementById('priorityFilter').addEventListener('change', filterNotices);

        window.addEventListener('click', function(e) {
            const modal = document.getElementById('noticeModal');
            if (e.target === modal) {
                closeModal();
            }
        });

        document.getElementById('userInfo').innerHTML = `
            <div><strong>${currentUser.name}</strong></div>
            <div>Department: ${currentUser.department}</div>
        `;

        if (faculty && faculty.subjects) {
            document.getElementById('subjectsList').innerHTML = faculty.subjects.map(subject => 
                `<span class="subject-tag">${subject}</span>`
            ).join('');
        }

        renderNotices();
        updateStats();